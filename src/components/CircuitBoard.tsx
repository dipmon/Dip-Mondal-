import React from 'react';
import { DIR, GridCell, CyberTheme } from '../types';
import { Lock, Unlock, ShieldAlert, Cpu } from 'lucide-react';

interface CircuitBoardProps {
  cells: GridCell[];
  gridSize: number;
  theme: CyberTheme;
  glowIntensity: 'normal' | 'high' | 'ultra';
  onRotateCell: (cell: GridCell) => void;
  hintCellId?: string | null;
}

export const CircuitBoard: React.FC<CircuitBoardProps> = ({
  cells,
  gridSize,
  theme,
  glowIntensity,
  onRotateCell,
  hintCellId,
}) => {
  // Theme color constants
  const getThemeColors = () => {
    switch (theme) {
      case 'matrix':
        return {
          powered: '#00ff66',
          poweredGlow: 'rgba(0, 255, 102, 0.7)',
          unpowered: '#1e3a2b',
          tileBg: '#09150d',
          accent: '#00ff66',
        };
      case 'synthwave':
        return {
          powered: '#ff0077',
          poweredGlow: 'rgba(255, 0, 119, 0.7)',
          unpowered: '#3b1836',
          tileBg: '#180a21',
          accent: '#fcee0a',
        };
      case 'cyberpunk':
      default:
        return {
          powered: '#00f3ff',
          poweredGlow: 'rgba(0, 243, 255, 0.7)',
          unpowered: '#1e293b',
          tileBg: '#0d0d21',
          accent: '#00ff66',
        };
    }
  };

  const colors = getThemeColors();

  // Helper to render SVG paths according to cell ports
  const renderWirePaths = (cell: GridCell) => {
    const { currentPorts, isPowered, kind } = cell;
    const wireColor = isPowered ? colors.powered : '#334155';
    const coreColor = isPowered ? '#ffffff' : '#475569';

    // Source rendering
    if (kind === 'source') {
      return (
        <g>
          {/* Reactor ring */}
          <circle cx="50" cy="50" r="28" fill="none" stroke={colors.powered} strokeWidth="2.5" opacity="0.6" />
          <circle cx="50" cy="50" r="20" fill={colors.powered} fillOpacity="0.2" stroke={colors.powered} strokeWidth="3" className="animate-pulse" />
          <circle cx="50" cy="50" r="10" fill="#ffffff" filter="drop-shadow(0 0 6px #00f3ff)" />
          
          {/* Directional output wire */}
          {Boolean(currentPorts & DIR.TOP) && (
            <line x1="50" y1="20" x2="50" y2="0" stroke={colors.powered} strokeWidth="8" strokeLinecap="round" className="animate-wire-flow" />
          )}
          {Boolean(currentPorts & DIR.RIGHT) && (
            <line x1="80" y1="50" x2="100" y2="50" stroke={colors.powered} strokeWidth="8" strokeLinecap="round" className="animate-wire-flow" />
          )}
          {Boolean(currentPorts & DIR.BOTTOM) && (
            <line x1="50" y1="80" x2="50" y2="100" stroke={colors.powered} strokeWidth="8" strokeLinecap="round" className="animate-wire-flow" />
          )}
          {Boolean(currentPorts & DIR.LEFT) && (
            <line x1="20" y1="50" x2="0" y2="50" stroke={colors.powered} strokeWidth="8" strokeLinecap="round" className="animate-wire-flow" />
          )}
        </g>
      );
    }

    // Target terminal rendering
    if (kind === 'target') {
      const targetGlow = isPowered ? colors.accent : '#f59e0b';
      return (
        <g>
          {/* Terminal housing box */}
          <rect x="22" y="22" width="56" height="56" rx="10" fill="#0b0b1a" stroke={targetGlow} strokeWidth="2.5" />
          <rect x="28" y="28" width="44" height="44" rx="6" fill={isPowered ? targetGlow : '#1e1b4b'} fillOpacity={isPowered ? '0.25' : '0.4'} />
          
          {/* Input connection */}
          {Boolean(currentPorts & DIR.TOP) && (
            <line x1="50" y1="0" x2="50" y2="22" stroke={isPowered ? colors.powered : '#334155'} strokeWidth="8" strokeLinecap="round" className={isPowered ? 'animate-wire-flow' : ''} />
          )}
          {Boolean(currentPorts & DIR.RIGHT) && (
            <line x1="78" y1="50" x2="100" y2="50" stroke={isPowered ? colors.powered : '#334155'} strokeWidth="8" strokeLinecap="round" className={isPowered ? 'animate-wire-flow' : ''} />
          )}
          {Boolean(currentPorts & DIR.BOTTOM) && (
            <line x1="50" y1="78" x2="50" y2="100" stroke={isPowered ? colors.powered : '#334155'} strokeWidth="8" strokeLinecap="round" className={isPowered ? 'animate-wire-flow' : ''} />
          )}
          {Boolean(currentPorts & DIR.LEFT) && (
            <line x1="0" y1="50" x2="22" y2="50" stroke={isPowered ? colors.powered : '#334155'} strokeWidth="8" strokeLinecap="round" className={isPowered ? 'animate-wire-flow' : ''} />
          )}

          {/* Status icon / Core center */}
          <circle cx="50" cy="50" r="12" fill={isPowered ? targetGlow : '#334155'} className={isPowered ? 'animate-ping' : ''} opacity={isPowered ? 0.3 : 0} />
          <circle cx="50" cy="50" r="9" fill={isPowered ? '#ffffff' : '#f59e0b'} filter={isPowered ? `drop-shadow(0 0 6px ${targetGlow})` : ''} />
        </g>
      );
    }

    if (kind === 'empty') {
      return (
        <g opacity="0.15">
          <circle cx="50" cy="50" r="3" fill="#64748b" />
          <rect x="15" y="15" width="70" height="70" fill="none" stroke="#64748b" strokeDasharray="4 4" strokeWidth="1" />
        </g>
      );
    }

    // Standard Wire Components (straight, corner, tee, cross)
    return (
      <g>
        {/* Outer Conduit background */}
        {Boolean(currentPorts & DIR.TOP) && (
          <line x1="50" y1="50" x2="50" y2="0" stroke="#0f172a" strokeWidth="14" strokeLinecap="square" />
        )}
        {Boolean(currentPorts & DIR.RIGHT) && (
          <line x1="50" y1="50" x2="100" y2="50" stroke="#0f172a" strokeWidth="14" strokeLinecap="square" />
        )}
        {Boolean(currentPorts & DIR.BOTTOM) && (
          <line x1="50" y1="50" x2="50" y2="100" stroke="#0f172a" strokeWidth="14" strokeLinecap="square" />
        )}
        {Boolean(currentPorts & DIR.LEFT) && (
          <line x1="50" y1="50" x2="0" y2="50" stroke="#0f172a" strokeWidth="14" strokeLinecap="square" />
        )}
        <circle cx="50" cy="50" r="7" fill="#0f172a" />

        {/* Primary Conductive Line */}
        {Boolean(currentPorts & DIR.TOP) && (
          <line x1="50" y1="50" x2="50" y2="0" stroke={wireColor} strokeWidth="7" strokeLinecap="square" />
        )}
        {Boolean(currentPorts & DIR.RIGHT) && (
          <line x1="50" y1="50" x2="100" y2="50" stroke={wireColor} strokeWidth="7" strokeLinecap="square" />
        )}
        {Boolean(currentPorts & DIR.BOTTOM) && (
          <line x1="50" y1="50" x2="50" y2="100" stroke={wireColor} strokeWidth="7" strokeLinecap="square" />
        )}
        {Boolean(currentPorts & DIR.LEFT) && (
          <line x1="50" y1="50" x2="0" y2="50" stroke={wireColor} strokeWidth="7" strokeLinecap="square" />
        )}

        {/* Inner high-energy glowing stream */}
        {isPowered && (
          <>
            {Boolean(currentPorts & DIR.TOP) && (
              <line x1="50" y1="50" x2="50" y2="0" stroke={coreColor} strokeWidth="2.5" className="animate-wire-flow" />
            )}
            {Boolean(currentPorts & DIR.RIGHT) && (
              <line x1="50" y1="50" x2="100" y2="50" stroke={coreColor} strokeWidth="2.5" className="animate-wire-flow" />
            )}
            {Boolean(currentPorts & DIR.BOTTOM) && (
              <line x1="50" y1="50" x2="50" y2="100" stroke={coreColor} strokeWidth="2.5" className="animate-wire-flow" />
            )}
            {Boolean(currentPorts & DIR.LEFT) && (
              <line x1="50" y1="50" x2="0" y2="50" stroke={coreColor} strokeWidth="2.5" className="animate-wire-flow" />
            )}
          </>
        )}

        {/* Central Solder / Microchip Junction */}
        <circle cx="50" cy="50" r="5" fill={isPowered ? coreColor : '#475569'} filter={isPowered ? `drop-shadow(0 0 5px ${colors.powered})` : ''} />
      </g>
    );
  };

  return (
    <div className="relative p-2 sm:p-5 rounded-2xl bg-[#090918]/80 border-2 border-slate-800/80 shadow-2xl backdrop-blur-xl max-w-full overflow-hidden" id="circuit-board-container">
      {/* Decorative cyber corner brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#00f3ff]/60" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#00f3ff]/60" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#00f3ff]/60" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#00f3ff]/60" />

      {/* Grid Matrix */}
      <div 
        className="grid gap-2 sm:gap-3 touch-manipulation select-none"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          width: '100%',
          maxWidth: gridSize <= 3 ? '380px' : gridSize === 4 ? '440px' : '520px',
          margin: '0 auto',
        }}
        id="puzzle-grid"
      >
        {cells.map((cell) => {
          const isHinted = hintCellId === cell.id;
          const isRotatable = !cell.isLocked && cell.kind !== 'empty';

          return (
            <button
              key={cell.id}
              id={`tile-${cell.row}-${cell.col}`}
              onClick={() => onRotateCell(cell)}
              disabled={!isRotatable}
              className={`
                aspect-square relative rounded-xl transition-all duration-200 flex items-center justify-center
                border overflow-hidden
                ${isRotatable ? 'cursor-pointer hover:border-[#00f3ff]/80 active:scale-95' : 'cursor-default'}
                ${cell.isPowered ? 'bg-[#0d1629] border-[#00f3ff]/50' : 'bg-[#0b0c1b] border-slate-800'}
                ${isHinted ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
                ${cell.isPowered && glowIntensity !== 'normal' ? 'box-glow-cyan' : ''}
              `}
              style={{
                backgroundColor: cell.isPowered ? '#0d152a' : colors.tileBg,
              }}
              title={
                cell.isLocked 
                  ? `${cell.label || 'Fixed Terminal'} (Locked)` 
                  : `Rotate Circuit Piece (${cell.kind.replace('_', ' ')})`
              }
            >
              {/* Subtle PCB copper circuit traces */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <path d="M10 20 L25 20 L35 30" stroke="#00f3ff" strokeWidth="0.8" fill="none" />
                  <path d="M90 80 L75 80 L65 70" stroke="#00ff66" strokeWidth="0.8" fill="none" />
                </svg>
              </div>

              {/* Wire SVG element */}
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full p-0.5"
                style={{
                  filter: cell.isPowered 
                    ? `drop-shadow(0 0 ${glowIntensity === 'ultra' ? '12px' : '6px'} ${colors.powered})` 
                    : undefined,
                }}
              >
                {renderWirePaths(cell)}
              </svg>

              {/* Status Badge overlay for Source & Target */}
              {cell.kind === 'source' && (
                <div className="absolute top-1 left-1 px-1 py-0.2 text-[8px] sm:text-[9px] font-mono font-bold rounded bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/40">
                  PWR
                </div>
              )}

              {cell.kind === 'target' && (
                <div className={`absolute top-1 right-1 px-1 py-0.2 text-[8px] sm:text-[9px] font-mono font-bold rounded border ${
                  cell.isPowered 
                    ? 'bg-[#00ff66]/20 text-[#00ff66] border-[#00ff66]/40' 
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}>
                  {cell.isPowered ? 'SYNC' : 'LOCKED'}
                </div>
              )}

              {/* Locked pin icon */}
              {cell.isLocked && cell.kind !== 'source' && cell.kind !== 'target' && (
                <div className="absolute bottom-1 right-1 opacity-40">
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
