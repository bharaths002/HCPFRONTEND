# AI-First HCP CRM — Frontend

A React + TypeScript frontend for an **AI-powered Healthcare Professional (HCP) Interaction CRM**.

The application provides two ways to log an HCP interaction:

* **Structured Form** — manually enter interaction details.
* **AI Chat Assistant** — describe the interaction conversationally and let the AI extract relevant information.

Both interfaces work with the **same interaction state**, so information extracted by the AI is automatically reflected in the structured form.

---

## Features

* AI-assisted HCP interaction logging
* Structured interaction form
* HCP, interaction type, date/time, sentiment, materials and samples
* AI-extracted fields synchronized with the form
* Saved interaction history
* Materials and samples selection modals
* Voice interaction support
* Persistent AI conversation using `thread_id`

---

## Tech Stack

* **React + TypeScript** — UI development
* **Vite** — development and build tool
* **Redux Toolkit** — application state management
* **Axios** — API communication
* **Tailwind CSS** — styling

Backend integration:

* **FastAPI**
* **LangGraph**
* **LLM**
* **PostgreSQL**

---

## Project Structure

```text
src/
├── components/
│   ├── InteractionForm.tsx
│   ├── AiAssistantChat.tsx
│   ├── SavedInteractions.tsx
│   ├── MaterialsModal.tsx
│   ├── SamplesModal.tsx
│   ├── VoiceModal.tsx
│   ├── Header.tsx
│   └── Toast.tsx
│
├── store/
│   ├── store.ts
│   └── interactionSlice.ts
│
├── services/
│   ├── api.ts
│   └── mappers.ts
│
└── types.ts
```

### Main Responsibilities

**Components**
Contains the UI components for the interaction form, AI chat, history, modals and navigation.

**Redux Store**
`interactionSlice.ts` manages the shared interaction draft, chat state and backend requests.

**Services**
`api.ts` contains Axios API calls, while `mappers.ts` handles frontend ↔ backend data conversion.

**Types**
`types.ts` contains shared TypeScript interfaces and types.

---

## Application Flow

### AI-Assisted Interaction

```text
User
  ↓
AI Chat Assistant
  ↓
Backend / LangGraph
  ↓
AI extracts interaction details
  ↓
Redux State
  ↓
Structured Form updated
  ↓
User reviews / edits
  ↓
Save Interaction
```

### Structured Interaction

```text
User
  ↓
Interaction Form
  ↓
Redux State
  ↓
Backend API
  ↓
Saved Interaction
```

Both workflows ultimately create the same type of interaction.

---

## State Management

The application uses a **single Redux interaction state** for both the form and AI assistant.

```text
             Interaction State
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
   Interaction Form      AI Assistant
          │                   │
          └─────────┬─────────┘
                    ↓
              Backend API
```

This allows AI-extracted information to appear directly in the form without maintaining separate drafts.

---

## Backend Integration

The frontend communicates with the FastAPI backend through Axios.

```text
React UI
   ↓
Redux Thunks
   ↓
API Services
   ↓
Axios
   ↓
FastAPI Backend
   ↓
LangGraph / Database
```

The main backend interactions handled by Redux are:

* `sendAiChatMessage` — sends messages to the AI chat endpoint.
* `saveInteractionThunk` — saves the interaction.
* `fetchSavedInteractions` — retrieves saved interactions.

---

## Conversation Persistence

The AI conversation uses a `thread_id` stored in `localStorage`.

This allows the backend's LangGraph checkpointer to resume the conversation state after a page refresh.

Currently, the backend conversation state persists, but the previously displayed chat messages are not automatically restored in the UI after refresh.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Start the frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

The FastAPI backend must also be running for API-backed features to work.

---

## Architecture Overview

```text
┌─────────────────────────────────────┐
│          React + TypeScript         │
│                                     │
│  Interaction Form ↔ AI Chat        │
│             │                       │
│        Redux Toolkit                │
│             │                       │
│        Axios / API Layer            │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│            FastAPI Backend          │
│                                     │
│       LangGraph + LLM + DB          │
└─────────────────────────────────────┘
```

## Project Goal

The goal of the project is to combine **conversational AI with traditional CRM data entry**, allowing users to log HCP interactions naturally while still providing a structured and editable representation of the captured information.
