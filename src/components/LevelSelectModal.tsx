import React, { useState, useMemo, useEffect } from 'react';
import { X, Lock, Star, Grid, Search, ChevronLeft, ChevronRight, Play, CheckCircle2, Zap } from 'lucide-react';
import { getAllLevelMetas, TOTAL_CAMPAIGN_LEVELS } from '../levels';
import { LevelMetaSummary } from '../types';

interface LevelSelectModalProps {
  isOpen: boolean;
  highestUnlockedLevel: number;
  currentLevel: number;
  starsMap: Record<number, number>;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

type CyberTier = 'Alpha' | 'Beta' | 'Gamma' | 'Omega';

const TIERS: { id: CyberTier; name: string; range: string; min: number; max: number; color: string; badgeBg: string }[] = [
  { id: 'Alpha', name: 'ALPHA PROTOCOL', range: '1 - 250', min: 1, max: 250, color: 'text-emerald-400', badgeBg: 'border-emerald-500/40 bg-emerald-500/10' },
  { id: 'Beta', name: 'BETA MAINFRAME', range: '251 - 500', min: 251, max: 500, color: 'text-cyan-400', badgeBg: 'border-cyan-500/40 bg-cyan-500/10' },
  { id: 'Gamma', name: 'GAMMA FIREWALL', range: '501 - 750', min: 501, max: 750, color: 'text-amber-400', badgeBg: 'border-amber-500/40 bg-amber-500/10' },
  { id: 'Omega', name: 'OMEGA CORE', range: '751 - 1000', min: 751, max: 1000, color: 'text-rose-400', badgeBg: 'border-rose-500/40 bg-rose-500/10' },
];

const PAGE_SIZE = 50;

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  highestUnlockedLevel,
  currentLevel,
  starsMap,
  onSelectLevel,
  onClose,
}) => {
  // Determine starting tier and page based on current active level
  const defaultTierIndex = Math.min(3, Math.floor((currentLevel - 1) / 250));
  const [selectedTier, setSelectedTier] = useState<CyberTier>(TIERS[defaultTierIndex].id);
  const [page, setPage] = useState<number>(0);
  const [jumpInput, setJumpInput] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'completed'>('all');

  const allMetas = useMemo(() => getAllLevelMetas(), []);

  // When modal opens, sync tier and page with current active level
  useEffect(() => {
    if (isOpen) {
      const tierIdx = Math.min(3, Math.floor((currentLevel - 1) / 250));
      const tier = TIERS[tierIdx];
      setSelectedTier(tier.id);
      const offsetInTier = currentLevel - tier.min;
      setPage(Math.floor(offsetInTier / PAGE_SIZE));
    }
  }, [isOpen, currentLevel]);

  const currentTierConfig = TIERS.find(t => t.id === selectedTier) || TIERS[0];

  // Filter levels in current tier
  const tierMetas = useMemo(() => {
    return allMetas.slice(currentTierConfig.min - 1, currentTierConfig.max);
  }, [allMetas, currentTierConfig]);

  const filteredMetas = useMemo(() => {
    if (filterMode === 'unlocked') {
      return tierMetas.filter(l => l.id <= highestUnlockedLevel);
    }
    if (filterMode === 'completed') {
      return tierMetas.filter(l => (starsMap[l.id] || 0) === 3);
    }
    return tierMetas;
  }, [tierMetas, filterMode, highestUnlockedLevel, starsMap]);

  const totalPages = Math.max(1, Math.ceil(filteredMetas.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  const displayedMetas = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    return filteredMetas.slice(start, start + PAGE_SIZE);
  }, [filteredMetas, currentPage]);

  const totalStarsCount = useMemo(() => {
    return Object.values(starsMap).reduce((a, b) => a + b, 0);
  }, [starsMap]);

  if (!isOpen) return null;

  const handleJump = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(jumpInput.trim(), 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= TOTAL_CAMPAIGN_LEVELS) {
      if (parsed <= highestUnlockedLevel) {
        onSelectLevel(parsed);
        onClose();
      } else {
        // Navigate tier and page to preview the locked level
        const tierIdx = Math.min(3, Math.floor((parsed - 1) / 250));
        setSelectedTier(TIERS[tierIdx].id);
        const offset = parsed - TIERS[tierIdx].min;
        setPage(Math.floor(offset / PAGE_SIZE));
        setJumpInput('');
      }
    }
  };

  const handleResumeCurrent = () => {
    onSelectLevel(currentLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" id="level-select-modal">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#0c0d20] border-2 border-[#00f3ff]/40 p-4 sm:p-6 shadow-[0_0_40px_rgba(0,243,255,0.2)] flex flex-col max-h-[92vh] text-white">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-[#00f3ff]">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="cyber-font text-lg sm:text-xl font-black text-white tracking-wide">
                  CYBER SECTOR MATRIX
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00f3ff] border border-cyan-500/40">
                  1,000 CONDUITS
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 flex items-center gap-3 mt-0.5">
                <span>UNLOCKED: <strong className="text-cyan-400">{highestUnlockedLevel} / {TOTAL_CAMPAIGN_LEVELS}</strong></span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  STARS: <strong className="text-amber-400">{totalStarsCount}</strong>
                  <Star className="w-3 h-3 text-[#fcee0a] fill-[#fcee0a] inline" />
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={handleResumeCurrent}
              id="resume-active-level-btn"
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Resume Current Active Level"
            >
              <Zap className="w-3.5 h-3.5 text-[#00f3ff]" />
              <span>ACTIVE #{currentLevel}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#14142f] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close"
              id="close-level-select-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tier Tabs (Alpha, Beta, Gamma, Omega) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          {TIERS.map((tier) => {
            const isSelected = tier.id === selectedTier;
            return (
              <button
                key={tier.id}
                id={`tier-tab-${tier.id.toLowerCase()}`}
                onClick={() => {
                  setSelectedTier(tier.id);
                  setPage(0);
                }}
                className={`
                  p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer text-center
                  ${isSelected
                    ? 'bg-[#15173c] border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.25)] text-white'
                    : 'bg-[#0f1026] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'}
                `}
              >
                <span className={`text-[10px] font-mono tracking-wider uppercase ${tier.color}`}>
                  {tier.name}
                </span>
                <span className="text-xs font-bold cyber-font mt-0.5">
                  SECTORS {tier.range}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter & Jump Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 py-3 border-b border-slate-800/80">
          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => { setFilterMode('all'); setPage(0); }}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-cyan-500/20 text-[#00f3ff] border-cyan-500/50'
                  : 'bg-[#12132b] text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              All ({tierMetas.length})
            </button>
            <button
              onClick={() => { setFilterMode('unlocked'); setPage(0); }}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                filterMode === 'unlocked'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-[#12132b] text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              Unlocked
            </button>
            <button
              onClick={() => { setFilterMode('completed'); setPage(0); }}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                filterMode === 'completed'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-[#12132b] text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              3-Star ⭐
            </button>
          </div>

          {/* Jump to level form */}
          <form onSubmit={handleJump} className="flex items-center gap-1.5">
            <div className="relative">
              <input
                type="number"
                min={1}
                max={TOTAL_CAMPAIGN_LEVELS}
                placeholder="Level # (1-1000)"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                id="jump-level-input"
                className="w-36 px-2.5 py-1 text-xs font-mono bg-[#12132b] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#00f3ff]"
              />
            </div>
            <button
              type="submit"
              id="jump-level-submit-btn"
              className="px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-cyan-500 text-[#090a16] font-bold text-xs rounded-lg hover:from-cyan-400 hover:to-cyan-300 transition-all cursor-pointer uppercase cyber-font"
            >
              JUMP
            </button>
          </form>
        </div>

        {/* Level Cards Grid */}
        <div className="flex-1 overflow-y-auto my-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pr-1 custom-scrollbar min-h-[300px]">
          {displayedMetas.map((lvl) => {
            const isUnlocked = lvl.id <= highestUnlockedLevel;
            const isCurrent = lvl.id === currentLevel;
            const stars = starsMap[lvl.id] || 0;

            return (
              <button
                key={lvl.id}
                id={`level-card-${lvl.id}`}
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectLevel(lvl.id);
                  onClose();
                }}
                className={`
                  p-2 sm:p-2.5 rounded-xl border flex flex-col justify-between transition-all text-left relative overflow-hidden group
                  ${isUnlocked ? 'cursor-pointer hover:border-[#00f3ff] hover:scale-102 hover:bg-[#16183a]' : 'cursor-not-allowed bg-[#0d0f22]/70 border-slate-800/80 hover:border-slate-700'}
                  ${isCurrent ? 'bg-[#00f3ff]/15 border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.3)] ring-2 ring-[#00f3ff]' : 'bg-[#101228] border-slate-800/80'}
                `}
              >
                {/* Level Number & Grid Size - High Legibility on Mobile */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`px-2 py-0.5 rounded-md font-mono font-black text-sm sm:text-base tracking-tight flex items-center gap-1 border ${
                      isCurrent 
                        ? 'bg-cyan-400 text-black border-cyan-300 shadow-[0_0_10px_rgba(0,243,255,0.4)]' 
                        : isUnlocked 
                          ? 'bg-cyan-950/70 text-[#00f3ff] border-cyan-500/50 shadow-[0_0_6px_rgba(0,243,255,0.15)]' 
                          : 'bg-slate-900/90 text-slate-200 border-slate-700/60'
                    }`}>
                      <span className="text-[10px] opacity-75 font-semibold">LVL</span>
                      <span>{lvl.id}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 font-bold uppercase hidden sm:inline">
                        NOW
                      </span>
                    )}
                  </div>
                  {isUnlocked ? (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      lvl.difficulty === 'Omega' ? 'text-rose-400 border-rose-500/50 bg-rose-500/10' :
                      lvl.difficulty === 'Gamma' ? 'text-amber-400 border-amber-500/50 bg-amber-500/10' :
                      lvl.difficulty === 'Beta' ? 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10' :
                      'text-emerald-400 border-emerald-500/50 bg-emerald-500/10'
                    }`}>
                      {lvl.gridSize}x{lvl.gridSize}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-mono">
                      <Lock className="w-3 h-3 text-amber-500" />
                    </div>
                  )}
                </div>

                {/* Level Title */}
                <div className={`text-[11px] font-semibold truncate mb-1.5 ${isUnlocked ? 'text-slate-200 group-hover:text-cyan-200' : 'text-slate-400'}`}>
                  {lvl.name}
                </div>

                {/* Stars Row */}
                <div className="flex items-center justify-between mt-auto pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-3 h-3 ${
                          starIdx <= stars
                            ? 'text-[#fcee0a] fill-[#fcee0a]'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {stars > 0 ? `${stars}★` : `${lvl.parMoves}p`}
                  </span>
                </div>

                {/* Active Indicator Pulse */}
                {isCurrent && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00f3ff] animate-ping" />
                )}
              </button>
            );
          })}

          {displayedMetas.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 font-mono text-sm">
              No sectors match the active filter in this tier.
            </div>
          )}
        </div>

        {/* Footer Pagination Controls */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(0)}
              disabled={currentPage === 0}
              className="px-2 py-1 rounded bg-[#14142f] border border-slate-800 hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="First Page"
            >
              &laquo; First
            </button>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1 rounded bg-[#14142f] border border-slate-800 hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-white">
              Page <strong className="text-cyan-400">{currentPage + 1}</strong> of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-1 rounded bg-[#14142f] border border-slate-800 hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-2 py-1 rounded bg-[#14142f] border border-slate-800 hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Last Page"
            >
              Last &raquo;
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Showing {displayedMetas.length > 0 ? currentPage * PAGE_SIZE + 1 : 0} - {Math.min(currentPage * PAGE_SIZE + displayedMetas.length, filteredMetas.length)} of {filteredMetas.length} in {selectedTier}
          </div>
        </div>

      </div>
    </div>
  );
};

