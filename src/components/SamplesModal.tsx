import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setSamplesModalOpen, addSample } from '../store/interactionSlice';
import { X, PackagePlus, Plus, Check } from 'lucide-react';

const AVAILABLE_SAMPLES = [
  { name: 'OncoBoost 50mg Vials', defaultQty: 5 },
  { name: 'CardioCare 10mg Tablets', defaultQty: 10 },
  { name: 'NeuroVitalis 20mg Caps', defaultQty: 5 },
  { name: 'Immunis 100mg Injectable', defaultQty: 2 },
  { name: 'Diabetech 500mg XR', defaultQty: 14 },
];

export const SamplesModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.interaction.isSamplesModalOpen);
  const [selectedSampleName, setSelectedSampleName] = useState(AVAILABLE_SAMPLES[0].name);
  const [quantity, setQuantity] = useState(5);

  if (!isOpen) return null;

  const handleAdd = () => {
    dispatch(addSample({
      id: 'sam-' + Date.now(),
      name: selectedSampleName,
      quantity: Number(quantity) || 1
    }));
    dispatch(setSamplesModalOpen(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <PackagePlus className="w-5 h-5 text-blue-600" />
            <span>Add Sample Distribution</span>
          </h3>
          <button
            onClick={() => dispatch(setSamplesModalOpen(false))}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Medication Sample
            </label>
            <select
              value={selectedSampleName}
              onChange={(e) => setSelectedSampleName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {AVAILABLE_SAMPLES.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Quantity Distributed
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={() => dispatch(setSamplesModalOpen(false))}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sample</span>
          </button>
        </div>
      </div>
    </div>
  );
};
