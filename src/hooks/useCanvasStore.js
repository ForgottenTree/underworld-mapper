import { useState, useEffect, useCallback } from 'react';
import { MODULE_TEMPLATES } from '../constants/mapData';
import { getReachableKeys } from '../utils/mapHelpers';

export function useCanvasStore() {
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

  useEffect(() => {
    localStorage.setItem('underworld_maps', JSON.stringify(canvases));
  }, [canvases]);

  useEffect(() => {
    localStorage.setItem('underworld_active_canvas', activeCanvasId);
  }, [activeCanvasId]);

  const activeCanvas = canvases.find(c => c.id === activeCanvasId) ?? canvases[0];
  useEffect(() => {
    if (activeCanvas.id !== activeCanvasId) setActiveCanvasId(activeCanvas.id);
  }, [activeCanvas.id, activeCanvasId]);

  const modules = activeCanvas.modules;
  const isMapEmpty = Object.keys(modules).length === 0;

  const handleCreateCanvas = useCallback(() => {
    setCanvases(prev => {
      const newId = `cave-${Date.now()}`;
      const newCanvas = { id: newId, name: `New Cave System (${prev.length + 1})`, modules: {} };
      setActiveCanvasId(newId);
      return [...prev, newCanvas];
    });
  }, []);

  const handleDeleteCanvas = useCallback((id, e) => {
    e.stopPropagation();
    setCanvases(prev => {
      if (prev.length === 1) return prev;
      const filtered = prev.filter(c => c.id !== id);
      setActiveCanvasId(cur => cur === id ? filtered[0].id : cur);
      return filtered;
    });
  }, []);

  const handleRenameCanvas = useCallback((id, newName) => {
    setCanvases(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  }, []);

  const deleteModule = useCallback((key) => {
    const proposedModules = { ...modules };
    delete proposedModules[key];

    const entranceKeys = Object.keys(proposedModules).filter(k =>
      MODULE_TEMPLATES[proposedModules[k]?.templateId]?.visualKeys?.some(vk => vk.icon === 'entrance')
    );
    const reachable = getReachableKeys(entranceKeys, proposedModules);

    const toDelete = new Set([key]);
    Object.keys(proposedModules).forEach(k => {
      if (!reachable.has(k)) toDelete.add(k);
    });

    const orphanCount = toDelete.size - 1;
    if (orphanCount > 0 && !window.confirm(`Deleting this room will also remove ${orphanCount} disconnected room(s). Continue?`)) {
      return false;
    }

    setCanvases(prev => prev.map(canvas => {
      if (canvas.id !== activeCanvasId) return canvas;
      const updatedModules = { ...canvas.modules };
      toDelete.forEach(k => delete updatedModules[k]);
      return { ...canvas, modules: updatedModules };
    }));
    return true;
  }, [modules, activeCanvasId]);

  return {
    canvases,
    setCanvases,
    activeCanvasId,
    setActiveCanvasId,
    modules,
    isMapEmpty,
    handleCreateCanvas,
    handleDeleteCanvas,
    handleRenameCanvas,
    deleteModule,
  };
}
