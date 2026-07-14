import axios from 'axios';
import { InteractionCreatePayload, BackendSavedInteraction } from './mappers';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export interface ChatApiResponse {
  reply: string;
  draft: Record<string, any>;
  interaction_id: number | null;
  awaiting_confirmation: boolean;
}

export interface HcpMatch {
  id: number;
  name: string;
  specialty: string | null;
  hospital_affiliation: string | null;
}

export interface InteractionActionResult {
  success: boolean;
  interaction_id: number | null;
  error: string | null;
}

export interface InteractionHistoryItem {
  id: number;
  interaction_type: string;
  interaction_datetime: string;
  topics_discussed: string | null;
  sentiment: string | null;
  outcomes: string | null;
}

export const api = {
  async sendChatMessage(threadId: string, message: string, repId?: number): Promise<ChatApiResponse> {
    const { data } = await client.post<ChatApiResponse>('/chat', {
      thread_id: threadId,
      message,
      rep_id: repId ?? null,
    });
    return data;
  },

  async searchHcps(query: string): Promise<HcpMatch[]> {
    const { data } = await client.get<HcpMatch[]>('/hcps/search', { params: { q: query } });
    return data;
  },

  async createHcp(name: string, specialty?: string, hospitalAffiliation?: string): Promise<HcpMatch> {
    const { data } = await client.post<HcpMatch>('/hcps', {
      name,
      specialty: specialty ?? null,
      hospital_affiliation: hospitalAffiliation ?? null,
    });
    return data;
  },

  async createInteraction(payload: InteractionCreatePayload): Promise<InteractionActionResult> {
    try {
      const { data } = await client.post<InteractionActionResult>('/interactions', payload);
      return data;
    } catch (err: any) {
      // Backend returns 400 with {detail: "..."} on validation failures (e.g. bad HCP id).
      const detail = err?.response?.data?.detail;
      return { success: false, interaction_id: null, error: detail || 'Request failed' };
    }
  },

  async updateInteraction(interactionId: number, payload: Record<string, any>): Promise<InteractionActionResult> {
    try {
      const { data } = await client.patch<InteractionActionResult>(`/interactions/${interactionId}`, payload);
      return data;
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      return { success: false, interaction_id: null, error: detail || 'Request failed' };
    }
  },

  async getInteractionHistory(hcpId: number, limit = 5): Promise<InteractionHistoryItem[]> {
    const { data } = await client.get<InteractionHistoryItem[]>(`/interactions/hcp/${hcpId}`, { params: { limit } });
    return data;
  },

  async listInteractions(limit = 50): Promise<BackendSavedInteraction[]> {
    const { data } = await client.get<BackendSavedInteraction[]>('/interactions', { params: { limit } });
    return data;
  },
};