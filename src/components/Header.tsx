import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setCurrentView } from '../store/interactionSlice';
import { FileText, History, Sparkles, UserCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector((state) => state.interaction.currentView);
  const savedCount = useAppSelector((state) => state.interaction.savedInteractions.length);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Log HCP Interaction</h1>
            <p className="text-xs text-slate-500">Omnichannel Medical CRM & Field Rep Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => dispatch(setCurrentView('log'))}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'log'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Log Interaction</span>
            </button>
            <button
              onClick={() => dispatch(setCurrentView('saved'))}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                currentView === 'saved'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 font-semibold rounded-full">
                  {savedCount}
                </span>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-slate-200 text-xs text-slate-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>AI Assistant Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};
