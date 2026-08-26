AI-First HCP CRM — Frontend

React/TypeScript frontend for the HCP interaction logging module — a structured form and an AI chat assistant side by side, both writing to the same backend.

Tech Stack
React + TypeScript, built with Vite
Redux Toolkit for state management
Axios for API calls
Tailwind CSS for styling
Project Structure
src/
  components/
    InteractionForm.tsx      # structured form — HCP, type, date/time, materials, samples, sentiment, etc.
    AiAssistantChat.tsx      # chat panel — the conversational logging path
    SavedInteractions.tsx    # history view, fetched live from the backend
    MaterialsModal.tsx / SamplesModal.tsx / VoiceModal.tsx   # popup pickers
    Header.tsx / Toast.tsx
  store/
    store.ts                 # Redux store setup
    interactionSlice.ts      # all app state + the thunks that call the backend
  services/
    api.ts                   # axios calls to every backend endpoint
    mappers.ts                # converts data shapes between frontend and backend
  types.ts                    # shared TypeScript types
State Management

A single Redux slice (interactionSlice.ts) holds both the structured form's fields and the chat conversation, because they represent the same underlying draft viewed two ways — when the AI extracts a field from a chat message, it's mirrored live into the form fields.

Three async thunks handle every backend interaction:

sendAiChatMessage — posts to the conversational /chat endpoint
saveInteractionThunk — posts to the structured-form endpoint, auto-resolving or auto-creating the HCP first
fetchSavedInteractions — pulls the real, current interaction list from the backend (used by both the history view and the nav bar's count badge, so they can never disagree)
The Mapping Layer (services/mappers.ts)

The frontend's UI-friendly values (e.g. "Meeting", "Positive") and the backend's database-native values (e.g. "meeting", "positive") differ in casing — this file converts between them in both directions, plus handles date/time splitting and combining, and shape conversion for materials/samples lists.

Conversation Persistence

The chat's thread_id is persisted in localStorage, so the backend's LangGraph checkpointer can resume the same underlying conversation state (draft, confirmation status) across a page refresh — though the visibly-displayed chat bubbles reset on refresh, since only the backend's memory (not the rendered message list) is restored automatically.

Setup
bash
npm install

Create a .env file:

VITE_API_BASE_URL=http://localhost:8000/api
bash
npm run dev    # starts at http://localhost:5173

Requires the backend running locally (see backend README) for any of the API-backed features to work — this is a pure frontend with no mock/offline mode.