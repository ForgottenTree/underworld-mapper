// src/components/LeftSidebar.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Folder, Edit2, Check, X, Pin } from 'lucide-react';

export default function LeftSidebar({
  canvases,
  activeCanvasId,
  setActiveCanvasId,
  onCreateCanvas,
  onDeleteCanvas,
  onRenameCanvas,
  pinned,
  setPinned,
  isOpen,
  setIsOpen
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

  if (!isOpen && !pinned) return null;

  return (
    <aside className="w-66 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-20 shadow-2xl shrink-0 text-slate-200">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <Folder className="text-indigo-400" size={18} />
          <h2 className="font-bold text-sm tracking-wide uppercase text-slate-400">Cave Systems</h2>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setPinned(!pinned)} 
            className={`p-1.5 rounded hover:bg-slate-800 transition ${pinned ? 'text-indigo-400 bg-slate-800/50' : 'text-slate-500'}`}
            title={pinned ? "Unpin Sidebar" : "Pin Sidebar"}
          >
            <Pin size={14} className={pinned ? 'rotate-45' : ''} />
          </button>
          <button onClick={onCreateCanvas} className="p-1.5 hover:bg-slate-800 rounded text-emerald-400 transition" title="New Map">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {canvases.map(canvas => {
          const isActive = canvas.id === activeCanvasId;
          const isEditing = canvas.id === editingId;

          return (
            <li
              key={canvas.id}
              onClick={() => !isEditing && setActiveCanvasId(canvas.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg transition-all cursor-pointer border ${
                isActive 
                  ? 'bg-indigo-600/15 border-indigo-500/30 text-white font-medium shadow-sm' 
                  : 'border-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="bg-slate-950 border border-indigo-500 rounded px-2 py-1 text-xs text-white focus:outline-none w-full"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && saveRename(e)}
                  />
                  <button onClick={saveRename} className="p-1 hover:bg-slate-800 rounded text-emerald-400">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 hover:bg-slate-800 rounded text-rose-400">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="truncate pr-2 text-sm">{canvas.name}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button 
                      onClick={(e) => startEditing(canvas, e)} 
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-400 transition"
                      title="Rename"
                    >
                      <Edit2 size={13} />
                    </button>
                    {canvases.length > 1 && (
                      <button 
                        onClick={(e) => onDeleteCanvas(canvas.id, e)} 
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition"
                        title="Delete Map"
                      >
                        <Trash2 size={13} />
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