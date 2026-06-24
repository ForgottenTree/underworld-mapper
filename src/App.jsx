import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCw } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { MODULE_TEMPLATES, DIRECTION_OFFSETS, CELL_SIZE, CATEGORY_META, getTemplateLabel } from './constants/mapData';
import { getGlobalJunctions, getRequiredDirections, getValidRotationsMulti, getReachableKeys } from './utils/mapHelpers';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import ModuleSelectorModal from './components/ModuleSelectorModal';

const bgImages = import.meta.glob('./assets/background_*.png', { eager: true });
const getBgUrl = (templateId) => bgImages[`./assets/background_${templateId.toLowerCase()}.png`]?.default;

const iconImages = import.meta.glob('./assets/Icon*.png', { eager: true });
const getIconUrl = (filename) => iconImages[`./assets/${filename}`]?.default;

const ORE_DEPOSITS = [
  { id: 'IronMalachite', label: 'Iron Malachite', icon: getIconUrl('IconResourceIronMalachiteCombined.png') },
  { id: 'Cassiterite',   label: 'Cassiterite',    icon: getIconUrl('IconResourceCassiterite.png') },
  { id: 'Coal',          label: 'Coal',            icon: getIconUrl('IconResourceCoal.png') },
];

export default function UnderworldMapper() {
  const [canvases, setCanvases] = useState(() => {
    try {
      const saved = localStorage.getItem('underworld_maps');
      if (saved) return JSON.parse(saved);
    } catch { /* empty */ }
    return [{ id: 'cave-1', name: 'First Cave System', modules: {} }];
  });
  const [activeCanvasId, setActiveCanvasId] = useState(() => {
    try {
      const saved = localStorage.getItem('underworld_active_canvas');
      if (saved) return saved;
    } catch { /* empty */ }
    return 'cave-1';
  });

  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [activePlusTarget, setActivePlusTarget] = useState(null);
  const hoveredModuleKeyRef = useRef(null);

  const [showId, setShowId] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    name: true,
    coordinates: true,
    rotation: true,
    entrance: true,
    boss: true,
    borders: true,
    junctions: true,
    padding: true,
    lattice: true,
  });
  const [layerOpacity, setLayerOpacity] = useState({ description: 1, item: 1, structure: 1, background: 0.35 });
  const [latticeTooltip, setLatticeTooltip] = useState(null);

  useEffect(() => {
    localStorage.setItem('underworld_maps', JSON.stringify(canvases));
  }, [canvases]);

  useEffect(() => {
    localStorage.setItem('underworld_active_canvas', activeCanvasId);
  }, [activeCanvasId]);

  useEffect(() => {
    if (!latticeTooltip) return;
    const close = () => setLatticeTooltip(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [latticeTooltip]);

  const activeCanvas = canvases.find(c => c.id === activeCanvasId) || canvases[0];
  if (activeCanvas.id !== activeCanvasId) setActiveCanvasId(activeCanvas.id);
  const modules = activeCanvas.modules;
  const isMapEmpty = Object.keys(modules).length === 0;

  const deleteModule = useCallback((key) => {
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
  }, [modules, activeCanvasId]);

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

  // --- SMART KEYBOARD DELETE ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = hoveredModuleKeyRef.current;
      if (e.key !== 'Delete' || !key || !modules[key]) return;
      deleteModule(key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modules, activeCanvasId, deleteModule]);

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
    const oreDeposits = (template.latticeNodes || []).map(() => 'IronMalachite');
    const newModule = { templateId, x, y, rotation: initialRotation, oreDeposits };

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

  const handleOreDepositChange = (moduleKey, nodeIndex, depositId) => {
    setCanvases(prev => prev.map(canvas => {
      if (canvas.id !== activeCanvasId) return canvas;
      const mod = canvas.modules[moduleKey];
      if (!mod) return canvas;
      const newDeposits = [...(mod.oreDeposits || [])];
      newDeposits[nodeIndex] = depositId;
      return { ...canvas, modules: { ...canvas.modules, [moduleKey]: { ...mod, oreDeposits: newDeposits } } };
    }));
    setLatticeTooltip(null);
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
          maxScale={6}
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

            const meta = CATEGORY_META[tmpl.category];
            const themeClass = meta?.cardTheme ?? "bg-tactical-panel border-indigo-500/50 text-indigo-300";
            const borderClass = meta?.borderClass ?? 'border-indigo-500/50';
            const bgUrl = getBgUrl(mod.templateId);

            return (
              <div
                key={key}
                onMouseEnter={() => { hoveredModuleKeyRef.current = key; }}
                onMouseLeave={() => { hoveredModuleKeyRef.current = null; }}
                className={`group absolute ${visibleLayers.padding ? 'rounded' : ''} p-3 flex flex-col justify-between transition shadow-xl overflow-hidden ${themeClass}`}
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
                      opacity: layerOpacity.background,
                    }}
                  />
                )}
                <div className="flex justify-between items-start relative z-30" style={{ opacity: layerOpacity.description }}>
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

                {visibleLayers.entrance && tmpl.visual === 'entrance' && (
                  <div className="absolute inset-0 pointer-events-none z-10" style={{ opacity: layerOpacity.item }}>
                    <div
                      className="absolute"
                      style={{
                        left: `${tmpl.visualKeyPosition?.x ?? 50}%`,
                        top: `${tmpl.visualKeyPosition?.y ?? 50}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <img src={getIconUrl('IconEntrance.png')} alt="Entrance" draggable={false} className="w-5 h-5" />
                    </div>
                  </div>
                )}
                {visibleLayers.boss && tmpl.visual === 'boss' && (
                  <div className="absolute inset-0 pointer-events-none z-10" style={{ opacity: layerOpacity.item }}>
                    <div
                      className="absolute"
                      style={{
                        left: `${tmpl.visualKeyPosition?.x ?? 50}%`,
                        top: `${tmpl.visualKeyPosition?.y ?? 50}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <img src={getIconUrl('IconResourceRareMetal.png')} alt="Boss" draggable={false} className="w-5 h-5" />
                    </div>
                  </div>
                )}


                {visibleLayers.borders && (
                  <div
                    className={`absolute inset-0 rounded pointer-events-none border z-20 ${borderClass}`}
                    style={{ opacity: layerOpacity.structure }}
                  />
                )}
                {visibleLayers.junctions && (
                  <div className="absolute inset-0 pointer-events-none z-20" style={{ opacity: layerOpacity.structure }}>
                    {getGlobalJunctions(tmpl.junctions, mod.rotation).map(dir => {
                      const positions = {
                        top: "top-[-4px] left-1/2 -translate-x-1/2 w-4 h-1.5", bottom: "bottom-[-4px] left-1/2 -translate-x-1/2 w-4 h-1.5",
                        left: "left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-4", right: "right-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-4"
                      };
                      return <div key={dir} className={`absolute rounded-xs bg-current ${positions[dir]}`} />;
                    })}
                  </div>
                )}
              </div>
            );
          })}

              {visibleLayers.lattice && Object.entries(modules).map(([key, mod]) => {
                const tmpl = MODULE_TEMPLATES[mod.templateId];
                if (!tmpl) return null;
                const s = visibleLayers.padding ? CELL_SIZE - 12 : CELL_SIZE;
                return (tmpl.latticeNodes || []).map((node, i) => {
                  const depositId = mod.oreDeposits?.[i] ?? 'IronMalachite';
                  const deposit = ORE_DEPOSITS.find(d => d.id === depositId) ?? ORE_DEPOSITS[0];
                  const nodePixelLeft = mod.x * CELL_SIZE - s / 2 + (node.position.x / 100) * s;
                  const nodePixelTop = mod.y * CELL_SIZE - s / 2 + (node.position.y / 100) * s;
                  return (
                    <div
                      key={`lattice-${key}-${i}`}
                      className="absolute interactive-node cursor-pointer"
                      style={{
                        left: `calc(50% + ${nodePixelLeft}px)`,
                        top: `calc(50% + ${nodePixelTop}px)`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 15,
                        opacity: layerOpacity.item,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLatticeTooltip({ moduleKey: key, nodeIndex: i, x: e.clientX, y: e.clientY });
                      }}
                    >
                      <img
                        src={deposit.icon}
                        alt={deposit.label}
                        draggable={false}
                        className="w-4 h-4 block pointer-events-none"
                      />
                    </div>
                  );
                });
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
        layerOpacity={layerOpacity}
        setLayerOpacity={setLayerOpacity}
      />

      <ModuleSelectorModal
        isOpen={showSelectorModal}
        isFirstModule={isMapEmpty}
        onClose={() => { setShowSelectorModal(false); setActivePlusTarget(null); }}
        onSelect={handleModalSelect}
        showId={showId}
      />

      {latticeTooltip && (
        <div
          className="fixed z-50 bg-tactical-panel border border-tactical-border rounded shadow-xl p-1.5 min-w-[148px]"
          style={{ left: latticeTooltip.x + 8, top: latticeTooltip.y + 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          {ORE_DEPOSITS.map(deposit => {
            const current = modules[latticeTooltip.moduleKey]?.oreDeposits?.[latticeTooltip.nodeIndex] ?? 'IronMalachite';
            return (
              <button
                key={deposit.id}
                onClick={() => handleOreDepositChange(latticeTooltip.moduleKey, latticeTooltip.nodeIndex, deposit.id)}
                className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-[12px] transition ${
                  current === deposit.id
                    ? 'bg-tactical-btn text-tactical-text'
                    : 'text-tactical-muted hover:bg-tactical-btn/50 hover:text-tactical-text'
                }`}
              >
                <img src={deposit.icon} alt={deposit.label} className="w-3 h-3 flex-shrink-0" />
                {deposit.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}