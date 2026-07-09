import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { InteractionState, ChatMessage, LoggedInteraction, MaterialItem, SampleItem, SentimentType, InteractionType } from '../types';

interface AppState {
  form: InteractionState;
  chatMessages: ChatMessage[];
  savedInteractions: LoggedInteraction[];
  currentView: 'log' | 'saved';
  isAiLoading: boolean;
  isVoiceModalOpen: boolean;
  isMaterialsModalOpen: boolean;
  isSamplesModalOpen: boolean;
  toastMessage: string | null;
}

const initialFormState: InteractionState = {
  hcpName: '',
  interactionType: 'Meeting',
  date: new Date().toISOString().split('T')[0].split('-').reverse().join('-'), // DD-MM-YYYY format matching screenshot 19-04-2025 style or YYYY-MM-DD
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
  attendees: '',
  topicsDiscussed: '',
  materialsShared: [],
  samplesDistributed: [],
  sentiment: 'Neutral',
  outcomes: '',
  followUpActions: '',
  aiSuggestedFollowUps: [
    'Schedule follow-up meeting in 2 weeks',
    'Send OncoBoost Phase III PDF',
    'Add Dr. Sharma to advisory board invite list'
  ]
};

// Load saved interactions from localStorage if available
const loadSavedInteractions = (): LoggedInteraction[] => {
  try {
    const stored = localStorage.getItem('hcp_saved_interactions');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load saved interactions', e);
  }
  return [
    // {
    //   id: 'int-1',
    //   hcpName: 'Dr. Jane Smith (Cardiology)',
    //   interactionType: 'Meeting',
    //   date: '19-04-2025',
    //   time: '19:36',
    //   attendees: 'Dr. Jane Smith, Mark Taylor (Rep)',
    //   topicsDiscussed: 'Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure',
    //   materialsShared: [{ id: 'mat-1', name: 'OncoBoost Phase III PDF', category: 'Clinical Study' }],
    //   samplesDistributed: [{ id: 'sam-1', name: 'OncoBoost 50mg', quantity: 5 }],
    //   sentiment: 'Positive',
    //   outcomes: 'Dr. Smith agreed to review the phase III trial results with department colleagues.',
    //   followUpActions: 'Send digital copy of safety profile study.',
    //   aiSuggestedFollowUps: ['Schedule follow-up meeting in 2 weeks', 'Send OncoBoost Phase III PDF'],
    //   createdAt: '2025-04-19T19:36:00Z'
    // }
  ];
};

const initialState: AppState = {
  form: {
    ...initialFormState,
    date: '19-04-2025', // matching screenshot
    time: '19:36',
  },
  chatMessages: [
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.',
      timestamp: 'Just now'
    }
  ],
  savedInteractions: loadSavedInteractions(),
  currentView: 'log',
  isAiLoading: false,
  isVoiceModalOpen: false,
  isMaterialsModalOpen: false,
  isSamplesModalOpen: false,
  toastMessage: null,
};

export const sendAiChatMessage = createAsyncThunk(
  'interaction/sendAiChatMessage',
  async (message: string, { getState }) => {
    // Simulate network delay and intelligent extraction for client-side SPA
    await new Promise((resolve) => setTimeout(resolve, 800));
    const lower = message.toLowerCase();
    
    let reply = `I have updated the interaction details based on your input: "${message}".`;
    const extractedUpdates: any = {};

    if (lower.includes('dr.') || lower.includes('met') || lower.includes('speak')) {
      const match = message.match(/(dr\.\s+[a-zA-Z\s]+)/i);
      if (match) {
        extractedUpdates.hcpName = match[1].trim();
      }
    }

    if (lower.includes('positive') || lower.includes('great') || lower.includes('impressed')) {
      extractedUpdates.sentiment = 'Positive';
    } else if (lower.includes('negative') || lower.includes('skeptical') || lower.includes('concern')) {
      extractedUpdates.sentiment = 'Negative';
    }

    if (lower.includes('brochure') || lower.includes('pdf') || lower.includes('study')) {
      extractedUpdates.materialsShared = ['OncoBoost Phase III Clinical Trial Summary'];
    }

    extractedUpdates.topicsDiscussed = message;

    return { reply, extractedUpdates };
  }
);

export const summarizeVoiceNote = createAsyncThunk(
  'interaction/summarizeVoiceNote',
  async (transcript: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      topicsDiscussed: transcript || 'Discussion regarding product efficacy and clinical trial data.',
      outcomes: 'Agreed to review follow-up documentation and schedule next check-in.',
      followUpActions: 'Send requested clinical trial summary and schedule meeting.',
      sentiment: 'Positive'
    };
  }
);

export const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    updateFormField: (state, action: PayloadAction<{ field: keyof InteractionState; value: any }>) => {
      (state.form as Record<string, any>)[action.payload.field] = action.payload.value;
    },
    setFormState: (state, action: PayloadAction<Partial<InteractionState>>) => {
      state.form = { ...state.form, ...action.payload };
    },
    addMaterial: (state, action: PayloadAction<MaterialItem>) => {
      if (!state.form.materialsShared.some(m => m.id === action.payload.id)) {
        state.form.materialsShared.push(action.payload);
      }
    },
    removeMaterial: (state, action: PayloadAction<string>) => {
      state.form.materialsShared = state.form.materialsShared.filter(m => m.id !== action.payload);
    },
    addSample: (state, action: PayloadAction<SampleItem>) => {
      const existing = state.form.samplesDistributed.find(s => s.name === action.payload.name);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.form.samplesDistributed.push(action.payload);
      }
    },
    removeSample: (state, action: PayloadAction<string>) => {
      state.form.samplesDistributed = state.form.samplesDistributed.filter(s => s.id !== action.payload);
    },
    setSentiment: (state, action: PayloadAction<SentimentType>) => {
      state.form.sentiment = action.payload;
    },
    addUserChatMessage: (state, action: PayloadAction<string>) => {
      state.chatMessages.push({
        id: 'msg-' + Date.now(),
        sender: 'user',
        text: action.payload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    },
    setCurrentView: (state, action: PayloadAction<'log' | 'saved'>) => {
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
    saveInteraction: (state) => {
      const newInteraction: LoggedInteraction = {
        ...state.form,
        id: 'int-' + Date.now(),
        createdAt: new Date().toISOString()
      };
      state.savedInteractions.unshift(newInteraction);
      localStorage.setItem('hcp_saved_interactions', JSON.stringify(state.savedInteractions));
      state.toastMessage = 'Interaction successfully logged and saved!';
      // Reset form to defaults
      state.form = {
        hcpName: '',
        interactionType: 'Meeting',
        date: '19-04-2025',
        time: '19:36',
        attendees: '',
        topicsDiscussed: '',
        materialsShared: [],
        samplesDistributed: [],
        sentiment: 'Neutral',
        outcomes: '',
        followUpActions: '',
        aiSuggestedFollowUps: [
          'Schedule follow-up meeting in 2 weeks',
          'Send OncoBoost Phase III PDF',
          'Add Dr. Sharma to advisory board invite list'
        ]
      };
    },
    resetForm: (state) => {
      state.form = {
        hcpName: '',
        interactionType: 'Meeting',
        date: '19-04-2025',
        time: '19:36',
        attendees: '',
        topicsDiscussed: '',
        materialsShared: [],
        samplesDistributed: [],
        sentiment: 'Neutral',
        outcomes: '',
        followUpActions: '',
        aiSuggestedFollowUps: [
          'Schedule follow-up meeting in 2 weeks',
          'Send OncoBoost Phase III PDF',
          'Add Dr. Sharma to advisory board invite list'
        ]
      };
      state.toastMessage = 'Form reset successfully.';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendAiChatMessage.pending, (state) => {
        state.isAiLoading = true;
      })
      .addCase(sendAiChatMessage.fulfilled, (state, action) => {
        state.isAiLoading = false;
        const { reply, extractedUpdates } = action.payload;

        state.chatMessages.push({
          id: 'msg-' + Date.now(),
          sender: 'assistant',
          text: reply || 'I have updated the interaction details based on your input.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        if (extractedUpdates) {
          if (extractedUpdates.hcpName) state.form.hcpName = extractedUpdates.hcpName;
          if (extractedUpdates.interactionType) state.form.interactionType = extractedUpdates.interactionType;
          if (extractedUpdates.attendees) state.form.attendees = extractedUpdates.attendees;
          if (extractedUpdates.topicsDiscussed) {
            state.form.topicsDiscussed = state.form.topicsDiscussed 
              ? state.form.topicsDiscussed + '\n' + extractedUpdates.topicsDiscussed 
              : extractedUpdates.topicsDiscussed;
          }
          if (extractedUpdates.sentiment) state.form.sentiment = extractedUpdates.sentiment;
          if (extractedUpdates.outcomes) state.form.outcomes = extractedUpdates.outcomes;
          if (extractedUpdates.followUpActions) state.form.followUpActions = extractedUpdates.followUpActions;
          if (extractedUpdates.materialsShared && Array.isArray(extractedUpdates.materialsShared)) {
            (extractedUpdates.materialsShared as string[]).forEach((matName: string) => {
              if (!state.form.materialsShared.some(m => m.name === matName)) {
                state.form.materialsShared.push({
                  id: 'mat-' + Math.random().toString(36).substring(2, 7),
                  name: matName,
                  category: 'Document'
                });
              }
            });
          }
        }
      })
      .addCase(sendAiChatMessage.rejected, (state, action) => {
        state.isAiLoading = false;
        state.chatMessages.push({
          id: 'msg-' + Date.now(),
          sender: 'assistant',
          text: 'Sorry, I encountered an error communicating with the AI service. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      })
      .addCase(summarizeVoiceNote.fulfilled, (state, action) => {
        const data = action.payload;
        if (data.topicsDiscussed) state.form.topicsDiscussed = data.topicsDiscussed;
        if (data.outcomes) state.form.outcomes = data.outcomes;
        if (data.followUpActions) state.form.followUpActions = data.followUpActions;
        if (data.sentiment) state.form.sentiment = data.sentiment as SentimentType;
        state.toastMessage = 'Voice note successfully transcribed and summarized!';
      });
  }
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
  saveInteraction,
  resetForm
} = interactionSlice.actions;

export default interactionSlice.reducer;
