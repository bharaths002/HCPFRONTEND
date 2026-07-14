import { InteractionState, MaterialItem, SampleItem, InteractionType, SentimentType } from '../types';

// --- Interaction type: frontend Title Case <-> backend lowercase enum ---
// Direct 1:1 mapping — frontend options now match the backend enum exactly.
const TYPE_TO_BACKEND: Record<InteractionType, string> = {
  'Meeting': 'meeting',
  'Call': 'call',
  'Email': 'email',
  'Virtual Meeting': 'virtual_meeting',
  'Conference': 'conference',
  'Other': 'other',
};

const TYPE_FROM_BACKEND: Record<string, InteractionType> = {
  meeting: 'Meeting',
  call: 'Call',
  email: 'Email',
  virtual_meeting: 'Virtual Meeting',
  conference: 'Conference',
  other: 'Other',
};

const SENTIMENT_TO_BACKEND: Record<SentimentType, string> = {
  Positive: 'positive',
  Neutral: 'neutral',
  Negative: 'negative',
};

const SENTIMENT_FROM_BACKEND: Record<string, SentimentType> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
};

// "DD-MM-YYYY" + "HH:MM" -> "YYYY-MM-DDTHH:MM:00"
function combineDateTime(date: string, time: string): string {
  const [day, month, year] = date.split('-');
  return `${year}-${month}-${day}T${time}:00`;
}

// ISO string -> { date: "DD-MM-YYYY", time: "HH:MM" }
export function splitDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${pad(d.getUTCDate())}-${pad(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`,
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`,
  };
}

export interface BackendSavedInteraction {
  id: number;
  hcp_id: number;
  hcp_name: string;
  interaction_type: string;
  interaction_datetime: string;
  topics_discussed: string | null;
  materials_shared: { name: string }[];
  samples_distributed: { name: string; quantity: number }[];
  sentiment: string | null;
  outcomes: string | null;
  follow_up_actions: string[];
  ai_suggested_follow_ups: string[];
  source: string;
}

// Backend list-all response -> the shape SavedInteractions.tsx already renders.
export function backendInteractionToDisplay(item: BackendSavedInteraction) {
  const { date, time } = splitDateTime(item.interaction_datetime);
  return {
    id: String(item.id),
    hcpName: item.hcp_name,
    interactionType: TYPE_FROM_BACKEND[item.interaction_type] ?? 'Meeting',
    date,
    time,
    attendees: '',
    topicsDiscussed: item.topics_discussed ?? '',
    materialsShared: item.materials_shared.map((m, i) => ({
      id: `mat-${item.id}-${i}`,
      name: m.name,
      category: 'Document',
    })),
    samplesDistributed: item.samples_distributed.map((s, i) => ({
      id: `sam-${item.id}-${i}`,
      name: s.name,
      quantity: s.quantity,
    })),
    sentiment: (item.sentiment && SENTIMENT_FROM_BACKEND[item.sentiment]) || 'Neutral',
    outcomes: item.outcomes ?? '',
    followUpActions: item.follow_up_actions.map((a) => `• ${a}`).join('\n'),
    aiSuggestedFollowUps: item.ai_suggested_follow_ups,
    createdAt: item.interaction_datetime,
  };
}

export interface InteractionCreatePayload {
  hcp_id: number;
  interaction_type: string;
  interaction_datetime: string;
  topics_discussed: string;
  attendees: string[];
  materials_shared: { name: string }[];
  samples_distributed: { name: string; quantity: number }[];
  sentiment: string | null;
  outcomes: string | null;
  follow_up_actions: string[];
}

// Frontend form state -> backend request body for POST /interactions
export function formToCreatePayload(form: InteractionState, hcpId: number): InteractionCreatePayload {
  return {
    hcp_id: hcpId,
    interaction_type: TYPE_TO_BACKEND[form.interactionType] ?? 'other',
    interaction_datetime: combineDateTime(form.date, form.time),
    topics_discussed: form.topicsDiscussed,
    attendees: form.attendees.split(',').map((s) => s.trim()).filter(Boolean),
    materials_shared: form.materialsShared.map((m) => ({ name: m.name })),
    samples_distributed: form.samplesDistributed.map((s) => ({ name: s.name, quantity: s.quantity })),
    sentiment: SENTIMENT_TO_BACKEND[form.sentiment] ?? null,
    outcomes: form.outcomes || null,
    follow_up_actions: form.followUpActions
      .split('\n')
      .map((s) => s.replace(/^[•\-\s]+/, '').trim())
      .filter(Boolean),
  };
}

// Backend chat draft (partial, snake_case) -> partial frontend form state,
// used to live-update the structured form as the chat conversation fills it in.
export function draftToFormPatch(draft: Record<string, any>): Partial<InteractionState> {
  const patch: Partial<InteractionState> = {};

  if (draft.interaction_type) {
    patch.interactionType = TYPE_FROM_BACKEND[draft.interaction_type] ?? 'Meeting';
  }
  if (draft.interaction_datetime) {
    const { date, time } = splitDateTime(draft.interaction_datetime);
    patch.date = date;
    patch.time = time;
  }
  if (draft.topics_discussed) patch.topicsDiscussed = draft.topics_discussed;
  if (draft.attendees) patch.attendees = draft.attendees.join(', ');
  if (draft.sentiment) patch.sentiment = SENTIMENT_FROM_BACKEND[draft.sentiment] ?? 'Neutral';
  if (draft.outcomes) patch.outcomes = draft.outcomes;

  if (draft.materials_shared) {
    patch.materialsShared = draft.materials_shared.map((m: any, i: number): MaterialItem => ({
      id: `mat-${i}-${m.name}`,
      name: m.name,
      category: 'Document',
    }));
  }
  if (draft.samples_distributed) {
    patch.samplesDistributed = draft.samples_distributed.map((s: any, i: number): SampleItem => ({
      id: `sam-${i}-${s.name}`,
      name: s.name,
      quantity: s.quantity,
    }));
  }
  if (draft.follow_up_actions) {
    patch.followUpActions = draft.follow_up_actions.map((a: string) => `• ${a}`).join('\n');
  }
  if (draft.ai_suggested_follow_ups) {
    patch.aiSuggestedFollowUps = draft.ai_suggested_follow_ups;
  }
  if (draft.hcp_name_as_typed) {
    patch.hcpName = draft.hcp_name_as_typed;
  }

  return patch;
}