import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setToastMessage } from '../store/interactionSlice';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const dispatch = useAppDispatch();
  const message = useAppSelector((state) => state.interaction.toastMessage);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        dispatch(setToastMessage(null));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => dispatch(setToastMessage(null))}
        className="text-slate-400 hover:text-white p-1 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
