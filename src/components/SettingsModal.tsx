import React from 'react';
import { X, Sliders, Volume2, Sun, Moon, Trash2, Check, RefreshCw, Crown, Sparkles, ShieldAlert, LogOut, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { GameSettings, CyberTheme } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  isAdFree?: boolean;
  user?: User | null;
  onOpenSubscription?: () => void;
  onOpenAdminVip?: () => void;
  onSignOut?: () => void;
  onGoogleSignIn?: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  isAdFree = false,
  user,
  onOpenSubscription,
  onOpenAdminVip,
  onSignOut,
  onGoogleSignIn,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" id="settings-modal">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d0e23] border border-cyan-500/40 p-4 sm:p-6 shadow-[0_0_35px_rgba(0,243,255,0.2)] flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="cyber-font text-base sm:text-lg font-bold text-white tracking-wide">
                SYSTEM CONFIGURATION
              </h3>
              <p className="text-[10px] sm:text-[11px] font-mono text-slate-400">
                AUDIO, THEMES & NEON CALIBRATION
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-[#14142f] border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close Settings"
            id="close-settings-btn"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="my-3 sm:my-4 space-y-3.5 sm:space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
          {/* User Account & Logout Section */}
          <div className="p-3.5 rounded-xl bg-[#14142f] border border-cyan-500/30 shadow-[0_0_15px_rgba(0,243,255,0.06)]" id="settings-user-account-section">
            <div className="flex items-center justify-between gap-3">
              {user ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-9 h-9 rounded-full border border-cyan-400 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-sm flex items-center justify-center shrink-0">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white font-mono truncate">
                        {user.displayName || 'Cyber Agent'}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                        ONLINE
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      {user.email || 'Google Connected'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 font-mono">
                      GUEST OPERATIVE
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">
                      Sign in to sync rank & level progress to cloud
                    </p>
                  </div>
                </div>
              )}

              {user ? (
                <button
                  onClick={() => {
                    if (onSignOut) {
                      onSignOut();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/60 text-red-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.2)] active:scale-95"
                  title="Sign out from Google account"
                  id="settings-logout-btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>LOG OUT</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (onGoogleSignIn) {
                      onGoogleSignIn();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-[0_0_10px_rgba(0,243,255,0.2)]"
                  id="settings-login-btn"
                >
                  <span>SIGN IN</span>
                </button>
              )}
            </div>
          </div>

          {/* Cyber VIP / Ad-Free Pass Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-[#161738] to-amber-950/20 border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-400/60 text-amber-300">
                  <Crown className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                      CYBER VIP PASS
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                      isAdFree ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {isAdFree ? 'ACTIVE' : 'FREE TIER'}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {isAdFree ? 'All ads permanently blocked' : 'Disable banners, popunders & social ads'}
                  </p>
                </div>
              </div>

              {onOpenSubscription && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSubscription();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/70 text-amber-300 text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(251,191,36,0.2)] shrink-0"
                >
                  {isAdFree ? 'MANAGE' : 'GO VIP'}
                </button>
              )}
            </div>
          </div>

          {/* Cyberpunk Theme Mode */}
          <div className="p-3.5 rounded-xl bg-[#14142f] border border-slate-800">
            <label className="text-xs font-mono text-slate-300 uppercase block mb-2 font-bold">
              Visual Environment Theme
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <button
                onClick={() => onUpdateSettings({ theme: 'cyberpunk' })}
                className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                  settings.theme === 'cyberpunk'
                    ? 'bg-[#00f3ff]/20 border-[#00f3ff] text-[#00f3ff] font-bold shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                    : 'bg-[#101124] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Cyber Blue
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'matrix' })}
                className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                  settings.theme === 'matrix'
                    ? 'bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66] font-bold shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                    : 'bg-[#101124] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Matrix Green
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'synthwave' })}
                className={`py-2 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                  settings.theme === 'synthwave'
                    ? 'bg-[#ff0055]/20 border-[#ff0055] text-[#ff0055] font-bold shadow-[0_0_10px_rgba(255,0,85,0.3)]'
                    : 'bg-[#101124] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Synth Sunset
              </button>
            </div>
          </div>

          {/* Audio SFX Volume */}
          <div className="p-3.5 rounded-xl bg-[#14142f] border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <span className="font-bold uppercase">SFX Volume</span>
              <span className="text-cyan-400 font-bold">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Ambient Drone Music Volume */}
          <div className="p-3.5 rounded-xl bg-[#14142f] border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
              <span className="font-bold uppercase">Ambient Cyber Synth</span>
              <span className="text-cyan-400 font-bold">{Math.round(settings.ambientVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.ambientVolume}
              onChange={(e) => onUpdateSettings({ ambientVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Neon Glow Level */}
          <div className="p-3.5 rounded-xl bg-[#14142f] border border-slate-800">
            <label className="text-xs font-mono text-slate-300 uppercase block mb-2 font-bold">
              Neon Glow Emission
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              {(['normal', 'high', 'ultra'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => onUpdateSettings({ glowIntensity: level })}
                  className={`py-2 px-2 rounded-lg border text-center capitalize transition-all cursor-pointer ${
                    settings.glowIntensity === level
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 font-bold'
                      : 'bg-[#101124] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Owner VIP Approval Panel Button */}
          {onOpenAdminVip && (
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/40">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin VIP Approval Panel
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">
                    Approve / reject customer UPI payments (PIN: 99322).
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminVip();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
                >
                  OPEN PANEL
                </button>
              </div>
            </div>
          )}

          {/* Storage & Reset Progress */}
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-red-400 font-mono uppercase">
                  Wipe Local Matrix Memory
                </div>
                <p className="text-[11px] font-mono text-slate-400">
                  Reset unlocked levels and offline scores.
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all offline puzzle progress?')) {
                    onResetProgress();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold hover:bg-red-500/30 transition-colors cursor-pointer shrink-0"
              >
                RESET
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
