import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/store';
import { setCurrentView } from '../store/interactionSlice';
import { Calendar, Clock, User, Smile, Meh, Frown, FileText, Search, Plus } from 'lucide-react';
import { api } from '../services/api';
import { backendInteractionToDisplay } from '../services/mappers';

export const SavedInteractions: React.FC = () => {
  const dispatch = useAppDispatch();
  const [saved, setSaved] = useState<ReturnType<typeof backendInteractionToDisplay>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.listInteractions().then((data) => {
      setSaved(data.map(backendInteractionToDisplay));
    });
  }, []);

  const filtered = saved.filter(
    (item) =>
      item.hcpName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.topicsDiscussed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.interactionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Logged Interactions History</h2>
          <p className="text-xs text-slate-500 mt-0.5">Review, search, and export all recorded HCP visits and calls.</p>
        </div>
        <button
          onClick={() => dispatch(setCurrentView('log'))}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Interaction</span>
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search by HCP name, topics, or interaction type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">No interactions found</h3>
          <p className="text-xs text-slate-500 mt-1">Try a different search query or log a new interaction.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all bg-white shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{item.hcpName || 'Unnamed HCP'}</h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                        {item.interactionType}
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.time}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                      item.sentiment === 'Positive'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.sentiment === 'Neutral'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.sentiment === 'Positive' && <Smile className="w-3.5 h-3.5 text-emerald-600" />}
                    {item.sentiment === 'Neutral' && <Meh className="w-3.5 h-3.5 text-amber-500" />}
                    {item.sentiment === 'Negative' && <Frown className="w-3.5 h-3.5 text-rose-600" />}
                    <span>{item.sentiment}</span>
                  </span>
                </div>
              </div>

              {item.topicsDiscussed && (
                <div className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <span className="font-semibold text-slate-900 block text-xs uppercase tracking-wider mb-1">Topics Discussed</span>
                  <p className="whitespace-pre-wrap">{item.topicsDiscussed}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                {item.materialsShared.length > 0 && (
                  <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700 block mb-1">Materials Shared:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {item.materialsShared.map((m) => (
                        <li key={m.id}>{m.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.samplesDistributed.length > 0 && (
                  <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700 block mb-1">Samples Distributed:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {item.samplesDistributed.map((s) => (
                        <li key={s.id}>{s.name} (x{s.quantity})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {item.followUpActions && (
                <div className="text-xs text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <span className="font-semibold text-blue-900 block mb-0.5">Follow-up Actions</span>
                  <p className="whitespace-pre-wrap">{item.followUpActions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
