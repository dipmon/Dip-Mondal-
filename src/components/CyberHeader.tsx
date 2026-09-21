import React from 'react';
import { User } from 'firebase/auth';
import { 
  Zap, 
  Flame, 
  Volume2, 
  VolumeX, 
  Music, 
  Trophy, 
  Grid, 
  Settings, 
  Bell, 
  LogOut, 
  LogIn,
  Radio,
  ShieldAlert,
  Crown
} from 'lucide-react';
import { CyberTheme, GameSettings, UserProfile } from '../types';

interface CyberHeaderProps {
  user: User | null;
  profile: UserProfile | null;
  settings: GameSettings;
  currentStreak: number;
  currentLevel: number;
  totalScore: number;
  isDailyHackCompleted?: boolean;
  isAdFree?: boolean;
  onOpenSubscription?: () => void;
  onOpenAdminVip?: () => void;
  onOpenDailyHack: () => void;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onToggleMute: () => void;
  onToggleAmbient: () => void;
  onOpenLeaderboard: () => void;
  onOpenLevelSelect: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
}

export const CyberHeader: React.FC<CyberHeaderProps> = ({
  user,
  profile,
  settings,
  currentStreak,
  currentLevel,
  totalScore,
  isDailyHackCompleted = false,
  isAdFree = false,
  onOpenSubscription,
  onOpenAdminVip,
  onOpenDailyHack,
  onGoogleSignIn,
  onSignOut,
  onToggleMute,
  onToggleAmbient,
  onOpenLeaderboard,
  onOpenLevelSelect,
  onOpenSettings,
  onOpenNotifications,
}) => {
  const getThemeAccentClass = () => {
    switch (settings.theme) {
      case 'matrix':
        return 'text-[#00ff66] border-[#00ff66]/30';
      case 'synthwave':
        return 'text-[#ff0055] border-[#ff0055]/30';
      default:
        return 'text-[#00f3ff] border-[#00f3ff]/30';
    }
  };

  return (
    <header className="w-full bg-[#0d0d1e]/95 backdrop-blur-md border-b border-[#00f3ff]/20 px-2 sm:px-6 py-2 sm:py-2.5 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Game Logo & Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 cursor-pointer shrink-0" onClick={onOpenLevelSelect} id="brand-logo">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-[#00f3ff]/10 border border-[#00f3ff]/50 flex items-center justify-center glow-cyan shrink-0">
            <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-[#00f3ff] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="cyber-font text-xs sm:text-base md:text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-[#00ff66] to-[#00f3ff] whitespace-nowrap">
                <span className="sm:hidden">WIRE</span>
                <span className="hidden sm:inline">WIRE CONNECT</span>
              </h1>
              <span className="hidden lg:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/30">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden md:block">
              CYBER CIRCUIT BREAKER
            </p>
          </div>
        </div>

        {/* Center Live HUD stats */}
        <div className="flex items-center gap-1 sm:gap-2.5 font-mono text-xs shrink-0">
          {/* Level Pill - High Visibility on Mobile */}
          <button 
            onClick={onOpenLevelSelect}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-md bg-cyan-950/70 border border-cyan-400 text-white hover:border-cyan-300 transition-colors cursor-pointer shrink-0 shadow-[0_0_8px_rgba(0,243,255,0.25)]"
            title="Select Sector (1 - 1000)"
            id="header-level-btn"
          >
            <Grid className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-cyan-300 font-mono font-bold uppercase">LVL</span>
            <span className="text-white font-mono font-black text-xs sm:text-sm">#{currentLevel}</span>
          </button>

          {/* Daily Hack Mission Button */}
          <button
            onClick={onOpenDailyHack}
            className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-md border font-mono text-xs transition-all cursor-pointer shrink-0 ${
              isDailyHackCompleted
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:border-emerald-400'
                : 'bg-rose-950/40 border-rose-500/60 text-rose-400 hover:border-rose-400 hover:bg-rose-950/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
            }`}
            id="header-daily-hack-btn"
            title="Daily Hack Mission - High Stakes Cyber Infiltration"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
            <span className="font-bold hidden md:inline">DAILY HACK</span>
            <span className="font-bold hidden sm:inline md:hidden">HACK</span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-bold hidden sm:inline ${
              isDailyHackCompleted 
                ? 'bg-emerald-500/20 text-emerald-300' 
                : 'bg-rose-500/20 text-rose-300'
            }`}>
              {isDailyHackCompleted ? 'DONE' : '+3K'}
            </span>
          </button>

          {/* Win Streak Badge (compact on mobile) */}
          {currentStreak > 0 && (
            <div 
              className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 rounded-md bg-[#14142b] border border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)] shrink-0"
              title="Current Consecutive Win Streak"
              id="header-streak-badge"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
              <span className="font-bold text-xs">{currentStreak}x</span>
            </div>
          )}

          {/* Score Counter (Desktop only) */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#14142b] border border-[#00ff66]/30">
            <Radio className="w-3.5 h-3.5 text-[#00ff66]" />
            <span className="text-slate-400 text-xs">PTS:</span>
            <span className="text-[#00ff66] font-bold text-sm">{totalScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Right Action Icons & Google Auth Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-1.5 sm:p-2 rounded-md transition-colors border ${
              settings.isMuted 
                ? 'bg-red-950/40 border-red-500/40 text-red-400' 
                : 'bg-[#14142b] border-slate-700/50 text-slate-300 hover:text-[#00f3ff]'
            }`}
            title={settings.isMuted ? 'Unmute Audio' : 'Mute Audio'}
            id="audio-mute-toggle"
          >
            {settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Ambient Drone Synth Toggle (Desktop/Tablet) */}
          <button
            onClick={onToggleAmbient}
            className="hidden sm:flex p-1.5 sm:p-2 rounded-md transition-colors border bg-[#14142b] border-slate-700/50 text-slate-300 hover:text-[#00f3ff]"
            title="Toggle Cyber Ambient Drone"
            id="audio-ambient-toggle"
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="p-1.5 sm:p-2 rounded-md bg-[#14142b] border border-amber-500/30 text-amber-400 hover:border-amber-400 hover:bg-amber-950/20 transition-colors"
            title="Global Cyber Leaderboard"
            id="leaderboard-btn"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* Cyber VIP Subscription (No Ads) Button */}
          {onOpenSubscription && (
            <button
              onClick={onOpenSubscription}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isAdFree
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-amber-500/25 border-amber-400/80 text-amber-300 hover:scale-105 shadow-[0_0_10px_rgba(251,191,36,0.35)]'
              }`}
              title={isAdFree ? 'Cyber VIP Active - Ads Blocked' : 'Remove All Ads - Upgrade to Cyber VIP'}
              id="header-subscription-btn"
            >
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden xs:inline font-black tracking-wider">{isAdFree ? 'VIP' : 'NO ADS'}</span>
            </button>
          )}

          {/* Admin Approval Button for Owner */}
          {(user?.email === 'dip92599@gmail.com' || user?.email?.includes('dip92599')) && onOpenAdminVip && (
            <button
              onClick={onOpenAdminVip}
              className="flex items-center gap-1 px-2 py-1 sm:py-1.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold transition-all shadow-[0_0_8px_rgba(0,243,255,0.3)] cursor-pointer"
              title="Admin VIP Approval Panel"
              id="admin-vip-header-btn"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[10px] tracking-wider hidden sm:inline">ADMIN</span>
            </button>
          )}

          {/* Settings Button - Prominently displayed and visible on ALL devices */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-md bg-[#14142b] border border-cyan-500/40 text-cyan-400 hover:text-white hover:bg-cyan-950/30 transition-colors shadow-[0_0_8px_rgba(0,243,255,0.2)]"
            title="Game Settings, Themes & SFX"
            id="settings-btn"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Google Authentication Section */}
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2 ml-0.5 sm:ml-1 pl-1 sm:pl-1.5 border-l border-slate-800" id="user-profile-header">
              <div className="flex items-center gap-1.5" title={`Signed in as ${user.displayName || user.email || 'Agent'}`}>
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Google Profile'} 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#00f3ff]/60 object-cover shadow-[0_0_8px_rgba(0,243,255,0.2)] shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00f3ff]/20 border border-[#00f3ff] text-[#00f3ff] font-bold text-xs flex items-center justify-center shrink-0">
                    {(user.displayName || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-mono font-medium text-slate-300 max-w-[85px] truncate">
                  {user.displayName?.split(' ')[0] || 'Agent'}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center gap-1 px-2 py-1 sm:py-1.5 rounded-md bg-red-950/30 hover:bg-red-900/50 border border-red-500/40 text-red-400 hover:text-red-300 transition-colors font-mono text-xs font-bold shadow-[0_0_8px_rgba(239,68,68,0.15)] cursor-pointer shrink-0"
                title="Log Out of Google Account"
                id="sign-out-btn"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">LOGOUT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 border border-[#00f3ff]/50 text-[#00f3ff] text-xs font-semibold transition-all hover:shadow-[0_0_12px_rgba(0,243,255,0.4)] ml-0.5"
              id="google-signin-btn"
              title="Sign in with Google"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
