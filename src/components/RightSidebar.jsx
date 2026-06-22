// src/components/RightSidebar.jsx
import { HelpCircle, LayoutGrid } from 'lucide-react';
import { MODULE_TEMPLATES } from '../constants/mapData';

export default function RightSidebar() {
  const categories = {
    outer: { name: 'Outer Modules', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
    inner: { name: 'Inner Modules', color: 'border-indigo-500 text-indigo-400 bg-indigo-500/10' },
    boss: { name: 'Boss Arena Modules', color: 'border-rose-500 text-rose-400 bg-rose-500/10' }
  };

  const handleDragStart = (e, templateId) => {
    e.dataTransfer.setData('templateId', templateId);
  };

  return (
    <aside className="w-66 bg-slate-900 border-l border-slate-800 flex flex-col h-full z-20 shadow-2xl shrink-0 text-slate-200">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <LayoutGrid className="text-indigo-400" size={18} />
          <h2 className="font-bold text-sm tracking-wide uppercase text-slate-400">Room Assets</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300 border-b border-slate-800 pb-1.5 mb-1.5">
            <HelpCircle size={14} className="text-indigo-400" />
            <span>Map Controls Guide</span>
          </div>
          <p>• <b className="text-slate-300">Drag & Drop:</b> Pull assets directly onto a blue <b className="text-indigo-400 font-bold">+</b> node.</p>
          <p>• <b className="text-slate-300">Rotate Module:</b> Hover over a room and press <kbd className="bg-slate-800 px-1 rounded text-white text-[10px]">R</kbd>.</p>
        </div>

        {Object.entries(categories).map(([catKey, catInfo]) => (
          <div key={catKey} className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">{catInfo.name}</h3>
            <div className="grid grid-cols-1 gap-1.5">
              {Object.values(MODULE_TEMPLATES)
                .filter(t => t.category === catKey)
                .map(tmpl => (
                  <div 
                    key={tmpl.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, tmpl.id)}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-grab active:cursor-grabbing hover:brightness-125 transition ${catInfo.color}`}
                  >
                    <span className="font-medium text-slate-200">{tmpl.name}</span>
                    <span className="text-[10px] opacity-60 uppercase font-mono">
                      {tmpl.junctions.length} Jnc
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}