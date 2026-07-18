import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAppSelector, useAppDispatch } from './store/store';
import { fetchSavedInteractions } from './store/interactionSlice';
import { Header } from './components/Header';
import { InteractionForm } from './components/InteractionForm';
import { AiAssistantChat } from './components/AiAssistantChat';
import { SavedInteractions } from './components/SavedInteractions';
import { MaterialsModal } from './components/MaterialsModal';
import { SamplesModal } from './components/SamplesModal';
import { VoiceModal } from './components/VoiceModal';
import { Toast } from './components/Toast';

const MainContent: React.FC = () => {
  const currentView = useAppSelector((state) => state.interaction.currentView);
   const dispatch = useAppDispatch();

     React.useEffect(() => {
    dispatch(fetchSavedInteractions());
  }, [dispatch]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {currentView === 'log' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Structured Form (7 cols on lg) */}
          <div className="lg:col-span-7">
            <InteractionForm />
          </div>

          {/* Right Column: AI Assistant Chat (5 cols on lg) */}
          <div className="lg:col-span-5">
            <AiAssistantChat />
          </div>
        </div>
      ) : (
        <SavedInteractions />
      )}
    </main>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-16 selection:bg-blue-600 selection:text-white">
        <Header />
        <MainContent />
        <MaterialsModal />
        <SamplesModal />
        <VoiceModal />
        <Toast />
      </div>
    </Provider>
  );
}

