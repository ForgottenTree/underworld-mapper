import { ORE_DEPOSITS } from '../utils/assets';

export default function LatticeTooltips({ hoverTooltip, latticeTooltip, currentDepositId, onDepositChange }) {
  return (
    <>
      {hoverTooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-tactical-panel border border-tactical-border rounded shadow-lg px-2 py-1 text-[11px] text-tactical-text whitespace-nowrap"
          style={{ left: hoverTooltip.x + 12, top: hoverTooltip.y + 12 }}
        >
          {hoverTooltip.text}
        </div>
      )}

      {latticeTooltip && (
        <div
          className="fixed z-50 bg-tactical-panel border border-tactical-border rounded shadow-xl p-1.5 min-w-[148px]"
          style={{ left: latticeTooltip.x + 8, top: latticeTooltip.y + 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          {ORE_DEPOSITS.map(deposit => (
            <button
              key={deposit.id}
              onClick={() => onDepositChange(latticeTooltip.moduleKey, latticeTooltip.nodeIndex, deposit.id)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded text-[12px] transition ${
                currentDepositId === deposit.id
                  ? 'bg-tactical-btn text-tactical-text'
                  : 'text-tactical-muted hover:bg-tactical-btn/50 hover:text-tactical-text'
              }`}
            >
              <img src={deposit.icon} alt={deposit.label} className="w-3 h-3 flex-shrink-0" />
              {deposit.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
