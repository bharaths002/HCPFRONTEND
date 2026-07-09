import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setMaterialsModalOpen, addMaterial } from '../store/interactionSlice';
import { X, Search, FileText, Check } from 'lucide-react';
import { MaterialItem } from '../types';

const AVAILABLE_MATERIALS: MaterialItem[] = [
  { id: 'mat-1', name: 'OncoBoost Phase III Clinical Trial Summary', category: 'Clinical Study' },
  { id: 'mat-2', name: 'CardioCare Efficacy & Safety Brochure', category: 'Brochure' },
  { id: 'mat-3', name: 'NeuroVitalis Dosage & Administration Guide', category: 'Guide' },
  { id: 'mat-4', name: 'Immunis Q2 Reimbursement & Access Overview', category: 'Market Access' },
  { id: 'mat-5', name: 'Diabetech Patient Support Program Flyer', category: 'Patient Education' },
];

export const MaterialsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.interaction.isMaterialsModalOpen);
  const selectedMaterials = useAppSelector((state) => state.interaction.form.materialsShared);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = AVAILABLE_MATERIALS.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Select Materials Shared</span>
          </h3>
          <button
            onClick={() => dispatch(setMaterialsModalOpen(false))}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search brochures, clinical studies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filtered.map((mat) => {
              const isSelected = selectedMaterials.some(m => m.id === mat.id);
              return (
                <div
                  key={mat.id}
                  onClick={() => {
                    if (isSelected) {
                      // toggle off handled in slice or we can remove
                    } else {
                      dispatch(addMaterial(mat));
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-semibold">{mat.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 mt-1 inline-block">
                      {mat.category}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => dispatch(setMaterialsModalOpen(false))}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
