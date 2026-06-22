import { HelpCircle, LayoutGrid } from 'lucide-react';
import { MODULE_TEMPLATES, CATEGORY_META } from '../constants/mapData';

export default function RightSidebar() {
  const handleDragStart = (e, templateId) => {
    e.dataTransfer.setData('templateId', templateId);
  };

  return (
    <aside className="w-64 bg-tactical-panel border-l border-tactical-border flex flex-col h-full z-20 shrink-0 text-[14px]">
      <div className="p-3 border-b border-tactical-border flex items-center gap-2 bg-tactical-input/50">
        <LayoutGrid className="text-tactical-accent" size={16} />
        <h2 className="font-bold text-[12px] uppercase text-tactical-muted tracking-wide">Room Assets</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-6">
        <div className="bg-tactical-input border border-tactical-border rounded p-3 text-[12px] text-tactical-muted space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-tactical-text border-b border-tactical-divider pb-2 mb-2">
            <HelpCircle size={14} className="text-tactical-accent" />
            <span>Map Controls Guide</span>
          </div>
          <p>• Drag & Drop assets directly onto a connection node.</p>
          <p>• Hover over a room and press <kbd className="bg-tactical-btn px-1 border border-tactical-border rounded text-tactical-text font-mono text-[10px]">R</kbd> to rotate.</p>
        </div>

        {Object.entries(CATEGORY_META).map(([catKey, meta]) => (
          <div key={catKey} className="space-y-2">
            <h3 className="text-[12px] font-bold text-tactical-muted uppercase tracking-wide px-1">{meta.label}</h3>
            <div className="grid grid-cols-1 gap-1">
              {Object.values(MODULE_TEMPLATES)
                .filter(t => t.category === catKey)
                .map(tmpl => (
                  <div
                    key={tmpl.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, tmpl.id)}
                    className={`p-2 bg-tactical-bg border border-tactical-border border-l-2 rounded flex items-center justify-between cursor-grab active:cursor-grabbing hover:border-tactical-accent transition ${meta.sidebarBorder}`}
                  >
                    <span className="font-medium text-tactical-text">{tmpl.name}</span>
                    <span className="text-[11px] text-tactical-muted uppercase font-mono">
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