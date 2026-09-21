import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, RefreshCw, X, Shield, User as UserIcon } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { fetchTopLeaderboard } from '../firebase';

interface LeaderboardModalProps {
  isOpen: boolean;
  currentUserId?: string;
  currentScore: number;
  currentHighestLevel: number;
  currentStars: number;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  currentUserId,
  currentScore,
  currentHighestLevel,
  currentStars,
  onClose,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'global' | 'you'>('global');

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const topList = await fetchTopLeaderboard(25);
      
      // If Firestore leaderboard is empty (brand new database), include initial cyber runner benchmarks so it looks awesome immediately!
      if (topList.length === 0) {
        const fallbackList: LeaderboardEntry[] = [
          {
            userId: 'bot-1',
            displayName: 'ZeroCool_99',
            score: 18450,
            highestLevel: 10,
            stars: 28,
          },
          {
            userId: 'bot-2',
            displayName: 'NeonValkyrie',
            score: 14200,
            highestLevel: 8,
            stars: 22,
          },
          {
            userId: 'bot-3',
            displayName: 'HexGlitch',
            score: 10900,
            highestLevel: 6,
            stars: 17,
          },
          {
            userId: 'bot-4',
            displayName: 'CortexRunner',
            score: 7400,
            highestLevel: 4,
            stars: 12,
          },
        ];
        setEntries(fallbackList);
      } else {
        setEntries(topList);
      }
    } catch (err) {
      console.warn('Failed to load leaderboard, using cached data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" id="leaderboard-modal">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0d0e23] border border-cyan-500/40 p-5 sm:p-6 shadow-[0_0_35px_rgba(0,243,255,0.2)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="cyber-font text-lg font-bold text-white tracking-wide">
                GLOBAL LEADERBOARD
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                TOP CYBER CIRCUIT RUNNERS &bull; REAL-TIME SYNC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadLeaderboard}
              disabled={isLoading}
              className="p-2 rounded-lg bg-[#14142f] text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              title="Refresh Leaderboard"
              id="refresh-leaderboard-btn"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#14142f] text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close"
              id="close-leaderboard-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Switch */}
        <div className="flex rounded-lg bg-[#14142f] p-1 my-4 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setFilter('global')}
            className={`flex-1 py-1.5 rounded-md text-center transition-colors cursor-pointer ${
              filter === 'global' ? 'bg-[#00f3ff]/20 text-[#00f3ff] font-bold border border-[#00f3ff]/40' : 'text-slate-400'
            }`}
          >
            GLOBAL TOP RANKINGS
          </button>
          <button
            onClick={() => setFilter('you')}
            className={`flex-1 py-1.5 rounded-md text-center transition-colors cursor-pointer ${
              filter === 'you' ? 'bg-[#00f3ff]/20 text-[#00f3ff] font-bold border border-[#00f3ff]/40' : 'text-slate-400'
            }`}
          >
            YOUR CIRCUIT STATS
          </button>
        </div>

        {/* Content Body */}
        {filter === 'global' ? (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <span>Synchronizing neural rankings...</span>
              </div>
            ) : entries.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                No scores recorded yet. Be the first circuit breaker!
              </div>
            ) : (
              entries.map((item, index) => {
                const isCurrentUser = currentUserId && item.userId === currentUserId;
                const rank = index + 1;

                return (
                  <div
                    key={item.userId}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isCurrentUser
                        ? 'bg-[#00f3ff]/10 border-[#00f3ff]/60 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                        : rank <= 3
                        ? 'bg-[#151630] border-slate-700/80'
                        : 'bg-[#101124] border-slate-800/60'
                    }`}
                  >
                    {/* Rank & User Info */}
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div className="w-6 text-center font-mono font-bold text-sm">
                        {rank === 1 ? (
                          <span className="text-amber-400 flex items-center justify-center">
                            <Medal className="w-5 h-5 fill-amber-400" />
                          </span>
                        ) : rank === 2 ? (
                          <span className="text-slate-300 flex items-center justify-center">
                            <Medal className="w-5 h-5 fill-slate-300" />
                          </span>
                        ) : rank === 3 ? (
                          <span className="text-amber-600 flex items-center justify-center">
                            <Medal className="w-5 h-5 fill-amber-700" />
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">#{rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      {item.photoURL ? (
                        <img
                          src={item.photoURL}
                          alt={item.displayName}
                          className="w-8 h-8 rounded-full border border-cyan-400/40 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold font-mono">
                          {item.displayName[0]?.toUpperCase() || 'U'}
                        </div>
                      )}

                      {/* Name & Level */}
                      <div>
                        <div className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{item.displayName}</span>
                          {isCurrentUser && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                          <span>Sec #{item.highestLevel}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {item.stars}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="cyber-font text-sm sm:text-base font-bold text-[#00f3ff]">
                        {item.score.toLocaleString()}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">POINTS</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Current User Card */
          <div className="p-4 rounded-xl bg-[#14142f] border border-cyan-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Your Active Circuit Profile</h4>
                <p className="text-xs text-slate-400 font-mono">
                  {currentUserId ? 'Synced to Google Cloud Storage' : 'Local Storage Mode (Guest)'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-3 rounded-lg bg-[#0d0e23] border border-slate-800">
                <div className="text-slate-400 text-[10px] mb-1">TOTAL SCORE</div>
                <div className="cyber-font text-base text-[#00f3ff] font-bold">
                  {currentScore.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#0d0e23] border border-slate-800">
                <div className="text-slate-400 text-[10px] mb-1">MAX SECTOR</div>
                <div className="cyber-font text-base text-[#00ff66] font-bold">
                  #{currentHighestLevel}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#0d0e23] border border-slate-800">
                <div className="text-slate-400 text-[10px] mb-1">STARS</div>
                <div className="cyber-font text-base text-[#fcee0a] font-bold flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {currentStars}
                </div>
              </div>
            </div>

            {!currentUserId && (
              <div className="text-xs font-mono text-amber-400/90 bg-amber-500/10 p-3 rounded-lg border border-amber-500/30 text-center">
                Sign in with Google on the top bar to save your score to the official worldwide leaderboard!
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
