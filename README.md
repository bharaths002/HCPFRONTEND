# AI-First HCP CRM — Frontend

A React + TypeScript frontend for an **AI-powered Healthcare Professional (HCP) Interaction CRM**.

The application provides two ways for users to record an HCP interaction:

* **Structured Interaction Form** — manually enter interaction details through a traditional form.
* **AI Chat Assistant** — describe the interaction conversationally and allow the AI assistant to extract the relevant information automatically.

Both approaches operate on the **same interaction draft and backend**, allowing information extracted through the AI assistant to be reflected immediately in the structured form.

---

## Overview

The AI-First HCP CRM is designed to simplify and accelerate the process of recording interactions between field users and Healthcare Professionals (HCPs).

Instead of requiring users to manually complete every field, the application provides an AI-assisted conversational workflow.

For example, a user can describe an interaction such as:

> "I met Dr. Kumar today. We discussed the new diabetes medication and he was very positive about it."

The AI assistant can identify relevant information such as:

* HCP
* Interaction type
* Date and time
* Topics discussed
* Sentiment
* Materials
* Samples
* Other interaction details

The extracted information is synchronized with the structured form, allowing the user to review and edit the information before saving the interaction.

---

# Key Features

### AI-Assisted Interaction Logging

Users can describe an HCP interaction naturally through the chat interface.

The AI assistant processes the conversation and extracts structured information that can be used to populate the interaction draft.

### Structured Interaction Form

Users can manually enter or modify interaction details including:

* HCP
* Interaction type
* Date
* Time
* Materials
* Samples
* Sentiment
* Additional interaction information

### Real-Time AI → Form Synchronization

The AI assistant and structured form represent the same underlying interaction draft.

When the AI extracts a field from the conversation, the corresponding form field is updated automatically.

This allows users to:

1. Start with the AI assistant.
2. Let the AI populate the interaction.
3. Review the extracted information in the form.
4. Manually correct or complete missing fields.
5. Save the final interaction.

### Interaction History

Previously saved interactions are retrieved directly from the backend.

The same backend data is used by:

* The Saved Interactions/history screen.
* The navigation bar interaction count.

This ensures that the displayed history and interaction count are always based on the same source of truth.

### Materials and Samples

Dedicated modal components allow users to select materials and samples associated with an interaction.

### Voice Interaction

The frontend includes a voice interaction modal that can be used as part of the conversational interaction workflow.

### Conversation Persistence

The AI conversation uses a persistent `thread_id`.

The thread ID is stored in browser `localStorage`, allowing the backend conversation state to be resumed after a page refresh.

The backend uses LangGraph's checkpointer to maintain the underlying conversational state.

---

# Application Architecture

The frontend follows a component-based React architecture with a centralized Redux state layer and a dedicated API/mapping layer.

```text
                         ┌──────────────────────────┐
                         │        React UI          │
                         └────────────┬─────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
          ┌─────────▼─────────┐              ┌─────────▼─────────┐
          │ Interaction Form  │              │   AI Chat         │
          │                   │              │   Assistant       │
          └─────────┬─────────┘              └─────────┬─────────┘
                    │                                  │
                    └────────────────┬─────────────────┘
                                     │
                            ┌────────▼─────────┐
                            │ Redux Toolkit    │
                            │ interactionSlice │
                            └────────┬─────────┘
                                     │
                              ┌──────▼───────┐
                              │ API Services │
                              │    Axios     │
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │ Mapper Layer │
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                              │ FastAPI      │
                              │ Backend      │
                              └──────────────┘
```

The frontend is intentionally separated into:

* UI components
* State management
* API communication
* Data transformation
* Type definitions

This keeps the application easier to maintain and makes the frontend/backend contract explicit.

---

# Project Structure

```text
src/
│
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

---

# Folder and File Responsibilities

## `components/`

Contains the application's React UI components.

### `InteractionForm.tsx`

The main structured interaction form.

Responsible for displaying and editing interaction information such as:

* HCP
* Interaction type
* Date/time
* Materials
* Samples
* Sentiment
* Other interaction fields

The form is connected to Redux state, so values extracted by the AI assistant can appear here automatically.

---

### `AiAssistantChat.tsx`

Provides the conversational AI interface.

Users can describe an interaction naturally instead of manually entering every field.

The component:

* Displays the conversation.
* Accepts user messages.
* Sends messages to the backend AI chat endpoint.
* Receives AI responses and extracted fields.
* Updates the shared Redux interaction state.

---

### `SavedInteractions.tsx`

Displays previously saved HCP interactions.

The component retrieves the latest interaction data from the backend through the `fetchSavedInteractions` Redux thunk.

The backend remains the source of truth for saved interaction data.

---

### `MaterialsModal.tsx`

Provides a UI for selecting materials associated with an interaction.

---

### `SamplesModal.tsx`

Provides a UI for selecting samples associated with an interaction.

---

### `VoiceModal.tsx`

Provides the voice interaction UI used as part of the interaction logging workflow.

---

### `Header.tsx`

Contains the application's top-level navigation/header elements.

It also displays the interaction count retrieved from the same backend data used by the interaction history.

---

### `Toast.tsx`

Reusable notification component used to provide success, error, and informational feedback to users.

---

# State Management

The application uses **Redux Toolkit** for centralized state management.

The primary state is maintained in:

```text
src/store/interactionSlice.ts
```

A single interaction slice manages both:

* Structured form state
* AI conversation state

This design is intentional.

The form and AI assistant are not independent workflows. They are two different interfaces for editing the **same interaction draft**.

```text
                 Interaction Draft
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
   Structured Form             AI Assistant
          │                         │
          └────────────┬────────────┘
                       │
                Redux State
```

For example, if the AI assistant identifies:

```text
sentiment = positive
```

the Redux state is updated and the structured form reflects the same value.

This prevents the two interfaces from maintaining separate versions of the interaction.

---

# Redux Async Thunks

The interaction slice contains three primary async thunks responsible for communication with the backend.

## `sendAiChatMessage`

Responsible for sending conversational messages to the backend AI chat endpoint.

Flow:

```text
User Message
     ↓
AiAssistantChat
     ↓
sendAiChatMessage
     ↓
API Service
     ↓
FastAPI /chat endpoint
     ↓
AI / LangGraph processing
     ↓
Response + extracted fields
     ↓
Redux State
     ↓
Form + Chat UI
```

---

## `saveInteractionThunk`

Responsible for saving the completed interaction.

Before saving, the workflow can resolve the associated HCP:

```text
Interaction Draft
       ↓
Resolve HCP
       ↓
Existing HCP?
   ┌───┴───┐
   │       │
  Yes      No
   │       │
   │    Create HCP
   │       │
   └───┬───┘
       ↓
Save Interaction
```

This allows the frontend workflow to handle interactions where the HCP already exists as well as cases where an HCP needs to be created.

---

## `fetchSavedInteractions`

Retrieves the current list of saved interactions from the backend.

This thunk is shared by:

* Saved Interactions screen
* Navigation/header interaction count

Using the same backend request ensures that both parts of the UI are based on the same data source.

---

# API Layer

All backend communication is centralized in:

```text
src/services/api.ts
```

The frontend uses **Axios** to communicate with the FastAPI backend.

Instead of placing API requests directly inside UI components, API calls are kept in the service layer.

This provides a cleaner separation:

```text
React Component
      ↓
Redux Thunk
      ↓
API Service
      ↓
Axios
      ↓
FastAPI Backend
```

This approach also makes it easier to change API endpoints or request handling without modifying multiple UI components.

---

# Mapping Layer

Frontend and backend do not always use identical data representations.

The mapping logic is centralized in:

```text
src/services/mappers.ts
```

The mapper converts data between frontend-friendly and backend-native representations.

For example:

```text
Frontend                     Backend
------------------------------------------------
"Meeting"            →       "meeting"
"Positive"           →       "positive"
"Negative"           →       "negative"
```

The mapper also handles:

* Date/time conversion
* Splitting date and time values
* Combining date and time values
* Materials transformation
* Samples transformation
* Frontend ↔ backend object shape conversion

Keeping these transformations in one location prevents API-specific formatting logic from being scattered throughout the UI.

---

# Type System

Shared TypeScript types are maintained in:

```text
src/types.ts
```

These types define the structure of important application data and help provide compile-time safety across components, Redux state, and API services.

Using TypeScript helps reduce common issues such as:

* Incorrect field names
* Invalid data types
* Missing properties
* Inconsistent API payloads
* Incorrect component props

---

# AI Conversation Architecture

The AI assistant is backed by a conversational workflow implemented on the backend using **LangGraph**.

The frontend is responsible for maintaining the conversation from the user's perspective and passing messages to the backend.

The general flow is:

```text
User
 │
 ▼
AI Chat UI
 │
 ▼
Redux
 │
 ▼
Axios API Request
 │
 ▼
FastAPI Backend
 │
 ▼
LangGraph
 │
 ▼
LLM Processing
 │
 ▼
Structured Interaction Data
 │
 ▼
Frontend Redux State
 │
 ├───────────────► Chat UI
 │
 └───────────────► Interaction Form
```

This architecture allows the AI to behave as a conversational interface while the frontend still maintains a structured, editable representation of the interaction.

---

# Conversation Persistence

The AI conversation uses a `thread_id` to identify the conversation.

The frontend stores this value in browser `localStorage`.

```text
Browser
   │
   └── localStorage
          │
          └── thread_id
                 │
                 ▼
            Backend
                 │
                 ▼
          LangGraph Checkpointer
                 │
                 ▼
        Previous conversation state
```

This allows the backend to resume the underlying conversation state after a page refresh.

### Important behavior

The current implementation persists the **backend conversation state**, but does not persist the rendered chat bubble history in the frontend.

Therefore:

* The backend can resume the underlying LangGraph state.
* The `thread_id` survives a page refresh.
* The previously rendered chat messages are cleared from the visible UI after refresh unless they are explicitly reconstructed.

This distinction is important because conversation state persistence and UI message-history persistence are separate concerns.

---

# Backend Integration

The frontend is designed to work with a separate FastAPI backend.

The architecture is:

```text
┌──────────────────────┐
│ React + TypeScript   │
│ Frontend             │
│                      │
│ Vite                 │
│ Redux Toolkit        │
│ Axios                │
│ Tailwind CSS         │
└──────────┬───────────┘
           │ HTTP/JSON
           ▼
┌──────────────────────┐
│ FastAPI Backend      │
│                      │
│ API Endpoints        │
│ Business Logic       │
│ LangGraph            │
│ LLM Integration      │
│ Database             │
└──────────────────────┘
```

The frontend does not contain a mock or offline backend.

API-backed functionality requires the backend server to be running.

---

# Technology Stack

| Technology    | Purpose                                  |
| ------------- | ---------------------------------------- |
| React         | Building the user interface              |
| TypeScript    | Static typing and type safety            |
| Vite          | Frontend development and build tooling   |
| Redux Toolkit | Global application and interaction state |
| Axios         | HTTP communication with the backend      |
| Tailwind CSS  | UI styling                               |
| LangGraph     | Backend conversational workflow          |
| FastAPI       | Backend API                              |
| REST APIs     | Frontend/backend communication           |

---

# Why React + TypeScript?

React provides a component-based architecture suitable for a complex interactive application containing:

* Forms
* Modals
* Chat interfaces
* Dynamic state
* Real-time UI updates

TypeScript provides type safety across the application and makes the frontend/backend data contract easier to maintain.

---

# Why Redux Toolkit?

The application contains multiple components that need access to the same interaction state.

For example:

```text
AI Assistant
     │
     ├── updates interaction fields
     │
     ▼
Redux State
     │
     ├── Interaction Form
     ├── Header
     └── Other interaction components
```

Redux Toolkit provides a centralized source of truth and avoids passing the interaction state through multiple levels of React components.

---

# Why a Mapping Layer?

The frontend and backend have different responsibilities.

The frontend needs values optimized for:

* User-friendly display
* Form controls
* UI components

The backend/database needs values optimized for:

* API contracts
* Validation
* Database representation

The mapping layer keeps these concerns separate.

```text
Frontend Model
      │
      ▼
  mappers.ts
      │
      ▼
Backend Model
```

This makes changes to either representation easier without requiring changes throughout the application.

---

# Application Flow

## Manual Interaction Logging

```text
User
 ↓
Open Interaction Form
 ↓
Enter HCP details
 ↓
Select interaction type
 ↓
Enter date/time
 ↓
Add materials/samples
 ↓
Select sentiment
 ↓
Review interaction
 ↓
Save
 ↓
Backend
 ↓
Interaction stored
 ↓
Saved Interactions refreshed
```

---

## AI-Assisted Interaction Logging

```text
User
 ↓
Open AI Assistant
 ↓
Describe interaction naturally
 ↓
Message sent to backend
 ↓
LangGraph processes conversation
 ↓
AI extracts interaction information
 ↓
Structured data returned
 ↓
Redux state updated
 ↓
Interaction Form updated
 ↓
User reviews/edits information
 ↓
Save Interaction
 ↓
Backend
```

---

# Example AI Workflow

A user might enter:

```text
"I met Dr. Ravi today for a meeting. We discussed the new product and he had a positive response. I also gave him two samples."
```

The AI workflow can identify information such as:

```text
HCP:
Dr. Ravi

Interaction Type:
Meeting

Sentiment:
Positive

Samples:
2

Topic:
New product discussion
```

The extracted values are then reflected in the structured interaction state.

The user can review or modify the information before saving.

---

# Data Flow

The complete frontend data flow can be summarized as:

```text
                    USER
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
       Interaction Form    AI Assistant
             │                 │
             └────────┬────────┘
                      ▼
                Redux Toolkit
                      │
                      ▼
              interactionSlice
                      │
                      ▼
                  API Layer
                      │
                      ▼
                   Axios
                      │
                      ▼
               Mapping Layer
                      │
                      ▼
              FastAPI Backend
                      │
             ┌────────┴────────┐
             ▼                 ▼
        Interaction API     AI / LangGraph
             │                 │
             └────────┬────────┘
                      ▼
                  Database
```

---

# Environment Configuration

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

The API base URL can be changed depending on the environment.

For example:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

For a deployed backend:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

Do not commit environment-specific secrets to the repository.

---

# Installation

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git
* Backend API running locally

---

## Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create:

```text
.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Start Development Server

```bash
npm run dev
```

The Vite development server will start at:

```text
http://localhost:5173
```

The backend must also be running for API-dependent features to work.

---

# Development Workflow

A typical local development setup consists of two applications:

```text
Terminal 1
──────────
FastAPI Backend
http://localhost:8000


Terminal 2
──────────
React/Vite Frontend
http://localhost:5173
```

The frontend communicates with the backend through the configured API base URL.

---

# Important Design Decisions

## One Interaction State for Form and AI

The structured form and AI assistant intentionally share the same Redux state.

This prevents the application from having:

```text
AI Draft ≠ Form Draft
```

Instead:

```text
AI Draft = Form Draft
```

Both interfaces operate on the same underlying interaction.

---

## Backend as Source of Truth for Saved Data

Saved interactions are always retrieved from the backend rather than relying solely on local frontend state.

This ensures that the application displays the actual persisted data.

---

## Centralized API Communication

API calls are kept in `services/api.ts` rather than being implemented directly inside individual components.

This makes the frontend easier to maintain and test.

---

## Centralized Data Mapping

Frontend/backend transformations are handled by `services/mappers.ts`.

This avoids duplicating conversion logic throughout the application.

---

# Current Limitations

### Chat UI History After Refresh

The backend conversation state persists through the `thread_id`, but the visible chat message history is not currently reconstructed after a browser refresh.

Therefore, after refreshing the page:

* The backend can continue the existing conversation.
* The visible chat bubbles may start empty.

A future enhancement could persist or retrieve the conversation messages and reconstruct the chat UI.

### Backend Dependency

The frontend currently does not provide a mock or offline mode.

The backend must be available for:

* AI chat
* Saving interactions
* Fetching saved interactions
* HCP resolution/creation
* Other API-backed functionality

---

# Future Improvements

Potential future improvements include:

* Persisting and restoring visible chat history.
* Streaming AI responses instead of waiting for a complete response.
* Improved voice-based interaction logging.
* Optimistic UI updates.
* Better error/retry handling for API failures.
* Automated frontend tests.
* End-to-end testing.
* Authentication and role-based UI permissions.
* Improved loading and empty states.
* Production environment configuration.
* Performance optimization and code splitting.

---

# Project Highlights

This project demonstrates experience with:

* React component architecture
* TypeScript
* Redux Toolkit
* Asynchronous Redux thunks
* REST API integration
* Axios
* State synchronization between multiple UI interfaces
* AI-assisted workflows
* Conversational UI
* LangGraph-based conversational state
* Frontend/backend data mapping
* Persistent conversation threads
* Form-driven applications
* Modal-based selection workflows
* Tailwind CSS
* Vite development environment

The key architectural concept is the combination of a **traditional structured form with an AI conversational interface**, where both interfaces operate on the same underlying interaction state.

---

# Repository Architecture at a Glance

```text
AI-First HCP CRM
│
├── React + TypeScript
│
├── UI Layer
│   ├── InteractionForm
│   ├── AiAssistantChat
│   ├── SavedInteractions
│   ├── MaterialsModal
│   ├── SamplesModal
│   ├── VoiceModal
│   ├── Header
│   └── Toast
│
├── State Layer
│   └── Redux Toolkit
│       └── interactionSlice
│
├── Service Layer
│   ├── api.ts
│   └── mappers.ts
│
├── Type Layer
│   └── types.ts
│
└── Backend
    └── FastAPI
        ├── REST APIs
        ├── LangGraph
        ├── LLM
        └── Database
```

---

# Summary

The AI-First HCP CRM frontend provides a unified interface for recording HCP interactions through either structured data entry or conversational AI.

The frontend uses **React and TypeScript** for the UI, **Redux Toolkit** for centralized state management, **Axios** for backend communication, and a dedicated **mapping layer** to maintain a clean separation between frontend and backend data models.

The most important architectural feature is that the AI assistant and structured form share the same interaction state. Information extracted conversationally by the AI is therefore immediately available in the structured form, giving users the flexibility of AI-assisted data entry while retaining the control and transparency of a traditional form.

This architecture allows the application to combine conversational AI with a structured CRM workflow without maintaining two separate versions of the same interaction.
