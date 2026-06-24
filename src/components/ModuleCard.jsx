import { RotateCw } from 'lucide-react';
import { CATEGORY_META, CELL_SIZE, getTemplateLabel } from '../constants/mapData';
import { getGlobalJunctions, rotatePosition } from '../utils/mapHelpers';
import { getBgUrl, getIconUrl } from '../utils/assets';

export default function ModuleCard({ mod, tmpl, visibleLayers, layerOpacity, showId, onMouseEnter, onMouseLeave }) {
  const meta = CATEGORY_META[tmpl.category];
  const themeClass = meta?.cardTheme ?? "bg-tactical-panel border-indigo-500/50 text-indigo-300";
  const borderClass = meta?.borderClass ?? 'border-indigo-500/50';
  const bgUrl = getBgUrl(mod.templateId);
  const s = visibleLayers.padding ? CELL_SIZE - 12 : CELL_SIZE;
  const moduleStyle = {
    width: `${s}px`, height: `${s}px`,
    left: `calc(50% + ${mod.x * CELL_SIZE}px - ${s / 2}px)`,
    top: `calc(50% + ${mod.y * CELL_SIZE}px - ${s / 2}px)`,
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group absolute ${visibleLayers.padding ? 'rounded' : ''} p-3 flex flex-col justify-between transition shadow-xl overflow-hidden ${themeClass}`}
      style={moduleStyle}
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

      {(tmpl.visualKeys || []).map((vk, i) => {
        const isEntrance = vk.icon === 'entrance';
        if (isEntrance ? !visibleLayers.entrance : !visibleLayers.boss) return null;
        const iconFile = isEntrance ? 'IconEntrance.png' : 'IconResourceRareMetal.png';
        const rp = rotatePosition(vk.position.x, vk.position.y, mod.rotation);
        return (
          <div key={`vk-${i}`} className="absolute inset-0 pointer-events-none z-10" style={{ opacity: layerOpacity.item }}>
            <div className="absolute" style={{ left: `${rp.x}%`, top: `${rp.y}%`, transform: 'translate(-50%, -50%)' }}>
              <img src={getIconUrl(iconFile)} alt={vk.icon} draggable={false} className="w-5 h-5" />
            </div>
          </div>
        );
      })}

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
}
