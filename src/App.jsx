import { useState, useEffect, useRef } from 'react';
import { RotateCw, Trash2 } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { MODULE_TEMPLATES, DIRECTION_OFFSETS, CELL_SIZE, CATEGORY_META, getTemplateLabel } from './constants/mapData';
import { getGlobalJunctions, getRequiredDirections, getValidRotationsMulti, getReachableKeys } from './utils/mapHelpers';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import ModuleSelectorModal from './components/ModuleSelectorModal';

const bgImages = import.meta.glob('./assets/background_*.png', { eager: true });
const getBgUrl = (templateId) => bgImages[`./assets/background_${templateId.toLowerCase()}.png`]?.default;

export default function UnderworldMapper() {
  const [canvases, setCanvases] = useState(() => {
    try {
      const saved = localStorage.getItem('underworld_maps');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ id: 'cave-1', name: 'First Cave System', modules: {} }];
  });
  const [activeCanvasId, setActiveCanvasId] = useState('cave-1');

  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [activePlusTarget, setActivePlusTarget] = useState(null);
  const hoveredModuleKeyRef = useRef(null);

  const [showId, setShowId] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({ name: true, coordinates: true, rotation: true, dots: true, borders: true, junctions: true, padding: true });
  const [bgOpacity, setBgOpacity] = useState(0.35);

  useEffect(() => {
    localStorage.setItem('underworld_maps', JSON.stringify(canvases));
  }, [canvases]);

  const activeCanvas = canvases.find(c => c.id === activeCanvasId) || canvases[0];
  const modules = activeCanvas.modules;
  const isMapEmpty = Object.keys(modules).length === 0;

  // --- SMART KEYBOARD ROTATION ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = hoveredModuleKeyRef.current;
      if (e.key.toLowerCase() !== 'r' || !key || !modules[key]) return;
      setCanvases(prev => prev.map(canvas => {
        if (canvas.id !== activeCanvasId) return canvas;
        const currentModule = canvas.modules[key];
        if (!currentModule) return canvas;

        const template = MODULE_TEMPLATES[currentModule.templateId];
        const requiredDirs = getRequiredDirections(currentModule.x, currentModule.y, canvas.modules);
        const validAngles = getValidRotationsMulti(template.junctions, requiredDirs);

        if (validAngles.length === 0) return canvas;

        const currentIndex = validAngles.indexOf(currentModule.rotation);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % validAngles.length;
        const nextRotation = validAngles[nextIndex];

        return {
          ...canvas,
          modules: { ...canvas.modules, [key]: { ...currentModule, rotation: nextRotation } }
        };
      }));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modules, activeCanvasId]);

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
    const { x, y } = targetParams;
    const template = MODULE_TEMPLATES[templateId];

    let initialRotation = 0;

    const requiredDirs = getRequiredDirections(x, y, modules);
    const validAngles = getValidRotationsMulti(template.junctions, requiredDirs);

    if (requiredDirs.length > 0 && validAngles.length === 0) {
      alert("This module does not have the required junctions to connect here!");
      return;
    }
    if (validAngles.length > 0) {
      initialRotation = validAngles[0];
    }

    const key = `${x},${y}`;
    const newModule = { templateId, x, y, rotation: initialRotation };

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

    // Build the module set without the deleted room, then BFS from entrances
    // through the junction graph to find what remains reachable.
    const proposedModules = { ...modules };
    delete proposedModules[key];

    const entranceKeys = Object.keys(proposedModules).filter(k =>
      MODULE_TEMPLATES[proposedModules[k]?.templateId]?.visual === 'entrance'
    );
    const reachable = getReachableKeys(entranceKeys, proposedModules);

    const toDelete = new Set([key]);
    Object.keys(proposedModules).forEach(k => {
      if (!reachable.has(k)) toDelete.add(k);
    });

    const orphanCount = toDelete.size - 1;
    if (orphanCount > 0 && !window.confirm(`Deleting this room will also remove ${orphanCount} disconnected room(s). Continue?`)) {
      return;
    }

    setCanvases(prev => prev.map(canvas => {
      if (canvas.id !== activeCanvasId) return canvas;
      const updatedModules = { ...canvas.modules };
      toDelete.forEach(k => delete updatedModules[k]);
      return { ...canvas, modules: updatedModules };
    }));
    if (toDelete.has(hoveredModuleKeyRef.current)) hoveredModuleKeyRef.current = null;
  };

  // --- NODE RENDERING ---
  const renderPlusButtons = () => {
    // Tactical styling directly pulled from the Old Guards buttons
    const tacticalBtnClass = "bg-[#1f2938] border border-[#506789] text-[#f3f7ff] hover:bg-[#334057] hover:border-tactical-accent focus:outline-none focus:ring-1 focus:ring-tactical-accent";

    if (isMapEmpty) {
      const targetParams = { x: 0, y: 0 };
      return (
        <button
          onClick={() => { setActivePlusTarget(targetParams); setShowSelectorModal(true); }}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, targetParams)}
          className={`absolute w-12 h-12 rounded flex items-center justify-center text-xl font-bold transition transform hover:scale-105 z-10 cursor-pointer interactive-node shadow-lg ${tacticalBtnClass}`}
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
          targets[targetKey] = { x: tx, y: ty };
        }
      });
    });

    return Object.values(targets).map(t => (
      <button
        key={`${t.x},${t.y}`}
        onClick={() => { setActivePlusTarget(t); setShowSelectorModal(true); }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, t)}
        className={`absolute w-8 h-8 rounded flex items-center justify-center text-sm transition transform hover:scale-110 z-10 cursor-pointer interactive-node shadow-md ${tacticalBtnClass}`}
        style={{ left: `calc(50% + ${t.x * CELL_SIZE}px - 16px)`, top: `calc(50% + ${t.y * CELL_SIZE}px - 16px)` }}
      >
        +
      </button>
    ));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-tactical-bg font-sans text-tactical-text select-none">
      
      <LeftSidebar
        canvases={canvases} 
        activeCanvasId={activeCanvasId} 
        setActiveCanvasId={setActiveCanvasId}
        onCreateCanvas={handleCreateCanvas} 
        onDeleteCanvas={handleDeleteCanvas} 
        onRenameCanvas={handleRenameCanvas}
      />

      <main className="flex-1 relative overflow-hidden h-full">
        <TransformWrapper
          initialScale={1}
          minScale={0.7}
          maxScale={4}
          limitToBounds={false}
          smooth={false}
          wheel={{ step: 0.308 }}
          doubleClick={{ disabled: true }}
          panning={{ excluded: ['interactive-node'] }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%' }}
          >
            <div className="w-full h-full bg-tactical-bg relative">

              {Object.entries(modules).map(([key, mod]) => {
            const tmpl = MODULE_TEMPLATES[mod.templateId];
            if (!tmpl) return null;

            const themeClass = CATEGORY_META[tmpl.category]?.cardTheme ?? "bg-tactical-panel border-indigo-500/50 text-indigo-300";
            const bgUrl = getBgUrl(mod.templateId);

            return (
              <div
                key={key}
                onMouseEnter={() => { hoveredModuleKeyRef.current = key; }}
                onMouseLeave={() => { hoveredModuleKeyRef.current = null; }}
                className={`group absolute ${visibleLayers.padding ? 'rounded' : ''} ${visibleLayers.borders ? 'border' : ''} p-3 flex flex-col justify-between transition shadow-xl overflow-hidden ${themeClass}`}
                style={(() => {
                  const s = visibleLayers.padding ? CELL_SIZE - 12 : CELL_SIZE;
                  return {
                    width: `${s}px`, height: `${s}px`,
                    left: `calc(50% + ${mod.x * CELL_SIZE}px - ${s / 2}px)`,
                    top: `calc(50% + ${mod.y * CELL_SIZE}px - ${s / 2}px)`
                  };
                })()}
              >
                {bgUrl && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `url(${bgUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transform: `rotate(${mod.rotation}deg) scale(1)`,
                      opacity: bgOpacity,
                    }}
                  />
                )}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    {visibleLayers.name && (
                      <span className="text-[12px] font-bold tracking-tight truncate w-24">{getTemplateLabel(tmpl, showId)}</span>
                    )}
                    {visibleLayers.coordinates && (
                      <span className="text-[10px] opacity-60 font-mono text-tactical-muted">({mod.x}, {mod.y})</span>
                    )}
                  </div>
                  {visibleLayers.rotation && (
                    <div className="transition-transform duration-200 text-tactical-muted" style={{ transform: `rotate(${mod.rotation}deg)` }}>
                      <RotateCw size={12} />
                    </div>
                  )}
                </div>

                {visibleLayers.dots && (
                  <>
                    {tmpl.visual === 'entrance' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] border border-white/20" />
                      </div>
                    )}
                    {tmpl.visual === 'boss' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-3.5 h-3.5 bg-rose-600 rounded-xs rotate-45 border border-white/20 shadow-[0_0_8px_rgba(225,29,72,0.5)]" />
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center justify-end gap-1 transition-opacity opacity-0 group-hover:opacity-100">
                  <button onClick={(e) => handleDeleteModule(key, e)} className="p-1.5 bg-tactical-bg border border-tactical-border hover:bg-tactical-btn hover:border-rose-500 rounded text-tactical-muted hover:text-rose-400 cursor-pointer transition" title="Demolish Room">
                    <Trash2 size={12} />
                  </button>
                </div>

                {visibleLayers.junctions && getGlobalJunctions(tmpl.junctions, mod.rotation).map(dir => {
                  const positions = {
                    top: "top-[-4px] left-1/2 -translate-x-1/2 w-4 h-1.5", bottom: "bottom-[-4px] left-1/2 -translate-x-1/2 w-4 h-1.5",
                    left: "left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-4", right: "right-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-4"
                  };
                  return <div key={dir} className={`absolute rounded-xs bg-current ${positions[dir]}`} />;
                })}
              </div>
            );
          })}

              {renderPlusButtons()}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </main>

      <RightSidebar
        showId={showId}
        setShowId={setShowId}
        visibleLayers={visibleLayers}
        setVisibleLayers={setVisibleLayers}
        bgOpacity={bgOpacity}
        setBgOpacity={setBgOpacity}
      />

      <ModuleSelectorModal
        isOpen={showSelectorModal}
        isFirstModule={isMapEmpty}
        onClose={() => { setShowSelectorModal(false); setActivePlusTarget(null); }}
        onSelect={handleModalSelect}
        showId={showId}
      />
    </div>
  );
}