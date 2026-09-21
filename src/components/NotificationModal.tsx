import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Calendar, Sparkles, Check, AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
          sendTestNotification();
        }
      } catch (e) {
        console.warn('Notification permission request error:', e);
      }
    }
  };

  const sendTestNotification = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Wire Connect: Cyber Circuit', {
          body: '⚡ Cyber Alert: Daily Challenge is active! Connect circuits to earn a 2x Streak Multiplier.',
          icon: '/favicon.ico',
        });
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3000);
      } catch (e) {
        console.warn('Push notification delivery error:', e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in" id="notification-modal">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d0e23] border border-cyan-500/40 p-5 sm:p-6 shadow-[0_0_35px_rgba(0,243,255,0.2)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="cyber-font text-lg font-bold text-white tracking-wide">
                CYBER ALERTS & EVENTS
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                DAILY HACKS & TOURNAMENT NOTIFICATIONS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#14142f] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
            id="close-notifications-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Push Notification Toggle Box */}
        <div className="my-4 p-4 rounded-xl bg-[#14142f] border border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
              <span>Push Notifications</span>
              {permission === 'granted' && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ENABLED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Alerts for upcoming tournaments & daily streak protection
            </p>
          </div>

          {permission === 'granted' ? (
            <button
              onClick={sendTestNotification}
              disabled={testSent}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold hover:bg-emerald-500/30 transition-colors cursor-pointer shrink-0"
            >
              {testSent ? 'DISPATCHED!' : 'TEST PUSH'}
            </button>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-mono font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer shrink-0"
            >
              ACTIVATE
            </button>
          )}
        </div>

        {/* Upcoming Cyber Events Schedule */}
        <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Active & Upcoming Operations
          </div>

          {/* Event 1 */}
          <div className="p-3 rounded-xl bg-[#101124] border border-cyan-500/30 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Daily Cyber Surge</span>
                <span className="text-[9px] font-mono text-[#00ff66] bg-[#00ff66]/10 px-1.5 py-0.2 rounded border border-[#00ff66]/30">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Complete any sector with 3 stars to earn a +500 PTS circuit bonus and keep your multiplier alive.
              </p>
            </div>
          </div>

          {/* Event 2 */}
          <div className="p-3 rounded-xl bg-[#101124] border border-amber-500/30 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>NetRunner Global Circuit Finals</span>
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                  SUNDAY
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Global leaderboards snapshot locks this weekend. Top 10 players receive honorary cyber master badges.
              </p>
            </div>
          </div>

          {/* Event 3 */}
          <div className="p-3 rounded-xl bg-[#101124] border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Omega Security Overhaul
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                New 6x6 Quantum Grid sectors releasing in the next system deployment.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
