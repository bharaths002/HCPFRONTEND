import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  updateFormField,
  setVoiceModalOpen,
  setMaterialsModalOpen,
  setSamplesModalOpen,
  removeMaterial,
  removeSample,
  setSentiment,
  saveInteraction,
  resetForm
} from '../store/interactionSlice';
import {
  Calendar,
  Clock,
  Mic,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Smile,
  Meh,
  Frown,
  CheckCircle,
  X
} from 'lucide-react';
import { SentimentType, InteractionType } from '../types';

const HCP_SUGGESTIONS = [
  'Dr. Jane Smith (Cardiology)',
  'Dr. Robert Chen (Oncology)',
  'Dr. Michael Patel (Endocrinology)',
  'Dr. Sarah Jenkins (Neurology)',
  'Dr. David Miller (Pediatrics)'
];

export const InteractionForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const form = useAppSelector((state) => state.interaction.form);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Section Title */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Interaction Details</h2>
        <p className="text-xs text-slate-500 mt-0.5">Fill out structured form fields or use the AI Assistant chat on the right.</p>
      </div>

      <div className="space-y-5">
        {/* Row 1: HCP Name & Interaction Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              HCP Name
            </label>
            <div className="relative">
              <input
                type="text"
                list="hcp-list"
                value={form.hcpName}
                onChange={(e) => dispatch(updateFormField({ field: 'hcpName', value: e.target.value }))}
                placeholder="Search or select HCP..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
              />
              <datalist id="hcp-list">
                {HCP_SUGGESTIONS.map((hcp) => (
                  <option key={hcp} value={hcp} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Interaction Type
            </label>
            <select
              value={form.interactionType}
              onChange={(e) => dispatch(updateFormField({ field: 'interactionType', value: e.target.value as InteractionType }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
            >
              <option value="Meeting">Meeting</option>
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Dinner">Dinner</option>
              <option value="Symposium">Symposium</option>
              <option value="Advisory Board">Advisory Board</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.date}
                onChange={(e) => dispatch(updateFormField({ field: 'date', value: e.target.value }))}
                placeholder="DD-MM-YYYY"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Time
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.time}
                onChange={(e) => dispatch(updateFormField({ field: 'time', value: e.target.value }))}
                placeholder="HH:MM"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Attendees
          </label>
          <input
            type="text"
            value={form.attendees}
            onChange={(e) => dispatch(updateFormField({ field: 'attendees', value: e.target.value }))}
            placeholder="Enter names or search..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Topics Discussed */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Topics Discussed
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={form.topicsDiscussed}
              onChange={(e) => dispatch(updateFormField({ field: 'topicsDiscussed', value: e.target.value }))}
              placeholder="Enter key discussion points..."
              className="w-full p-3.5 pb-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
            />
            <div className="absolute right-3 bottom-3 flex items-center space-x-2 text-slate-400">
              <Mic className="w-4 h-4 hover:text-blue-600 cursor-pointer" onClick={() => dispatch(setVoiceModalOpen(true))} />
            </div>
          </div>
        </div>

        {/* Summarize from Voice Note Button */}
        <div>
          <button
            type="button"
            onClick={() => dispatch(setVoiceModalOpen(true))}
            className="w-full sm:w-auto px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Summarize from Voice Note (Requires Consent)</span>
          </button>
        </div>

        {/* Materials Shared & Samples Distributed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Materials Shared Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Materials Shared
              </label>
              <button
                type="button"
                onClick={() => dispatch(setMaterialsModalOpen(true))}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center space-x-1 shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Search/Add</span>
              </button>
            </div>
            {form.materialsShared.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No materials added.</p>
            ) : (
              <div className="space-y-2">
                {form.materialsShared.map((mat) => (
                  <div key={mat.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
                    <span className="font-medium text-slate-800 truncate max-w-[180px]">{mat.name}</span>
                    <button
                      type="button"
                      onClick={() => dispatch(removeMaterial(mat.id))}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Samples Distributed Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Samples Distributed
              </label>
              <button
                type="button"
                onClick={() => dispatch(setSamplesModalOpen(true))}
                className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center space-x-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add Sample</span>
              </button>
            </div>
            {form.samplesDistributed.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No samples added.</p>
            ) : (
              <div className="space-y-2">
                {form.samplesDistributed.map((sam) => (
                  <div key={sam.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs">
                    <span className="font-medium text-slate-800 truncate max-w-[150px]">
                      {sam.name} <span className="text-blue-600 font-bold">(x{sam.quantity})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch(removeSample(sam.id))}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Observed/Inferred HCP Sentiment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Observed/Inferred HCP Sentiment
          </label>
          <div className="flex items-center space-x-6 pt-1">
            {(['Positive', 'Neutral', 'Negative'] as SentimentType[]).map((sent) => (
              <label key={sent} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="sentiment"
                  checked={form.sentiment === sent}
                  onChange={() => dispatch(setSentiment(sent))}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700 flex items-center space-x-1.5">
                  {sent === 'Positive' && <Smile className="w-4 h-4 text-emerald-600" />}
                  {sent === 'Neutral' && <Meh className="w-4 h-4 text-amber-500" />}
                  {sent === 'Negative' && <Frown className="w-4 h-4 text-rose-600" />}
                  <span>{sent}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Outcomes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Outcomes
          </label>
          <textarea
            rows={3}
            value={form.outcomes}
            onChange={(e) => dispatch(updateFormField({ field: 'outcomes', value: e.target.value }))}
            placeholder="Key outcomes or agreements..."
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Follow-up Actions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Follow-up Actions
          </label>
          <textarea
            rows={3}
            value={form.followUpActions}
            onChange={(e) => dispatch(updateFormField({ field: 'followUpActions', value: e.target.value }))}
            placeholder="Enter next steps or tasks..."
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* AI Suggested Follow-ups */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            AI Suggested Follow-ups:
          </label>
          <div className="flex flex-wrap gap-2">
            {form.aiSuggestedFollowUps.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const current = form.followUpActions;
                  const updated = current ? current + '\n• ' + suggestion : '• ' + suggestion;
                  dispatch(updateFormField({ field: 'followUpActions', value: updated }));
                }}
                className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg font-medium transition-all shadow-2xs"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={() => dispatch(resetForm())}
          className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => dispatch(saveInteraction())}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center space-x-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Save Interaction</span>
        </button>
      </div>
    </div>
  );
};
