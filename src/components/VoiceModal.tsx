import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setVoiceModalOpen, summarizeVoiceNote } from '../store/interactionSlice';
import { X, Mic, Square, Sparkles, CheckCircle2 } from 'lucide-react';

export const VoiceModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.interaction.isVoiceModalOpen);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(
    'Met with Dr. Jane Smith today regarding OncoBoost Phase III trial results. She was very positive about the progression-free survival data and requested additional copies of the dosing brochure and 5 sample vials. We agreed to schedule a follow-up dinner symposium in two weeks.'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSummarize = async () => {
    setIsProcessing(true);
    await dispatch(summarizeVoiceNote(transcript));
    setIsProcessing(false);
    dispatch(setVoiceModalOpen(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Voice Note Summarizer (AI Consent Verified)</span>
          </h3>
          <button
            onClick={() => dispatch(setVoiceModalOpen(false))}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center space-x-3 text-blue-900">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 text-white'}`}>
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">
                {isRecording ? 'Recording voice note...' : 'Voice recording ready or simulated transcript'}
              </h4>
              <p className="text-xs text-blue-700">
                {isRecording ? 'Speak clearly into your microphone.' : 'Edit or dictate your interaction details below for instant AI form filling.'}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-2 transition-all ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Stop Recording' : 'Start Simulated Voice Recording'}</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Live Transcript
            </label>
            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              placeholder="Dictate or type interaction notes here..."
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={() => dispatch(setVoiceModalOpen(false))}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSummarize}
            disabled={isProcessing}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Processing AI...' : 'Summarize & Fill Form'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
