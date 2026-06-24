import { MODULE_TEMPLATES, CELL_SIZE } from '../constants/mapData';
import { rotatePosition, getLatticeHoverText } from '../utils/mapHelpers';
import { ORE_DEPOSITS } from '../utils/assets';

export default function LatticeLayer({ modules, visibleLayers, layerOpacity, onNodeHover, onNodeHoverMove, onNodeHoverEnd, onNodeClick }) {
  if (!visibleLayers.lattice) return null;

  return Object.entries(modules).map(([key, mod]) => {
    const tmpl = MODULE_TEMPLATES[mod.templateId];
    if (!tmpl) return null;
    const s = visibleLayers.padding ? CELL_SIZE - 12 : CELL_SIZE;
    return (tmpl.latticeNodes || []).map((node, i) => {
      const depositId = mod.oreDeposits?.[i] ?? 'IronMalachite';
      const deposit = ORE_DEPOSITS.find(d => d.id === depositId) ?? ORE_DEPOSITS[0];
      const rp = rotatePosition(node.position.x, node.position.y, mod.rotation);
      const nodePixelLeft = mod.x * CELL_SIZE - s / 2 + (rp.x / 100) * s;
      const nodePixelTop = mod.y * CELL_SIZE - s / 2 + (rp.y / 100) * s;
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
          onMouseEnter={(e) => onNodeHover(getLatticeHoverText(depositId, node.size), e.clientX, e.clientY)}
          onMouseMove={(e) => onNodeHoverMove(e.clientX, e.clientY)}
          onMouseLeave={onNodeHoverEnd}
          onClick={(e) => {
            e.stopPropagation();
            onNodeClick(key, i, e.clientX, e.clientY);
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
  });
}
