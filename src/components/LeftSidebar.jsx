import { useState } from 'react';
import { Plus, Trash2, Folder, Edit2, Check, X } from 'lucide-react';

export default function LeftSidebar({
  canvases,
  activeCanvasId,
  setActiveCanvasId,
  onCreateCanvas,
  onDeleteCanvas,
  onRenameCanvas
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const startEditing = (canvas, e) => {
    e.stopPropagation();
    setEditingId(canvas.id);
    setEditName(canvas.name);
  };

  const saveRename = (e) => {
    e.stopPropagation();
    if (editName.trim()) {
      onRenameCanvas(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="w-64 bg-tactical-panel border-r border-tactical-border flex flex-col h-full z-20 shrink-0 text-[14px]">
      <div className="p-3 border-b border-tactical-border flex items-center justify-between bg-tactical-input/50">
        <div className="flex items-center gap-2">
          <Folder className="text-tactical-accent" size={16} />
          <h2 className="font-bold text-[12px] uppercase text-tactical-muted tracking-wide">Cave Systems</h2>
        </div>
        <button onClick={onCreateCanvas} className="p-1 hover:bg-tactical-btn-hover bg-tactical-btn border border-tactical-input-border rounded text-tactical-text transition" title="New Map">
          <Plus size={14} />
        </button>
      </div>

      <ul className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {canvases.map(canvas => {
          const isActive = canvas.id === activeCanvasId;
          const isEditing = canvas.id === editingId;

          return (
            <li
              key={canvas.id}
              onClick={() => !isEditing && setActiveCanvasId(canvas.id)}
              className={`group flex items-center justify-between p-2 rounded cursor-pointer border transition-colors min-h-[32px] ${
                isActive 
                  ? 'bg-[#1f2938] border-[#506789] text-[#f3f7ff]' 
                  : 'border-transparent hover:bg-tactical-btn text-tactical-muted hover:text-tactical-text'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="bg-tactical-input border border-tactical-accent outline-none rounded px-2 py-0.5 text-xs text-tactical-text w-full"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && saveRename(e)}
                  />
                  <button onClick={saveRename} className="p-1 hover:bg-tactical-btn rounded text-tactical-text">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 hover:bg-tactical-btn rounded text-tactical-text">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="truncate pr-2">{canvas.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button 
                      onClick={(e) => startEditing(canvas, e)} 
                      className="p-1 hover:bg-tactical-btn-hover rounded text-tactical-muted hover:text-tactical-text transition"
                      title="Rename"
                    >
                      <Edit2 size={12} />
                    </button>
                    {canvases.length > 1 && (
                      <button 
                        onClick={(e) => onDeleteCanvas(canvas.id, e)} 
                        className="p-1 hover:bg-tactical-btn-hover rounded text-tactical-muted hover:text-rose-400 transition"
                        title="Delete Map"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}