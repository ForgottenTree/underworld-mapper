import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { MODULE_TEMPLATES, DIRECTION_OFFSETS, CELL_SIZE } from '../constants/mapData';
import { getGlobalJunctions } from '../utils/mapHelpers';
import ModuleCard from './ModuleCard';
import LatticeLayer from './LatticeLayer';

const TACTICAL_BTN_CLASS = "bg-[#1f2938] border border-[#506789] text-[#f3f7ff] hover:bg-[#334057] hover:border-tactical-accent focus:outline-none focus:ring-1 focus:ring-tactical-accent";

export default function MapCanvas({
  modules,
  visibleLayers,
  layerOpacity,
  showId,
  isMapEmpty,
  onModuleHover,
  onModuleHoverEnd,
  onNodeHover,
  onNodeHoverMove,
  onNodeHoverEnd,
  onNodeClick,
  onPlusClick,
  onDrop,
}) {
  const handleDragOver = (e) => e.preventDefault();

  const renderPlusButtons = () => {
    if (isMapEmpty) {
      const targetParams = { x: 0, y: 0 };
      return (
        <button
          onClick={() => onPlusClick(targetParams)}
          onDragOver={handleDragOver}
          onDrop={(e) => onDrop(e, targetParams)}
          className={`absolute w-12 h-12 rounded flex items-center justify-center text-xl font-bold transition transform hover:scale-105 z-10 cursor-pointer interactive-node shadow-lg ${TACTICAL_BTN_CLASS}`}
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
      getGlobalJunctions(template.junctions, mod.rotation).forEach(juncDir => {
        const offset = DIRECTION_OFFSETS[juncDir];
        const tx = mod.x + offset.x;
        const ty = mod.y + offset.y;
        const targetKey = `${tx},${ty}`;
        if (!modules[targetKey]) targets[targetKey] = { x: tx, y: ty };
      });
    });

    return Object.values(targets).map(t => (
      <button
        key={`${t.x},${t.y}`}
        onClick={() => onPlusClick(t)}
        onDragOver={handleDragOver}
        onDrop={(e) => onDrop(e, t)}
        className={`absolute w-8 h-8 rounded flex items-center justify-center text-sm transition transform hover:scale-110 z-10 cursor-pointer interactive-node shadow-md ${TACTICAL_BTN_CLASS}`}
        style={{ left: `calc(50% + ${t.x * CELL_SIZE}px - 16px)`, top: `calc(50% + ${t.y * CELL_SIZE}px - 16px)` }}
      >
        +
      </button>
    ));
  };

  return (
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
              return (
                <ModuleCard
                  key={key}
                  mod={mod}
                  tmpl={tmpl}
                  visibleLayers={visibleLayers}
                  layerOpacity={layerOpacity}
                  showId={showId}
                  onMouseEnter={() => onModuleHover(key)}
                  onMouseLeave={onModuleHoverEnd}
                />
              );
            })}

            <LatticeLayer
              modules={modules}
              visibleLayers={visibleLayers}
              layerOpacity={layerOpacity}
              onNodeHover={onNodeHover}
              onNodeHoverMove={onNodeHoverMove}
              onNodeHoverEnd={onNodeHoverEnd}
              onNodeClick={onNodeClick}
            />

            {renderPlusButtons()}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </main>
  );
}
