export type InteractionType = 'Meeting' | 'Call' | 'Email' | 'Virtual Meeting' | 'Conference' | 'Other';
export type SentimentType = 'Positive' | 'Neutral' | 'Negative';

export interface MaterialItem {
  id: string;
  name: string;
  category: string;
}

export interface SampleItem {
  id: string;
  name: string;
  quantity: number;
}

export interface InteractionState {
  hcpId: number | null;
  hcpName: string;
  interactionType: InteractionType;
  date: string;
  time: string;
  attendees: string;
  topicsDiscussed: string;
  materialsShared: MaterialItem[];
  samplesDistributed: SampleItem[];
  sentiment: SentimentType;
  outcomes: string;
  followUpActions: string;
  aiSuggestedFollowUps: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface LoggedInteraction extends InteractionState {
  id: string;
  createdAt: string;
}
