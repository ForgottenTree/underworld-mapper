// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import { RotateCw, Trash2 } from 'lucide-react';
import { MODULE_TEMPLATES, DIRECTION_OFFSETS, ROTATIONS, CELL_SIZE } from './constants/mapData';
import { getGlobalJunctions, getValidRotations } from './utils/mapHelpers';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import ModuleSelectorModal from './components/ModuleSelectorModal';

export default function UnderworldMapper() {
  const [canvases, setCanvases] = useState(() => {
    const saved = localStorage.getItem('underworld_maps');
    return saved ? JSON.parse(saved) : [{ id: 'cave-1', name: 'First Cave System', modules: {} }];
  });
  const [activeCanvasId, setActiveCanvasId] = useState('cave-1');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [activePlusTarget, setActivePlusTarget] = useState(null);
  const [hoveredModuleKey, setHoveredModuleKey] = useState(null);

  useEffect(() => {
    localStorage.setItem('underworld_maps', JSON.stringify(canvases));
  }, [canvases]);

  const activeCanvas = canvases.find(c => c.id === activeCanvasId) || canvases[0];
  const modules = activeCanvas.modules;
  const isMapEmpty = Object.keys(modules).length === 0;

  // --- SMART KEYBOARD ROTATION ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'r' && hoveredModuleKey && modules[hoveredModuleKey]) {
        setCanvases(prev => prev.map(canvas => {
          if (canvas.id !== activeCanvasId) return canvas;
          const currentModule = canvas.modules[hoveredModuleKey];
          if (!currentModule) return canvas;
          
          const template = MODULE_TEMPLATES[currentModule.templateId];
          let validAngles = ROTATIONS;

          if (currentModule.parentJunction) {
            const requiredGlobalDir = DIRECTION_OFFSETS[currentModule.parentJunction].opposite;
            validAngles = getValidRotations(template.junctions, requiredGlobalDir);
          }

          if (validAngles.length === 0) return canvas;

          const currentIndex = validAngles.indexOf(currentModule.rotation);
          const nextIndex = (currentIndex + 1) % validAngles.length;
          const nextRotation = validAngles[nextIndex !== -1 ? nextIndex : 0];

          return {
            ...canvas,
            modules: {
              ...canvas.modules,
              [hoveredModuleKey]: { ...currentModule, rotation: nextRotation }
            }
          };
        }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredModuleKey, modules, activeCanvasId]);

  // --- PANNING HANDLERS ---
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('.interactive-node')) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };
  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPanOffset({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
  };
  const handleMouseUp = () => setIsPanning(false);

  // --- CANVAS MANAGEMENT ---
  const handleCreateCanvas = () => {
    const newId = `cave-${Date.now()}`;
    const newCanvas = { id: newId, name: `New Cave System (${canvases.length + 1})`, modules: {} };
    setCanvases([...canvases, newCanvas]);
    setActiveCanvasId(newId);
  };
  const handleDeleteCanvas = (id, e) => {
    e.stopPropagation();
    if (canvases.length === 1) return;
    const filtered = canvases.filter(c => c.id !== id);
    setCanvases(filtered);
    if (activeCanvasId === id) setActiveCanvasId(filtered[0].id);
  };
  const handleRenameCanvas = (id, newName) => {
    setCanvases(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  // --- CORE MODULE PLACEMENT ENGINE ---
  const processModuleAddition = (templateId, targetParams) => {
    const { x, y, parentKey, parentJunction } = targetParams;
    const template = MODULE_TEMPLATES[templateId];
    
    let initialRotation = 0;

    if (parentJunction) {
      const requiredGlobalDir = DIRECTION_OFFSETS[parentJunction].opposite;
      const validAngles = getValidRotations(template.junctions, requiredGlobalDir);
      
      if (validAngles.length === 0) {
        alert("This module does not have the required junction to connect here!");
        return;
      }
      initialRotation = validAngles[0];
    }

    const key = `${x},${y}`;
    const newModule = { templateId, x, y, rotation: initialRotation, parentKey, parentJunction };

    setCanvases(prev => prev.map(canvas => {
      if (canvas.id !== activeCanvasId) return canvas;
      return { ...canvas, modules: { ...canvas.modules, [key]: newModule } };
    }));
  };

  const handleModalSelect = (templateId) => {
    if (activePlusTarget) {
      processModuleAddition(templateId, activePlusTarget);
    }
    setShowSelectorModal(false);
    setActivePlusTarget(null);
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetParams) => {
    e.preventDefault();
    const templateId = e.dataTransfer.getData('templateId');
    if (!templateId) return;

    const template = MODULE_TEMPLATES[templateId];
    if (isMapEmpty && template.category !== 'outer') {
      alert("The first module of a cave must be an Outer Module!");
      return;
    }
    processModuleAddition(templateId, targetParams);
  };

  const handleDeleteModule = (key, e) => {
    e.stopPropagation();
    setCanvases(prev => prev.map(canvas => {
      if (canvas.id !== activeCanvasId) return canvas;
      const updatedModules = { ...canvas.modules };
      delete updatedModules[key];
      return { ...canvas, modules: updatedModules };
    }));
    if (hoveredModuleKey === key) setHoveredModuleKey(null);
  };

  // --- NODE RENDERING ---
  const renderPlusButtons = () => {
    if (isMapEmpty) {
      const targetParams = { x: 0, y: 0, parentKey: null, parentJunction: null };
      return (
        <button
          onClick={() => { setActivePlusTarget(targetParams); setShowSelectorModal(true); }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, targetParams)}
          className="absolute w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-xl shadow-indigo-500/30 transition transform hover:scale-110 z-10 cursor-pointer interactive-node border-2 border-indigo-400"
          style={{ top: 'calc(50% - 24px)', left: 'calc(50% - 24px)' }}
        >
          +
        </button>
      );
    }

    const targets = {};
    Object.keys(modules).forEach(key => {
      const mod = modules[key];
      const template = MODULE_TEMPLATES[mod.templateId];
      if (!template) return;

      const globalJunctions = getGlobalJunctions(template.junctions, mod.rotation);
      globalJunctions.forEach(juncDir => {
        const offset = DIRECTION_OFFSETS[juncDir];
        const tx = mod.x + offset.x;
        const ty = mod.y + offset.y;
        const targetKey = `${tx},${ty}`;

        if (!modules[targetKey]) {
          targets[targetKey] = { x: tx, y: ty, parentKey: key, parentJunction: juncDir };
        }
      });
    });

    return Object.values(targets).map(t => (
      <button
        key={`${t.x},${t.y}`}
        onClick={() => { setActivePlusTarget(t); setShowSelectorModal(true); }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, t)}
        className="absolute w-8 h-8 bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold rounded-full flex items-center justify-center text-sm shadow-md transition transform hover:scale-110 z-10 cursor-pointer border border-indigo-400 interactive-node"
        style={{ left: `calc(50% + ${t.x * CELL_SIZE}px - 16px)`, top: `calc(50% + ${t.y * CELL_SIZE}px - 16px)` }}
      >
        +
      </button>
    ));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-200 select-none">
      
      <LeftSidebar
        canvases={canvases} 
        activeCanvasId={activeCanvasId} 
        setActiveCanvasId={setActiveCanvasId}
        onCreateCanvas={handleCreateCanvas} 
        onDeleteCanvas={handleDeleteCanvas} 
        onRenameCanvas={handleRenameCanvas}
      />

      <main 
        className={`flex-1 relative overflow-hidden h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
      >
        <div className="absolute inset-0 w-full h-full"
          style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)`, transition: isPanning ? 'none' : 'transform 0.05s ease-out' }}>
          
          {Object.entries(modules).map(([key, mod]) => {
            const tmpl = MODULE_TEMPLATES[mod.templateId];
            if (!tmpl) return null;
            const isHovered = hoveredModuleKey === key;

            let themeClass = "bg-slate-900 border-indigo-500/40 text-indigo-400";
            if (tmpl.category === 'outer') themeClass = "bg-slate-900 border-emerald-500/40 text-emerald-400";
            if (tmpl.category === 'boss') themeClass = "bg-slate-900 border-rose-500/40 text-rose-400";

            return (
              <div
                key={key} onMouseEnter={() => setHoveredModuleKey(key)} onMouseLeave={() => setHoveredModuleKey(null)}
                className={`absolute rounded-xl border-2 p-3 flex flex-col justify-between transition shadow-xl ${themeClass}`}
                style={{
                  width: `${CELL_SIZE - 12}px`, height: `${CELL_SIZE - 12}px`,
                  left: `calc(50% + ${mod.x * CELL_SIZE}px - ${(CELL_SIZE - 12) / 2}px)`,
                  top: `calc(50% + ${mod.y * CELL_SIZE}px - ${(CELL_SIZE - 12) / 2}px)`
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold tracking-tight text-slate-100 truncate w-24">{tmpl.name}</span>
                    <span className="text-[9px] opacity-50 font-mono">({mod.x}, {mod.y})</span>
                  </div>
                  <div className="transition-transform duration-200" style={{ transform: `rotate(${mod.rotation}deg)` }}>
                    <RotateCw size={11} className="opacity-60" />
                  </div>
                </div>

                {tmpl.visual === 'entrance' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse shadow-md shadow-emerald-500/50 border border-white/20" />
                  </div>
                )}
                {tmpl.visual === 'boss' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-4 bg-rose-600 rounded-xs rotate-45 border border-white/20 shadow-md shadow-rose-500/40" />
                  </div>
                )}

                <div className={`flex items-center justify-end gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                  <button onClick={(e) => handleDeleteModule(key, e)} className="p-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 rounded text-slate-400 cursor-pointer" title="Demolish Room">
                    <Trash2 size={11} />
                  </button>
                </div>

                {getGlobalJunctions(tmpl.junctions, mod.rotation).map(dir => {
                  const positions = {
                    top: "top-[-3px] left-1/2 -translate-x-1/2 w-4 h-1", bottom: "bottom-[-3px] left-1/2 -translate-x-1/2 w-4 h-1",
                    left: "left-[-3px] top-1/2 -translate-y-1/2 w-1 h-4", right: "right-[-3px] top-1/2 -translate-y-1/2 w-1 h-4"
                  };
                  return <div key={dir} className={`absolute rounded-full bg-current ${positions[dir]}`} />;
                })}
              </div>
            );
          })}

          {renderPlusButtons()}
        </div>
      </main>

      <RightSidebar />

      <ModuleSelectorModal
        isOpen={showSelectorModal}
        isFirstModule={isMapEmpty}
        onClose={() => { setShowSelectorModal(false); setActivePlusTarget(null); }}
        onSelect={handleModalSelect}
      />
    </div>
  );
}