import { useState, useEffect, useRef } from 'react';
import { MODULE_TEMPLATES } from './constants/mapData';
import { getRequiredDirections, getValidRotationsMulti } from './utils/mapHelpers';
import { useCanvasStore } from './hooks/useCanvasStore';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import ModuleSelectorModal from './components/ModuleSelectorModal';
import MapCanvas from './components/MapCanvas';
import LatticeTooltips from './components/LatticeTooltips';

export default function UnderworldMapper() {
  const {
    canvases, setCanvases, activeCanvasId, setActiveCanvasId,
    modules, isMapEmpty,
    handleCreateCanvas, handleDeleteCanvas, handleRenameCanvas,
    deleteModule,
  } = useCanvasStore();

  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [activePlusTarget, setActivePlusTarget] = useState(null);
  const hoveredModuleKeyRef = useRef(null);

  const [showId, setShowId] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    name: true, coordinates: true, rotation: true, entrance: true, boss: true,
    borders: true, junctions: true, padding: true, lattice: true,
  });
  const [layerOpacity, setLayerOpacity] = useState({ description: 1, item: 1, structure: 1, background: 0.35 });
  const [latticeTooltip, setLatticeTooltip] = useState(null);
  const [hoverTooltip, setHoverTooltip] = useState(null);

  useEffect(() => {
    if (!latticeTooltip) return;
    const close = () => setLatticeTooltip(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [latticeTooltip]);

  // --- KEYBOARD SHORTCUTS: R to rotate, Delete to remove ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = hoveredModuleKeyRef.current;
      if (!key || !modules[key]) return;

      if (e.key.toLowerCase() === 'r') {
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
          return { ...canvas, modules: { ...canvas.modules, [key]: { ...currentModule, rotation: validAngles[nextIndex] } } };
        }));
      } else if (e.key === 'Delete') {
        if (deleteModule(key)) hoveredModuleKeyRef.current = null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modules, activeCanvasId, deleteModule, setCanvases]);

  // --- CORE MODULE PLACEMENT ENGINE ---
  const processModuleAddition = (templateId, targetParams) => {
    const { x, y } = targetParams;
    const template = MODULE_TEMPLATES[templateId];
    const requiredDirs = getRequiredDirections(x, y, modules);
    const validAngles = getValidRotationsMulti(template.junctions, requiredDirs);
    if (requiredDirs.length > 0 && validAngles.length === 0) {
      alert("This module does not have the required junctions to connect here!");
      return;
    }
    const initialRotation = validAngles.length > 0 ? validAngles[0] : 0;
    const newModule = { templateId, x, y, rotation: initialRotation, oreDeposits: (template.latticeNodes || []).map(() => 'IronMalachite') };
    setCanvases(prev => prev.map(canvas => {
      if (canvas.id !== activeCanvasId) return canvas;
      return { ...canvas, modules: { ...canvas.modules, [`${x},${y}`]: newModule } };
    }));
  };

  const handleModalSelect = (templateId) => {
    if (activePlusTarget) processModuleAddition(templateId, activePlusTarget);
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

  const currentDepositId = latticeTooltip
    ? (modules[latticeTooltip.moduleKey]?.oreDeposits?.[latticeTooltip.nodeIndex] ?? 'IronMalachite')
    : null;

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

      <MapCanvas
        modules={modules}
        visibleLayers={visibleLayers}
        layerOpacity={layerOpacity}
        showId={showId}
        isMapEmpty={isMapEmpty}
        onModuleHover={(key) => { hoveredModuleKeyRef.current = key; }}
        onModuleHoverEnd={() => { hoveredModuleKeyRef.current = null; }}
        onNodeHover={(text, x, y) => setHoverTooltip({ text, x, y })}
        onNodeHoverMove={(x, y) => setHoverTooltip(prev => prev ? { ...prev, x, y } : prev)}
        onNodeHoverEnd={() => setHoverTooltip(null)}
        onNodeClick={(moduleKey, nodeIndex, x, y) => { setHoverTooltip(null); setLatticeTooltip({ moduleKey, nodeIndex, x, y }); }}
        onPlusClick={(targetParams) => { setActivePlusTarget(targetParams); setShowSelectorModal(true); }}
        onDrop={handleDrop}
      />

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

      <LatticeTooltips
        hoverTooltip={hoverTooltip}
        latticeTooltip={latticeTooltip}
        currentDepositId={currentDepositId}
        onDepositChange={handleOreDepositChange}
      />
    </div>
  );
}
