import { useState } from 'react';
import { HelpCircle, LayoutGrid, Type, Hash, RotateCw, Circle, ChevronDown, Square, Maximize2, Link } from 'lucide-react';
import { MODULE_TEMPLATES, CATEGORY_META, getTemplateLabel } from '../constants/mapData';

const LAYERS_ROW1 = [
  { key: 'name',        label: 'Name',        Icon: Type },
  { key: 'coordinates', label: 'Coordinates',  Icon: Hash },
  { key: 'rotation',    label: 'Rotation',     Icon: RotateCw },
  { key: 'dots',        label: 'Markers',      Icon: Circle },
];

const LAYERS_ROW2 = [
  { key: 'borders',   label: 'Borders',   Icon: Square },
  { key: 'junctions', label: 'Junctions', Icon: Link },
  { key: 'padding',   label: 'Padding',   Icon: Maximize2 },
];

export default function RightSidebar({ showId, setShowId, visibleLayers, setVisibleLayers, bgOpacity, setBgOpacity }) {
  const [helpOpen, setHelpOpen] = useState(false);

  const handleDragStart = (e, templateId) => {
    e.dataTransfer.setData('templateId', templateId);
  };

  const toggleLayer = (key) =>
    setVisibleLayers(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className="w-64 bg-tactical-panel border-l border-tactical-border flex flex-col h-full z-20 shrink-0 text-[14px]">
      <div className="p-3 border-b border-tactical-border flex items-center gap-2 bg-tactical-input/50">
        <LayoutGrid className="text-tactical-accent" size={16} />
        <h2 className="font-bold text-[12px] uppercase text-tactical-muted tracking-wide">Room Assets</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-6">
        <div className="bg-tactical-input border border-tactical-border rounded text-[12px] text-tactical-muted">
          <button
            onClick={() => setHelpOpen(o => !o)}
            className="w-full flex items-center justify-between gap-1.5 p-3 font-bold text-tactical-text hover:text-tactical-accent transition"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle size={14} className="text-tactical-accent" />
              Map Controls Guide
            </span>
            <ChevronDown size={14} className={`text-tactical-muted transition-transform duration-200 ${helpOpen ? 'rotate-180' : ''}`} />
          </button>
          {helpOpen && (
            <div className="px-3 pb-3 space-y-2 border-t border-tactical-divider pt-2">
              <p>• Drag & Drop assets directly onto a connection node.</p>
              <p>• Hover over a room and press <kbd className="bg-tactical-btn px-1 border border-tactical-border rounded text-tactical-text font-mono text-[10px]">R</kbd> to rotate.</p>
            </div>
          )}
        </div>

        <div className="bg-tactical-input border border-tactical-border rounded p-3 space-y-4">
          <span className="text-[11px] font-bold text-tactical-muted uppercase tracking-wide">Display</span>

          <div className="space-y-1.5">
            <span className="text-[11px] text-tactical-muted">Label</span>
            <div className="flex items-center bg-tactical-bg border border-tactical-border rounded p-0.5 text-[12px] font-medium">
              <button
                onClick={() => setShowId(false)}
                className={`flex-1 py-1.5 rounded transition text-center ${
                  !showId
                    ? 'bg-tactical-btn border border-tactical-accent/40 text-tactical-text'
                    : 'text-tactical-muted hover:text-tactical-text'
                }`}
              >
                Name
              </button>
              <button
                onClick={() => setShowId(true)}
                className={`flex-1 py-1.5 rounded transition text-center ${
                  showId
                    ? 'bg-tactical-btn border border-tactical-accent/40 text-tactical-text'
                    : 'text-tactical-muted hover:text-tactical-text'
                }`}
              >
                ID
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] text-tactical-muted">Layers</span>
            <div className="grid grid-cols-4 gap-1">
              {LAYERS_ROW1.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => toggleLayer(key)}
                  title={label}
                  className={`flex items-center justify-center py-1.5 rounded border transition ${
                    visibleLayers[key]
                      ? 'bg-tactical-accent/10 border-tactical-accent/50 text-tactical-accent'
                      : 'bg-tactical-bg border-tactical-border text-tactical-muted hover:text-tactical-text hover:border-tactical-input-border'
                  }`}
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {LAYERS_ROW2.map(({ key, label, Icon, text }) => (
                <button
                  key={key}
                  onClick={() => toggleLayer(key)}
                  title={label}
                  className={`flex items-center justify-center py-1.5 rounded border transition ${
                    visibleLayers[key]
                      ? 'bg-tactical-accent/10 border-tactical-accent/50 text-tactical-accent'
                      : 'bg-tactical-bg border-tactical-border text-tactical-muted hover:text-tactical-text hover:border-tactical-input-border'
                  }`}
                >
                  {text ? <span className="text-[11px] font-bold font-mono">{text}</span> : <Icon size={13} />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-tactical-muted">Background Opacity</span>
              <span className="text-[11px] font-mono text-tactical-muted">{Math.round(bgOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={bgOpacity}
              onChange={e => setBgOpacity(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded appearance-none bg-tactical-border cursor-pointer accent-tactical-accent"
            />
          </div>
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
                    <span className="font-medium text-tactical-text">{getTemplateLabel(tmpl, showId)}</span>
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
