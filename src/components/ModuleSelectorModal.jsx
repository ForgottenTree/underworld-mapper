// src/components/ModuleSelectorModal.jsx
import { X } from 'lucide-react';
import { MODULE_TEMPLATES } from '../constants/mapData';

export default function ModuleSelectorModal({ isOpen, onClose, onSelect, isFirstModule }) {
  if (!isOpen) return null;

  const categories = {
    outer: { title: 'Outer Entries', border: 'border-emerald-500/30 bg-emerald-950/10 hover:bg-emerald-900/20' },
    inner: { title: 'Inner Paths', border: 'border-indigo-500/30 bg-indigo-950/10 hover:bg-indigo-900/20' },
    boss: { title: 'Boss Lairs', border: 'border-rose-500/30 bg-rose-950/10 hover:bg-rose-900/20' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Select Room Architecture</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {Object.entries(categories).map(([catKey, catStyle]) => (
            <div key={catKey} className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{catStyle.title}</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(MODULE_TEMPLATES)
                  .filter(m => m.category === catKey)
                  .map(tmpl => {
                    const isDisabled = isFirstModule && tmpl.category !== 'outer';
                    
                    return (
                      <button
                        key={tmpl.id}
                        disabled={isDisabled}
                        onClick={() => onSelect(tmpl.id)}
                        className={`p-3 text-left border rounded-xl flex flex-col gap-1 transition group ${
                          isDisabled 
                            ? 'opacity-30 cursor-not-allowed border-slate-800 bg-slate-950 grayscale' 
                            : `${catStyle.border} cursor-pointer text-slate-300 hover:text-white`
                        }`}
                      >
                        <span className="text-xs font-semibold">{tmpl.name}</span>
                        <span className="text-[10px] text-slate-500 capitalize">
                          Exits: {tmpl.junctions.join(', ')}
                        </span>
                      </button>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}