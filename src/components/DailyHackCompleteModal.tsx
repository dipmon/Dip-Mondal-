import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ShieldAlert, Clock, Star, Flame, Trophy, ArrowRight, RotateCcw, CheckCircle, AlertOctagon } from 'lucide-react';
import { DailyHackMission } from '../types';
import { triggerLevelCompleteAds } from '../utils/adManager';
import { MobileBanner468x60 } from './AdBanners';

interface DailyHackCompleteModalProps {
  isOpen: boolean;
  mission: DailyHackMission;
  moves: number;
  timeTaken: number;
  beatTimeLimit: boolean;
  baseScore: number;
  bonusPoints: number;
  currentStreak: number;
  isLoggedIn: boolean;
  isAdFree?: boolean;
  onOpenSubscription?: () => void;
  onReturnToCampaign: () => void;
  onReplayMission: () => void;
  onOpenLeaderboard: () => void;
}

export const DailyHackCompleteModal: React.FC<DailyHackCompleteModalProps> = ({
  isOpen,
  mission,
  moves,
  timeTaken,
  beatTimeLimit,
  baseScore,
  bonusPoints,
  currentStreak,
  isLoggedIn,
  isAdFree = false,
  onOpenSubscription,
  onReturnToCampaign,
  onReplayMission,
  onOpenLeaderboard,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (!isAdFree) {
        triggerLevelCompleteAds();
      }

      // Trigger golden and crimson cyber confetti burst
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#f43f5e', '#00f3ff', '#00ff66', '#fcee0a', '#ffffff'],
        disableForReducedMotion: true,
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#f43f5e', '#fcee0a'],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ['#00f3ff', '#00ff66'],
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen, isAdFree]);

  if (!isOpen) return null;

  const totalEarned = baseScore + (beatTimeLimit ? bonusPoints : 0);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" id="daily-hack-complete-modal">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0b0c1e] border-2 border-rose-500/60 p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.3)] text-center overflow-hidden">
        
        {/* Background flares */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase mb-4 tracking-wider border ${
          beatTimeLimit 
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
        }`}>
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          {beatTimeLimit ? 'TIME BOUNTY EXTRACTED!' : 'HACK MISSION COMPLETED'}
        </div>

        {/* Title */}
        <h2 className="cyber-font text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-white to-amber-400 tracking-wide mb-1">
          {beatTimeLimit ? 'MISSION CRACKED!' : 'SYSTEM BREACHED'}
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-mono mb-5">
          {mission.title} &bull; {mission.targetName}
        </p>

        {/* Big Score Awarded Box */}
        <div className="mb-5 p-4 rounded-xl bg-[#14142f] border border-rose-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
            <span>TOTAL SCORE EARNED</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              {currentStreak}x STREAK
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-bold cyber-font text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-300">
            +{totalEarned.toLocaleString()} <span className="text-sm font-mono text-slate-300">PTS</span>
          </div>

          {beatTimeLimit && (
            <div className="mt-2 text-xs font-mono text-emerald-400 bg-emerald-500/15 py-1 px-2.5 rounded border border-emerald-500/30 inline-flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>+{bonusPoints.toLocaleString()} Time Bounty Applied!</span>
            </div>
          )}
        </div>

        {/* Time Stats Comparison Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 font-mono text-xs">
          <div className={`p-3 rounded-lg border text-left ${
            beatTimeLimit ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-[#14142f]/60 border-slate-800'
          }`}>
            <span className="text-slate-400 block mb-0.5">COMPLETION TIME</span>
            <span className={`text-base font-bold flex items-center gap-1 ${
              beatTimeLimit ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeTaken)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Limit: {formatTime(mission.timeLimitSeconds)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#14142f]/60 border border-slate-800 text-left">
            <span className="text-slate-400 block mb-0.5">CIRCUIT MOVES</span>
            <span className="text-white text-base font-bold">
              {moves} <span className="text-xs text-slate-500 font-normal">rotations</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              5x5 High-Diff Grid
            </span>
          </div>
        </div>

        {/* Sync Status Note */}
        <div className="text-[11px] font-mono text-slate-400 mb-4 flex items-center justify-center gap-1.5">
          {isLoggedIn ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
              <span className="text-[#00ff66]">Synced to Google Profile & Global Leaderboard</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Saved locally. Sign in with Google to record on Global Leaderboard!</span>
            </>
          )}
        </div>

        {/* Daily Hack Complete Sponsored Ad Banner for Free Users */}
        {!isAdFree && (
          <div className="mb-4">
            <MobileBanner468x60 isAdFree={isAdFree} onOpenSubscription={onOpenSubscription} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              if (!isAdFree) triggerLevelCompleteAds();
              onReturnToCampaign();
            }}
            id="return-campaign-btn"
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm tracking-wider uppercase cyber-font shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_28px_rgba(244,63,94,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>RETURN TO CAMPAIGN SECTORS</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (!isAdFree) triggerLevelCompleteAds();
                onReplayMission();
              }}
              id="replay-hack-btn"
              className="py-2.5 px-4 rounded-xl bg-[#14142f] border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETRY FOR TIME</span>
            </button>
            <button
              onClick={() => {
                if (!isAdFree) triggerLevelCompleteAds();
                onOpenLeaderboard();
              }}
              id="hack-leaderboard-btn"
              className="py-2.5 px-4 rounded-xl bg-[#14142f] border border-amber-500/40 hover:border-amber-400 text-amber-400 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>LEADERBOARD</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
