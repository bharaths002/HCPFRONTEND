import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  InteractionState,
  ChatMessage,
  LoggedInteraction,
  MaterialItem,
  SampleItem,
  SentimentType,
} from "../types";
import { api } from "../services/api";
import { formToCreatePayload, draftToFormPatch } from "../services/mappers";
import type { RootState } from "./store";

interface AppState {
  form: InteractionState;
  chatMessages: ChatMessage[];
  savedInteractions: LoggedInteraction[];
  currentView: "log" | "saved";
  isAiLoading: boolean;
  isVoiceModalOpen: boolean;
  isMaterialsModalOpen: boolean;
  isSamplesModalOpen: boolean;
  toastMessage: string | null;
  // --- backend-session tracking (new) ---
  chatThreadId: string; // one per browser session — same id across the whole conversation
  currentInteractionId: number | null; // set once the graph actually logs something this session
  awaitingConfirmation: boolean; // true when the agent is waiting on a yes/no before logging
}

// Single source of truth for "what does an empty form look like" — used for
// both the initial load and every reset, so there's no duplicated hardcoded
// literal drifting out of sync.
function createEmptyForm(): InteractionState {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    hcpName: "",
    hcpId: null,
    interactionType: "Meeting",
    date: `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    attendees: "",
    topicsDiscussed: "",
    materialsShared: [],
    samplesDistributed: [],
    sentiment: "Neutral",
    outcomes: "",
    followUpActions: "",
    aiSuggestedFollowUps: [], // populated by the backend after a real log, never canned
  };
}

// Load any locally-cached saved interactions (bridge until a backend
// "list all interactions" endpoint exists — see SavedInteractions.tsx notes).
function loadSavedInteractions(): LoggedInteraction[] {
  try {
    const stored = localStorage.getItem("hcp_saved_interactions");
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load saved interactions", e);
  }
  return [];
}

const initialState: AppState = {
  form: createEmptyForm(),
  chatMessages: [
    {
      id: "msg-1",
      sender: "assistant",
      text: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.',
      timestamp: "Just now",
    },
  ],
  savedInteractions: loadSavedInteractions(),
  currentView: "log",
  isAiLoading: false,
  isVoiceModalOpen: false,
  isMaterialsModalOpen: false,
  isSamplesModalOpen: false,
  toastMessage: null,
  chatThreadId: crypto.randomUUID(),
  currentInteractionId: null,
  awaitingConfirmation: false,
};

// --- Real backend call: conversational path ---
export const sendAiChatMessage = createAsyncThunk<
  {
    reply: string;
    draft: Record<string, any>;
    interaction_id: number | null;
    awaiting_confirmation: boolean;
  },
  string,
  { state: RootState }
>("interaction/sendAiChatMessage", async (message, { getState }) => {
  const state = getState();
  return await api.sendChatMessage(state.interaction.chatThreadId, message);
});

// --- Real backend call: voice note also goes through the SAME chat/extraction
// endpoint — transcribing speech into structured fields is the identical NLU
// job as parsing a typed chat message, so there's no separate fake path for it.
export const summarizeVoiceNote = createAsyncThunk<
  {
    reply: string;
    draft: Record<string, any>;
    interaction_id: number | null;
    awaiting_confirmation: boolean;
  },
  string,
  { state: RootState }
>("interaction/summarizeVoiceNote", async (transcript, { getState }) => {
  const state = getState();
  return await api.sendChatMessage(state.interaction.chatThreadId, transcript);
});

// --- Real backend call: structured-form path (no LLM) ---
export const saveInteractionThunk = createAsyncThunk<
  { interactionId: number; hcpId: number },
  void,
  { state: RootState; rejectValue: string }
>(
  "interaction/saveInteractionThunk",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const form = state.interaction.form;

    let hcpId = form.hcpId;
    if (!hcpId) {
      const matches = await api.searchHcps(form.hcpName);
      if (matches.length === 1) {
        hcpId = matches[0].id;
      } else if (matches.length > 1) {
        return rejectWithValue(
          `Multiple HCPs match "${form.hcpName}" — please be more specific`,
        );
      } else {
        // No existing match — treat this as a brand-new HCP and create them.
        const created = await api.createHcp(form.hcpName);
        hcpId = created.id;
      }
    }

    const payload = formToCreatePayload(form, hcpId);
    const result = await api.createInteraction(payload);

    if (!result.success || result.interaction_id == null) {
      return rejectWithValue(result.error || "Failed to log interaction");
    }
    return { interactionId: result.interaction_id, hcpId };
  },
);

export const interactionSlice = createSlice({
  name: "interaction",
  initialState,
  reducers: {
    updateFormField: (
      state,
      action: PayloadAction<{ field: keyof InteractionState; value: any }>,
    ) => {
      (state.form as Record<string, any>)[action.payload.field] =
        action.payload.value;
      // Typing a new HCP name manually invalidates any previously-resolved id.
      if (action.payload.field === "hcpName") {
        state.form.hcpId = null;
      }
    },
    setFormState: (state, action: PayloadAction<Partial<InteractionState>>) => {
      state.form = { ...state.form, ...action.payload };
    },
    addMaterial: (state, action: PayloadAction<MaterialItem>) => {
      if (!state.form.materialsShared.some((m) => m.id === action.payload.id)) {
        state.form.materialsShared.push(action.payload);
      }
    },
    removeMaterial: (state, action: PayloadAction<string>) => {
      state.form.materialsShared = state.form.materialsShared.filter(
        (m) => m.id !== action.payload,
      );
    },
    addSample: (state, action: PayloadAction<SampleItem>) => {
      const existing = state.form.samplesDistributed.find(
        (s) => s.name === action.payload.name,
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.form.samplesDistributed.push(action.payload);
      }
    },
    removeSample: (state, action: PayloadAction<string>) => {
      state.form.samplesDistributed = state.form.samplesDistributed.filter(
        (s) => s.id !== action.payload,
      );
    },
    setSentiment: (state, action: PayloadAction<SentimentType>) => {
      state.form.sentiment = action.payload;
    },
    addUserChatMessage: (state, action: PayloadAction<string>) => {
      state.chatMessages.push({
        id: "msg-" + Date.now(),
        sender: "user",
        text: action.payload,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    },
    setCurrentView: (state, action: PayloadAction<"log" | "saved">) => {
      state.currentView = action.payload;
    },
    setVoiceModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isVoiceModalOpen = action.payload;
    },
    setMaterialsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isMaterialsModalOpen = action.payload;
    },
    setSamplesModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSamplesModalOpen = action.payload;
    },
    setToastMessage: (state, action: PayloadAction<string | null>) => {
      state.toastMessage = action.payload;
    },
    resetForm: (state) => {
      state.form = createEmptyForm();
      state.currentInteractionId = null;
      state.awaitingConfirmation = false;
      state.toastMessage = "Form reset successfully.";
    },
  },
  extraReducers: (builder) => {
    builder
      // --- chat ---
      .addCase(sendAiChatMessage.pending, (state) => {
        state.isAiLoading = true;
      })
      .addCase(sendAiChatMessage.fulfilled, (state, action) => {
        state.isAiLoading = false;
        const { reply, draft, interaction_id, awaiting_confirmation } =
          action.payload;

        state.chatMessages.push({
          id: "msg-" + Date.now(),
          sender: "assistant",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });

        state.form = { ...state.form, ...draftToFormPatch(draft) };
        state.currentInteractionId = interaction_id;
        state.awaitingConfirmation = awaiting_confirmation;

        // If the backend just logged this (interaction_id newly present),
        // mirror it into the local saved-interactions cache — see
        // SavedInteractions.tsx notes re: the pending "list all" endpoint.
        if (interaction_id) {
          const cached: LoggedInteraction = {
            ...state.form,
            id: "int-" + interaction_id,
            createdAt: new Date().toISOString(),
          };
          state.savedInteractions.unshift(cached);
          localStorage.setItem(
            "hcp_saved_interactions",
            JSON.stringify(state.savedInteractions),
          );
        }
      })
      .addCase(sendAiChatMessage.rejected, (state) => {
        state.isAiLoading = false;
        state.chatMessages.push({
          id: "msg-" + Date.now(),
          sender: "assistant",
          text: "Sorry, I encountered an error communicating with the AI service. Please try again.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      })

      // --- voice note (same backend path as chat) ---
      .addCase(summarizeVoiceNote.pending, (state) => {
        state.isAiLoading = true;
      })
      .addCase(summarizeVoiceNote.fulfilled, (state, action) => {
        state.isAiLoading = false;
        const { draft, interaction_id, awaiting_confirmation } = action.payload;
        state.form = { ...state.form, ...draftToFormPatch(draft) };
        state.currentInteractionId = interaction_id;
        state.awaitingConfirmation = awaiting_confirmation;
        state.toastMessage =
          "Voice note successfully transcribed and summarized!";
      })
      .addCase(summarizeVoiceNote.rejected, (state) => {
        state.isAiLoading = false;
        state.toastMessage = "Failed to process voice note. Please try again.";
      })

      // --- structured-form save ---
      .addCase(saveInteractionThunk.fulfilled, (state, action) => {
        const { interactionId } = action.payload;
        const cached: LoggedInteraction = {
          ...state.form,
          id: "int-" + interactionId,
          createdAt: new Date().toISOString(),
        };
        state.savedInteractions.unshift(cached);
        localStorage.setItem(
          "hcp_saved_interactions",
          JSON.stringify(state.savedInteractions),
        );
        state.toastMessage = "Interaction successfully logged and saved!";
        state.form = createEmptyForm();
        state.currentInteractionId = null;
        state.awaitingConfirmation = false;
      })
      .addCase(saveInteractionThunk.rejected, (state, action) => {
        state.toastMessage = action.payload || "Failed to log interaction.";
      });
  },
});

export const {
  updateFormField,
  setFormState,
  addMaterial,
  removeMaterial,
  addSample,
  removeSample,
  setSentiment,
  addUserChatMessage,
  setCurrentView,
  setVoiceModalOpen,
  setMaterialsModalOpen,
  setSamplesModalOpen,
  setToastMessage,
  resetForm,
} = interactionSlice.actions;

export default interactionSlice.reducer;
