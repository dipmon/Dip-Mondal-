import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Zap, Flame, Clock, RotateCcw, ArrowRight, Trophy, CloudCheck, Award } from 'lucide-react';
import { LevelConfig, TOTAL_CAMPAIGN_LEVELS } from '../types';
import { triggerLevelCompleteAds } from '../utils/adManager';
import { MobileBanner468x60 } from './AdBanners';

interface LevelCompleteModalProps {
  isOpen: boolean;
  level: LevelConfig;
  moves: number;
  seconds: number;
  stars: number;
  scoreGained: number;
  currentStreak: number;
  isLoggedIn: boolean;
  isAdFree?: boolean;
  onOpenSubscription?: () => void;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLeaderboard: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  isOpen,
  level,
  moves,
  seconds,
  stars,
  scoreGained,
  currentStreak,
  isLoggedIn,
  isAdFree = false,
  onOpenSubscription,
  onNextLevel,
  onReplay,
  onOpenLeaderboard,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger Adsterra popunder ad logic on level complete (only for free users)
      if (!isAdFree) {
        triggerLevelCompleteAds();
      }

      // Trigger cyberpunk themed confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f3ff', '#00ff66', '#fcee0a', '#ffffff'],
        disableForReducedMotion: true,
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00f3ff', '#00ff66'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00f3ff', '#ff0055'],
        });
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isAdFree]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" id="level-complete-modal">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e0e24] border-2 border-[#00f3ff]/60 p-6 sm:p-8 shadow-[0_0_40px_rgba(0,243,255,0.25)] text-center overflow-hidden">
        
        {/* Holographic background flare */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00f3ff]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#00ff66]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/40 text-[#00ff66] text-xs font-mono uppercase mb-4 tracking-wider">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          Circuit Synchronized
        </div>

        {/* Title */}
        <h2 className="cyber-font text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-[#ffffff] to-[#00ff66] tracking-wide mb-1">
          {level.id >= TOTAL_CAMPAIGN_LEVELS ? 'SINGULARITY CONQUERED!' : 'LEVEL COMPLETE!'}
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-mono mb-6">
          {level.id >= TOTAL_CAMPAIGN_LEVELS 
            ? 'FINAL SECTOR #1000 MASTERED • ALL CONDUITS SYNCHRONIZED' 
            : `${level.name} • SEC #${level.id}`}
        </p>

        {/* Stars Rating Display */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map((starIndex) => {
            const isEarned = starIndex <= stars;
            return (
              <div 
                key={starIndex}
                className={`transition-all duration-300 transform ${
                  isEarned 
                    ? 'scale-110 drop-shadow-[0_0_12px_rgba(252,238,10,0.8)]' 
                    : 'opacity-30 scale-95'
                }`}
              >
                <Star 
                  className={`w-10 h-10 sm:w-12 sm:h-12 ${
                    isEarned 
                      ? 'text-[#fcee0a] fill-[#fcee0a]' 
                      : 'text-slate-600'
                  }`} 
                />
              </div>
            );
          })}
        </div>

        {/* Score & Multiplier Highlight */}
        <div className="mb-6 p-4 rounded-xl bg-[#14142f] border border-cyan-500/20">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span>CIRCUIT SCORE</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              {currentStreak}x STREAK
            </span>
          </div>
          <div className="text-3xl font-bold cyber-font text-[#00f3ff] tracking-wider">
            +{scoreGained.toLocaleString()} <span className="text-sm font-mono text-slate-300">PTS</span>
          </div>
        </div>

        {/* Level Performance Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs">
          <div className="p-3 rounded-lg bg-[#14142f]/60 border border-slate-800 text-left">
            <span className="text-slate-400 block mb-0.5">MOVES TAKEN</span>
            <span className="text-white text-base font-bold">
              {moves} <span className="text-xs text-slate-500 font-normal">/ {level.parMoves} par</span>
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[#14142f]/60 border border-slate-800 text-left">
            <span className="text-slate-400 block mb-0.5">BREACH TIME</span>
            <span className="text-white text-base font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        {/* Sync Status Note */}
        <div className="text-[11px] font-mono text-slate-400 mb-4 flex items-center justify-center gap-1.5">
          {isLoggedIn ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
              <span className="text-[#00ff66]">Google Cloud synced & leaderboard updated</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Saved locally. Sign in with Google to enter Global Leaderboard.</span>
            </>
          )}
        </div>

        {/* Level Complete Sponsored Ad Banner for Free Users */}
        {!isAdFree && (
          <div className="mb-4">
            <MobileBanner468x60 isAdFree={isAdFree} onOpenSubscription={onOpenSubscription} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {level.id < TOTAL_CAMPAIGN_LEVELS ? (
            <button
              onClick={() => {
                if (!isAdFree) triggerLevelCompleteAds();
                onNextLevel();
              }}
              id="next-level-btn"
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#00f3ff] to-[#00ff66] text-[#0a0a16] font-bold text-sm tracking-wider uppercase cyber-font shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_28px_rgba(0,243,255,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>NEXT LEVEL (#{level.id + 1})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (!isAdFree) triggerLevelCompleteAds();
                onOpenLeaderboard();
              }}
              id="view-all-rankings-btn"
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#fcee0a] to-[#00f3ff] text-[#0a0a16] font-bold text-sm tracking-wider uppercase cyber-font shadow-[0_0_20px_rgba(252,238,10,0.4)] hover:shadow-[0_0_28px_rgba(252,238,10,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Trophy className="w-4 h-4 text-black" />
              <span>CLAIM HALL OF FAME RANK</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (!isAdFree) triggerLevelCompleteAds();
                onReplay();
              }}
              id="replay-level-btn"
              className="py-2.5 px-4 rounded-xl bg-[#14142f] border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REPLAY</span>
            </button>
            <button
              onClick={() => {
                if (!isAdFree) triggerLevelCompleteAds();
                onOpenLeaderboard();
              }}
              id="modal-leaderboard-btn"
              className="py-2.5 px-4 rounded-xl bg-[#14142f] border border-amber-500/40 hover:border-amber-400 text-amber-400 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>RANKINGS</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
