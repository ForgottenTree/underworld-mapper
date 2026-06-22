import React, { useState, useEffect } from 'react';
import { 
  Folder, Plus, RotateCw, Trash2, Pin, Menu, X, 
  Layers, ShieldAlert, DoorOpen, Grid
} from 'lucide-react';

// --- MODULE DATA DEFINITIONS ---
const MODULE_TEMPLATES = {
  // Outer Modules
  CornerN02: { id: 'CornerN02', name: 'Corner N02', category: 'outer', junctions: ['left', 'bottom'], visual: 'entrance' },
  EndN02: { id: 'EndN02', name: 'End N02', category: 'outer', junctions: ['bottom'], visual: 'entrance' },
  EntranceN01: { id: 'EntranceN01', name: 'Entrance N01', category: 'outer', junctions: ['bottom'], visual: 'entrance' },
  StraightN01: { id: 'StraightN01', name: 'Straight N01', category: 'outer', junctions: ['bottom', 'top'], visual: 'entrance' },
  
  // Inner Modules
  BranchN01: { id: 'BranchN01', name: 'Branch N01', category: 'inner', junctions: ['left', 'right', 'bottom'] },
  CornerN01: { id: 'CornerN01', name: 'Corner N01', category: 'inner', junctions: ['left', 'bottom'] },
  CrossN01: { id: 'CrossN01', name: 'Cross N01', category: 'inner', junctions: ['left', 'right', 'bottom', 'top'] },
  EndN01: { id: 'EndN01', name: 'End N01', category: 'inner', junctions: ['bottom'] },
  StraightN02: { id: 'StraightN02', name: 'Straight N02', category: 'inner', junctions: ['bottom', 'top'] },
  
  // Boss Modules
  EndNBoss01: { id: 'EndNBoss01', name: 'End NBoss 01', category: 'boss', junctions: ['bottom'], visual: 'boss' },
  StraightNBoss01: { id: 'StraightNBoss01', name: 'Straight NBoss 01', category: 'boss', junctions: ['bottom', 'top'], visual: 'boss' }
};

const DIRECTION_OFFSETS = {
  top: { x: 0, y: -1, opposite: 'bottom' },
  bottom: { x: 0, y: 1, opposite: 'top' },
  left: { x: -1, y: 0, opposite: 'right' },
  right: { x: 1, y: 0, opposite: 'left' }
};

const ROTATIONS = [0, 90, 180, 270];

// Helper to calculate global junction direction based on tile rotation
function getGlobalJunctions(templateJunctions, rotation) {
  const directions = ['top', 'right', 'bottom', 'left'];
  return templateJunctions.map(localDir => {
    const localIdx = directions.indexOf(localDir);
    const shift = rotation / 90;
    const globalIdx = (localIdx + shift) % 4;
    return directions[globalIdx];
  });
}

export default function UnderworldMapper() {
  // --- STATE ---
  const [canvases, setCanvases] = useState(() => {
    const saved = localStorage.getItem('underworld_maps');
    return saved ? JSON.parse(saved) : [
      { id: 'cave-1', name: 'First Cave System', modules: {} }
    ];
  });
  const [activeCanvasId, setActiveCanvasId] = useState('cave-1');
  
  // Responsive / Layout UI State
// Initialize state directly by checking the viewport size, preventing a double-render.
  // The typeof window check ensures it doesn't crash if you ever decide to use Server-Side Rendering (like Next.js).
  const [leftPinned, setLeftPinned] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  
  const [rightPinned, setRightPinned] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  
  // Interaction State
  const [hoveredModuleKey, setHoveredModuleKey] = useState(null);
  const [activePlusTarget, setActivePlusTarget] = useState(null); // {x, y, parentKey, comingFromJunction}
  const [showSelectorModal, setShowSelectorModal] = useState(false);



  // Sync to Local Storage
  useEffect(() => {
    localStorage.setItem('underworld_maps', JSON.stringify(canvases));
  }, [canvases]);

  const activeCanvas = canvases.find(c => c.id === activeCanvasId) || canvases[0];
  const modules = activeCanvas.modules;

  // --- CONTROLLER ACTIONS ---
  const handleCreateCanvas = () => {
    const newId = `cave-${Date.now()}`;
    const newCanvas = { id: newId, name: `New Cave System (${canvases.length + 1})`, modules: {} };
    setCanvases([...canvases, newCanvas]);
    setActiveCanvasId(newId);
  };

  const handleRenameCanvas = (id, newName) => {
    setCanvases(canvases.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleDeleteCanvas = (id, e) => {
    e.stopPropagation();
    if (canvases.length === 1) return;
    const filtered = canvases.filter(c => c.id !== id);
    setCanvases(filtered);
    if (activeCanvasId === id) {
      setActiveCanvasId(filtered[0].id);
    }
  };

  // Logic to place a module down on the grid coordinate map
  const placeModule = (templateId, targetX, targetY, parentKey = null, parentJunction = null) => {
    const template = MODULE_TEMPLATES[templateId];
    let initialRotation = 0;

    // Automatic alignment logic if attached to a parent junction
    if (parentKey && parentJunction && modules[parentKey]) {
      const neededGlobalOpposite = DIRECTION_OFFSETS[parentJunction].opposite;
      // Find the first rotation where one of the module's junctions aligns perfectly
      const validRot = ROTATIONS.find(rot => {
        const globalJuncs = getGlobalJunctions(template.junctions, rot);
        return globalJuncs.includes(neededGlobalOpposite);
      });
      if (validRot !== undefined) initialRotation = validRot;
    }

    const updatedModules = {
      ...modules,
      [`${targetX},${targetY}`]: {
        templateId,
        x: targetX,
        y: targetY,
        rotation: initialRotation,
        parentKey,
        parentJunction
      }
    };

    setCanvases(canvases.map(c => c.id === activeCanvasId ? { ...c, modules: updatedModules } : c));
    setShowSelectorModal(false);
    setActivePlusTarget(null);
  };

  // Keyboard Rotation Logic ('R' Key Handler)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'r' && hoveredModuleKey && modules[hoveredModuleKey]) {
        const targetModule = modules[hoveredModuleKey];
        const template = MODULE_TEMPLATES[targetModule.templateId];
        
        // Find next rotation mapping that preserves connection rule criteria
        let nextRotation = (targetModule.rotation + 90) % 360;
        
        if (targetModule.parentKey && targetModule.parentJunction) {
          const neededGlobalOpposite = DIRECTION_OFFSETS[targetModule.parentJunction].opposite;
          // Cycle rotations until finding one that stays structurally unified
          let foundValid = false;
          let checkRot = nextRotation;
          for (let i = 0; i < 4; i++) {
            const globalJuncs = getGlobalJunctions(template.junctions, checkRot);
            if (globalJuncs.includes(neededGlobalOpposite)) {
              nextRotation = checkRot;
              foundValid = true;
              break;
            }
            checkRot = (checkRot + 90) % 360;
          }
          if (!foundValid) return; 
        }

        const updatedModules = {
          ...modules,
          [hoveredModuleKey]: { ...targetModule, rotation: nextRotation }
        };
        setCanvases(canvases.map(c => c.id === activeCanvasId ? { ...c, modules: updatedModules } : c));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredModuleKey, modules, activeCanvasId, canvases]);

  // --- PLUS NODES GENERATION ---
  const renderPlusButtons = () => {
    const keys = Object.keys(modules);
    if (keys.length === 0) {
      // Prompt center starting point button placement
      return (
        <button 
          onClick={() => {
            setActivePlusTarget({ x: 0, y: 0, parentKey: null, parentJunction: null });
            setShowSelectorModal(true);
          }}
          className="absolute w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 transition transform hover:scale-110 z-10"
          style={{ top: 'calc(50% - 24px)', left: 'calc(50% - 24px)' }}
        >
          <Plus size={24} />
        </button>
      );
    }

    const plusTargets = [];
    keys.forEach(key => {
      const node = modules[key];
      const template = MODULE_TEMPLATES[node.templateId];
      const globalJuncs = getGlobalJunctions(template.junctions, node.rotation);

      globalJuncs.forEach(dir => {
        const offset = DIRECTION_OFFSETS[dir];
        const tx = node.x + offset.x;
        const ty = node.y + offset.y;
        const targetKey = `${tx},${ty}`;

        if (!modules[targetKey]) {
          // Verify no duplicate position indicators get inserted
          if (!plusTargets.some(p => p.x === tx && p.y === ty)) {
            plusTargets.push({ x: tx, y: ty, parentKey: key, parentJunction: dir });
          }
        }
      });
    });

    return plusTargets.map(p => (
      <button
        key={`plus-${p.x}-${p.y}`}
        onClick={() => {
          setActivePlusTarget(p);
          setShowSelectorModal(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const templateId = e.dataTransfer.getData('text/plain');
          const isFirst = Object.keys(modules).length === 0;
          if (isFirst && MODULE_TEMPLATES[templateId].category !== 'outer') return;
          placeModule(templateId, p.x, p.y, p.parentKey, p.parentJunction);
        }}
        className="absolute w-10 h-10 bg-slate-800 border-2 border-dashed border-slate-600 text-slate-400 hover:text-emerald-400 hover:border-emerald-500 rounded-lg flex items-center justify-center transition-all bg-opacity-70 backdrop-blur-xs transform hover:scale-105 z-10"
        style={{
          left: `calc(50% + ${p.x * 120}px - 20px)`,
          top: `calc(50% + ${p.y * 120}px - 20px)`
        }}
      >
        <Plus size={18} />
      </button>
    ));
  };

  const isMapEmpty = Object.keys(modules).length === 0;

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      
      {/* HEADER CONTROLS BAR FOR MOBILE TILES */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40">
        <button onClick={() => setLeftOpen(!leftOpen)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-md">
          <Menu size={20} />
        </button>
        <span className="font-semibold text-indigo-400 tracking-wide text-sm truncate max-w-[180px]">{activeCanvas.name}</span>
        <button onClick={() => setRightOpen(!rightOpen)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-md">
          <Layers size={20} />
        </button>
      </div>

      {/* LEFT SIDEBAR: CAVE WORKSPACES LIST */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 lg:z-20 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 transform
        ${leftOpen ? 'translate-x-0' : '-translate-x-full'}
        ${leftPinned ? 'lg:static lg:translate-x-0' : 'lg:absolute lg:inset-y-0 lg:left-0'}
      `}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between mt-14 lg:mt-0">
          <div className="flex items-center space-x-2 font-bold tracking-wider text-xs uppercase text-slate-400">
            <Folder size={14} className="text-indigo-400" />
            <span>Cave Networks</span>
          </div>
          <button 
            onClick={() => setLeftPinned(!leftPinned)}
            className={`hidden lg:block p-1 rounded-sm transition ${leftPinned ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
            title="Pin Sidebar Layout"
          >
            <Pin size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {canvases.map(canvas => (
            <div
              key={canvas.id}
              onClick={() => { setActiveCanvasId(canvas.id); setLeftOpen(false); }}
              className={`group flex flex-col p-2.5 rounded-lg border cursor-pointer transition relative ${
                canvas.id === activeCanvasId 
                  ? 'bg-slate-800/80 border-indigo-500/50 shadow-xs' 
                  : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40'
              }`}
            >
              <input
                type="text"
                value={canvas.name}
                onChange={(e) => handleRenameCanvas(canvas.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent font-medium text-sm text-slate-200 focus:outline-none focus:border-b focus:border-indigo-500 w-full pr-6 truncate"
              />
              <span className="text-[10px] text-slate-500 mt-1">
                {Object.keys(canvas.modules).length} modules loaded
              </span>
              {canvases.length > 1 && (
                <button 
                  onClick={(e) => handleDeleteCanvas(canvas.id, e)}
                  className="absolute right-2 top-3 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-slate-800">
          <button 
            onClick={handleCreateCanvas}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-xs font-semibold tracking-wide border border-slate-700 flex items-center justify-center space-x-2 transition"
          >
            <Plus size={14} />
            <span>Generate Vault Room</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT MAP SPACE AREA */}
      <main className="flex-1 h-full relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] mt-14 lg:mt-0">
        
        {/* Overlay HUD indicators */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none hidden lg:block">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-slate-300 flex items-center space-x-1.5 mb-1.5">
              <Grid size={12} className="text-slate-400" />
              <span>Keyboard Controls</span>
            </div>
            <p className="text-slate-400"><kbd className="bg-slate-800 border border-slate-600 px-1 rounded text-[10px] text-slate-200">Hover + R</kbd> Cycle rotation rules</p>
          </div>
        </div>

        {/* Dynamic Absolute Anchored Canvas Space Wrapper */}
        <div className="w-full h-full relative">
          {/* Active Canvas Nodes Rendering Layout */}
          {Object.keys(modules).map(key => {
            const node = modules[key];
            const template = MODULE_TEMPLATES[node.templateId];
            return (
              <div
                key={key}
                onMouseEnter={() => setHoveredModuleKey(key)}
                onMouseLeave={() => setHoveredModuleKey(null)}
                className={`absolute w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center p-1 transition bg-slate-900 transition-all duration-150 ${
                  hoveredModuleKey === key 
                    ? 'border-indigo-400 ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-950/50' 
                    : template.category === 'boss' 
                      ? 'border-purple-500/60 shadow-md shadow-purple-950/20' 
                      : template.category === 'outer' 
                        ? 'border-emerald-500/60 shadow-md shadow-emerald-950/20' 
                        : 'border-slate-700'
                }`}
                style={{
                  left: `calc(50% + ${node.x * 120}px - 48px)`,
                  top: `calc(50% + ${node.y * 120}px - 48px)`
                }}
              >
                {/* Visual Connection Points/Junction Markers */}
                {template.junctions.map(dir => {
                  // Transform local layout direction to active rotation mapping coordinates
                  const directions = ['top', 'right', 'bottom', 'left'];
                  const localIdx = directions.indexOf(dir);
                  const shiftedIdx = (localIdx + (node.rotation / 90)) % 4;
                  const currentGlobalDir = directions[shiftedIdx];

                  return (
                    <div 
                      key={dir} 
                      className="absolute w-2 h-2 rounded-full bg-indigo-400/80 shadow-xs"
                      style={{
                        top: currentGlobalDir === 'top' ? '-4px' : currentGlobalDir === 'bottom' ? 'calc(100% - 4px)' : 'calc(50% - 4px)',
                        left: currentGlobalDir === 'left' ? '-4px' : currentGlobalDir === 'right' ? 'calc(100% - 4px)' : 'calc(50% - 4px)',
                      }}
                    />
                  );
                })}

                {/* Categorization Specialized Visual Nodes Dots */}
                {template.visual === 'entrance' && (
                  <div className="absolute w-3 h-3 bg-emerald-400 rounded-full border border-slate-900 animate-pulse shadow-md shadow-emerald-400/40" title="Overworld Entrance" />
                )}
                {template.visual === 'boss' && (
                  <div className="absolute w-3 h-3 bg-purple-500 rounded-full border border-slate-900 shadow-md shadow-purple-500/40" title="Boss Arena Location" />
                )}

                {/* Block Meta Elements Labels */}
                <span className="text-[9px] font-bold tracking-tight text-slate-300 text-center px-1 line-clamp-2 mt-1">
                  {template.name}
                </span>

                {/* Tooltip Rotation Action UI */}
                {hoveredModuleKey === key && (
                  <div className="absolute -bottom-7 bg-slate-950 border border-slate-800 text-[9px] text-slate-400 px-1.5 py-0.5 rounded flex items-center space-x-1 whitespace-nowrap shadow-xl">
                    <RotateCw size={8} />
                    <span>Press R ({node.rotation}°)</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Plus Sign Anchor Ingestion Connectors */}
          {renderPlusButtons()}
        </div>
      </main>

      {/* RIGHT SIDEBAR: DRAGGABLE MAP SCHEMATICS DRAWER */}
      <aside className={`
        fixed inset-y-0 right-0 z-30 lg:z-20 w-72 bg-slate-900 border-l border-slate-800 flex flex-col justify-between transition-transform duration-300 transform
        ${rightOpen ? 'translate-x-0' : 'translate-x-full'}
        ${rightPinned ? 'lg:static lg:translate-x-0' : 'lg:absolute lg:inset-y-0 lg:right-0'}
      `}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between mt-14 lg:mt-0">
          <div className="flex items-center space-x-2 font-bold tracking-wider text-xs uppercase text-slate-400">
            <Layers size={14} className="text-indigo-400" />
            <span>Map Assembly Elements</span>
          </div>
          <button 
            onClick={() => setRightPinned(!rightPinned)}
            className={`hidden lg:block p-1 rounded-sm transition ${rightPinned ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
            title="Pin Catalog Panel"
          >
            <Pin size={14} />
          </button>
        </div>

        {/* Catalog Item Container Block Elements list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {['outer', 'inner', 'boss'].map(cat => {
            const catModules = Object.values(MODULE_TEMPLATES).filter(m => m.category === cat);
            const isLocked = isMapEmpty && cat !== 'outer';

            return (
              <div key={cat} className={`space-y-2 ${isLocked ? 'opacity-40' : ''}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  {cat} Blocks {isLocked && '🔒'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {catModules.map(item => (
                    <div
                      key={item.id}
                      draggable={!isLocked}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', item.id);
                        setRightOpen(false);
                      }}
                      className={`p-2 bg-slate-950 border rounded-lg text-center flex flex-col items-center justify-center transition ${
                        isLocked 
                          ? 'border-slate-900 cursor-not-allowed select-none' 
                          : 'border-slate-800 hover:border-slate-600 active:scale-95 cursor-grab'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full mb-1.5 ${
                        cat === 'outer' ? 'bg-emerald-400' : cat === 'boss' ? 'bg-purple-500' : 'bg-slate-600'
                      }`} />
                      <span className="text-[10px] font-semibold text-slate-300 truncate w-full">{item.name}</span>
                      <span className="text-[8px] text-slate-500 mt-0.5">{item.junctions.length} Junctions</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* CLICK INTERACTION SELECTION MODAL SYSTEM POPUP */}
      {showSelectorModal && activePlusTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-wide text-slate-200">Affix Core Module Piece</h3>
                <p className="text-xs text-slate-400 mt-0.5">Assign room structure blueprint matrix coordinates</p>
              </div>
              <button onClick={() => setShowSelectorModal(false)} className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg">
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
              {['outer', 'inner', 'boss'].map(cat => {
                const catModules = Object.values(MODULE_TEMPLATES).filter(m => m.category === cat);
                const isLocked = isMapEmpty && cat !== 'outer';

                return (
                  <div key={cat} className={`space-y-1.5 ${isLocked ? 'opacity-30' : ''}`}>
                    <span className="text-[9px] font-bold tracking-wider uppercase text-slate-500 block">{cat} Modules</span>
                    <div className="grid grid-cols-2 gap-2">
                      {catModules.map(item => (
                        <button
                          key={item.id}
                          disabled={isLocked}
                          onClick={() => placeModule(item.id, activePlusTarget.x, activePlusTarget.y, activePlusTarget.parentKey, activePlusTarget.parentJunction)}
                          className="p-2.5 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg text-left flex flex-col justify-between transition disabled:cursor-not-allowed w-full group"
                        >
                          <span className="text-xs font-semibold text-slate-300 group-hover:text-white truncate">{item.name}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5">{item.junctions.join(', ')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}