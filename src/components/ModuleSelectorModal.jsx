import { X } from 'lucide-react';
import { MODULE_TEMPLATES } from '../constants/mapData';

export default function ModuleSelectorModal({ isOpen, onClose, onSelect, isFirstModule }) {
  if (!isOpen) return null;

  const categories = {
    outer: { title: 'Outer Entries', highlight: 'border-emerald-500/30' },
    inner: { title: 'Inner Paths', highlight: 'border-indigo-500/30' },
    boss: { title: 'Boss Lairs', highlight: 'border-rose-500/30' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151b]/80 backdrop-blur-sm p-4 animate-fade-in text-[14px]">
      <div className="bg-tactical-panel border border-tactical-border rounded shadow-2xl flex flex-col w-full max-w-xl max-h-[85vh] overflow-hidden">
        
        <div className="p-3 border-b border-tactical-border flex items-center justify-between bg-tactical-input/50">
          <h3 className="text-[12px] font-bold uppercase tracking-wide text-tactical-muted">Select Room Architecture</h3>
          <button onClick={onClose} className="p-1 hover:bg-tactical-btn border border-transparent hover:border-tactical-input-border rounded text-tactical-text transition">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {Object.entries(categories).map(([catKey, catStyle]) => (
            <div key={catKey} className="space-y-3">
              <h4 className="text-[12px] font-bold text-tactical-text uppercase tracking-wide border-b border-tactical-divider pb-1">{catStyle.title}</h4>
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
                        className={`p-3 text-left border rounded flex flex-col gap-1 transition ${
                          isDisabled 
                            ? 'opacity-40 cursor-not-allowed border-tactical-divider bg-tactical-bg' 
                            : `bg-tactical-bg border-tactical-border hover:bg-tactical-btn hover:border-tactical-accent cursor-pointer text-tactical-text`
                        }`}
                      >
                        <span className="font-semibold border-l-2 pl-2 ${catStyle.highlight}">{tmpl.name}</span>
                        <span className="text-[11px] text-tactical-muted capitalize pl-2">
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