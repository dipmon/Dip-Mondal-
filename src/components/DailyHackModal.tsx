import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  Zap, 
  Trophy, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Play, 
  RotateCcw,
  Target,
  Sparkles,
  Flame
} from 'lucide-react';
import { DailyHackMission, DailyHackRecord } from '../types';

interface DailyHackModalProps {
  isOpen: boolean;
  mission: DailyHackMission;
  record: DailyHackRecord | null;
  onStartMission: () => void;
  onClose: () => void;
}

export const DailyHackModal: React.FC<DailyHackModalProps> = ({
  isOpen,
  mission,
  record,
  onStartMission,
  onClose,
}) => {
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  // Calculate time until next midnight UTC (daily reset)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setUTCHours(24, 0, 0, 0); // Next UTC midnight
      const diffMs = nextReset.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeUntilReset('Resetting...');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilReset(
        `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const isCompleted = Boolean(record?.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" id="daily-hack-modal">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0b0c1e] border-2 border-rose-500/50 p-5 sm:p-7 shadow-[0_0_45px_rgba(244,63,94,0.25)] flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Holographic background glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-rose-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase tracking-wider">
                  DAILY HACK MISSION
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {mission.codename}
                </span>
              </div>
              <h3 className="cyber-font text-lg sm:text-xl font-bold text-white tracking-wide mt-1">
                {mission.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#14142f] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
            id="close-daily-hack-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mission Details & Intel */}
        <div className="my-4 space-y-3.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          
          {/* Target System Banner */}
          <div className="p-3.5 rounded-xl bg-[#14142f]/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                TARGET INFRASTRUCTURE
              </div>
              <div className="text-sm sm:text-base font-bold text-cyan-400 font-mono mt-0.5">
                {mission.targetName}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                NEXT MISSION RESET
              </div>
              <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                {timeUntilReset}
              </div>
            </div>
          </div>

          {/* Lore Briefing */}
          <div className="p-3 rounded-xl bg-[#0e1024] border border-cyan-500/20 text-xs font-mono text-slate-300 leading-relaxed">
            <span className="text-cyan-400 font-bold block mb-1">TACTICAL BRIEFING:</span>
            {mission.lore}
          </div>

          {/* Mission Bounty & Difficulty Specs */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            {/* Spec 1: Matrix Size */}
            <div className="p-3 rounded-xl bg-[#14142f] border border-slate-800">
              <span className="text-slate-400 text-[10px] block mb-1">MATRIX GRID</span>
              <span className="text-white text-sm font-bold block">
                {mission.gridSize}x{mission.gridSize} OMEGA
              </span>
              <span className="text-[9px] text-rose-400 mt-0.5 block">High Difficulty</span>
            </div>

            {/* Spec 2: Time Limit */}
            <div className="p-3 rounded-xl bg-[#14142f] border border-rose-500/30">
              <span className="text-slate-400 text-[10px] block mb-1">TIME LIMIT</span>
              <span className="text-rose-400 text-sm font-bold flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {mission.timeLimitSeconds}s
              </span>
              <span className="text-[9px] text-slate-400 mt-0.5 block">Countdown Timer</span>
            </div>

            {/* Spec 3: Time Bounty */}
            <div className="p-3 rounded-xl bg-[#14142f] border border-emerald-500/30">
              <span className="text-slate-400 text-[10px] block mb-1">TIME BOUNTY</span>
              <span className="text-[#00ff66] text-sm font-bold block cyber-font">
                +{mission.bonusPoints}
              </span>
              <span className="text-[9px] text-emerald-400 mt-0.5 block">Extra Bonus</span>
            </div>
          </div>

          {/* Mission Completion Status Card */}
          {isCompleted ? (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-left space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white font-mono">
                    TODAY'S MISSION BREACHED
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {record?.beatTimeLimit ? 'TIME BONUS SECURED' : 'COMPLETED'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-300">
                You completed this mission in <span className="text-cyan-400 font-bold">{record?.timeTaken}s</span>.
                {record?.beatTimeLimit ? (
                  <span className="text-emerald-400 ml-1">
                    Awarded +{record?.bonusAwarded} bonus points to your profile!
                  </span>
                ) : (
                  <span className="text-amber-400 ml-1">
                    Exceeded the {mission.timeLimitSeconds}s threshold. Base points collected.
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/40 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-xs font-mono text-slate-300">
                <span className="text-rose-400 font-bold">WARNING:</span> The 90-second countdown begins the instant you start. Complete all connections before time expires to claim the full +{mission.bonusPoints} PTS reward!
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
          <button
            onClick={() => {
              onStartMission();
              onClose();
            }}
            id="start-daily-hack-btn"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-bold text-sm tracking-wider uppercase cyber-font shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:shadow-[0_0_35px_rgba(244,63,94,0.7)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isCompleted ? 'REPLAY DAILY HACK MISSION' : 'COMMENCE HACK INFILTRATION'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
