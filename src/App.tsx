import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  RotateCcw, 
  Lightbulb, 
  Play, 
  CheckCircle, 
  Flame, 
  Clock, 
  Activity, 
  Cpu, 
  HelpCircle,
  Wifi,
  WifiOff,
  CloudCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Timer,
  AlertTriangle,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { 
  CyberTheme, 
  GameSettings, 
  GridCell, 
  LevelConfig, 
  UserProfile,
  DailyHackMission,
  DailyHackRecord
} from './types';
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  fetchUserProfile, 
  saveUserProfile 
} from './firebase';
import { CyberAudioEngine } from './audio';
import { 
  evaluateCircuitFlow, 
  getBasePortsForKind, 
  rotatePorts, 
  calculateStars, 
  calculateScore 
} from './gameLogic';
import { CAMPAIGN_LEVELS, getOrGenerateLevel, getDailyHackMission, getTodayDateString, TOTAL_CAMPAIGN_LEVELS } from './levels';

// Components
import { CyberHeader } from './components/CyberHeader';
import { CircuitBoard } from './components/CircuitBoard';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { NotificationModal } from './components/NotificationModal';
import { DailyHackModal } from './components/DailyHackModal';
import { DailyHackCompleteModal } from './components/DailyHackCompleteModal';
import { ResponsiveAdBanner, NativeAdBanner } from './components/AdBanners';
import { SubscriptionModal } from './components/SubscriptionModal';
import { AdminVipModal } from './components/AdminVipModal';
import { triggerLevelCompleteAds, removeAdScripts } from './utils/adManager';

export default function App() {
  // Authentication & Profile State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Settings State
  const [settings, setSettings] = useState<GameSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wire_cyber_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {
      sfxVolume: 0.6,
      ambientVolume: 0.25,
      isMuted: false,
      theme: 'cyberpunk',
      glowIntensity: 'high',
      notificationsEnabled: false,
    };
  });

  // Player Progress State (Offline-first localStorage)
  const [highestLevel, setHighestLevel] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('wire_cyber_highest_level');
      return val ? parseInt(val, 10) : 1;
    }
    return 1;
  });

  const [totalScore, setTotalScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('wire_cyber_total_score');
      return val ? parseInt(val, 10) : 0;
    }
    return 0;
  });

  const [currentStreak, setCurrentStreak] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('wire_cyber_streak');
      return val ? parseInt(val, 10) : 0;
    }
    return 0;
  });

  const [starsMap, setStarsMap] = useState<Record<number, number>>(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('wire_cyber_stars');
      if (val) {
        try {
          return JSON.parse(val);
        } catch (e) {}
      }
    }
    return {};
  });

  // Current Level State
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [currentLevelConfig, setCurrentLevelConfig] = useState<LevelConfig>(() => getOrGenerateLevel(1));
  const [cells, setCells] = useState<GridCell[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isLevelWon, setIsLevelWon] = useState<boolean>(false);
  const [levelWinStats, setLevelWinStats] = useState<{
    stars: number;
    scoreGained: number;
  }>({ stars: 0, scoreGained: 0 });

  // Daily Hack Mission State
  const todayDateString = getTodayDateString();
  const [dailyMission, setDailyMission] = useState<DailyHackMission>(() => getDailyHackMission(todayDateString));
  const [isDailyHackMode, setIsDailyHackMode] = useState<boolean>(false);
  const [dailyCountdown, setDailyCountdown] = useState<number>(dailyMission.timeLimitSeconds);
  const [dailyHackRecord, setDailyHackRecord] = useState<DailyHackRecord | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`wire_cyber_daily_${todayDateString}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return null;
  });
  const [isDailyHackModalOpen, setIsDailyHackModalOpen] = useState<boolean>(false);
  const [isDailyHackCompleteModalOpen, setIsDailyHackCompleteModalOpen] = useState<boolean>(false);
  const [dailyHackWinStats, setDailyHackWinStats] = useState<{
    moves: number;
    timeTaken: number;
    beatTimeLimit: boolean;
    baseScore: number;
    bonusPoints: number;
  }>({ moves: 0, timeTaken: 0, beatTimeLimit: false, baseScore: 0, bonusPoints: 0 });

  // Hint State
  const [hintCellId, setHintCellId] = useState<string | null>(null);
  const [hintsAvailable, setHintsAvailable] = useState<number>(3);

  // Modals Visibility
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isAdminVipModalOpen, setIsAdminVipModalOpen] = useState(false);

  // VIP Subscription / Ad-Free State (Only activated after real payment verification)
  const [isAdFree, setIsAdFree] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isPaid = localStorage.getItem('cyber_ad_free_vip') === 'true';
      const hasUtr = !!localStorage.getItem('cyber_vip_utr');
      return isPaid && hasUtr;
    }
    return false;
  });

  // Ensure unverified local VIP flags are purged so ads work properly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isPaid = localStorage.getItem('cyber_ad_free_vip') === 'true';
      const hasUtr = !!localStorage.getItem('cyber_vip_utr');
      if (isPaid && !hasUtr) {
        localStorage.setItem('cyber_ad_free_vip', 'false');
        setIsAdFree(false);
      }
    }
  }, []);

  const handleOpenSubscription = useCallback(() => {
    setIsSubscriptionModalOpen(true);
  }, []);

  const handleToggleAdFree = (enable: boolean) => {
    setIsAdFree(enable);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cyber_ad_free_vip', enable ? 'true' : 'false');
      if (enable) {
        removeAdScripts();
        CyberAudioEngine.playLevelWin();
      } else {
        localStorage.removeItem('cyber_vip_utr');
        CyberAudioEngine.playRotate();
      }
    }
  };

  // User Authentication Handlers
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      CyberAudioEngine.playClick();
    } catch (e) {
      console.error('Google Sign In failed:', e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn('Sign Out error (falling back to local reset):', e);
    } finally {
      setUser(null);
      setProfile(null);
      CyberAudioEngine.playClick();
    }
  };

  // Sync Audio Settings to Audio Engine
  useEffect(() => {
    CyberAudioEngine.setVolumes(settings.sfxVolume, settings.ambientVolume, settings.isMuted);
    localStorage.setItem('wire_cyber_settings', JSON.stringify(settings));
  }, [settings]);

  // Network Online/Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Firebase Auth State Listener & Cloud Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const cloudProfile = await fetchUserProfile(currentUser.uid);
          if (cloudProfile) {
            // Merge cloud and local progress (keep whichever is higher)
            const resolvedHighest = Math.max(highestLevel, cloudProfile.highestLevel);
            const resolvedScore = Math.max(totalScore, cloudProfile.totalScore);
            const resolvedStreak = Math.max(currentStreak, cloudProfile.currentStreak);

            setHighestLevel(resolvedHighest);
            setTotalScore(resolvedScore);
            setCurrentStreak(resolvedStreak);

            localStorage.setItem('wire_cyber_highest_level', resolvedHighest.toString());
            localStorage.setItem('wire_cyber_total_score', resolvedScore.toString());
            localStorage.setItem('wire_cyber_streak', resolvedStreak.toString());

            const updatedProfile: UserProfile = {
              ...cloudProfile,
              displayName: currentUser.displayName || cloudProfile.displayName || 'Cyber Agent',
              photoURL: currentUser.photoURL || cloudProfile.photoURL,
              highestLevel: resolvedHighest,
              totalScore: resolvedScore,
              currentStreak: resolvedStreak,
            };
            setProfile(updatedProfile);
            await saveUserProfile(updatedProfile);
          } else {
            // New user in Firestore: create initial profile from local state
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              displayName: currentUser.displayName || 'Cyber Agent',
              photoURL: currentUser.photoURL || undefined,
              highestLevel,
              totalScore,
              starsEarned: Object.values(starsMap).reduce((a, b) => a + b, 0),
              currentStreak,
              puzzlesSolved: Object.keys(starsMap).length,
            };
            setProfile(newProfile);
            await saveUserProfile(newProfile);
          }
        } catch (e) {
          console.warn('Profile sync notice:', e);
        }
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, [highestLevel, totalScore, currentStreak, starsMap]);

  // Initialize or Load Level
  const initLevel = useCallback((lvlId: number) => {
    const config = getOrGenerateLevel(lvlId);
    setCurrentLevelConfig(config);
    setCurrentLevelId(lvlId);
    setMoves(0);
    setElapsedSeconds(0);
    setIsLevelWon(false);
    setIsTimerActive(false);
    setHintCellId(null);

    // Build grid cells
    const initialCells: GridCell[] = config.cells.map((c) => {
      const basePorts = getBasePortsForKind(c.kind);
      const rotation = c.isLocked ? (c.solutionRotation ?? c.scrambleRotation) : c.scrambleRotation;
      const currentPorts = rotatePorts(basePorts, rotation / 90);

      return {
        id: `${c.row}-${c.col}`,
        row: c.row,
        col: c.col,
        kind: c.kind,
        rotation,
        basePorts,
        currentPorts,
        isPowered: c.kind === 'source',
        isSource: c.kind === 'source',
        isTarget: c.kind === 'target',
        isLocked: c.isLocked || false,
        label: c.label,
      };
    });

    // Run initial power flow evaluation
    const { updatedCells, allTargetsPowered } = evaluateCircuitFlow(initialCells, config.gridSize);
    setCells(updatedCells);

    // If starting state happens to already be solved (rare), re-scramble
    if (allTargetsPowered) {
      const rescrambled = updatedCells.map(cell => {
        if (!cell.isLocked && cell.kind !== 'empty') {
          const newRot = (cell.rotation + 90) % 360;
          return {
            ...cell,
            rotation: newRot,
            currentPorts: rotatePorts(cell.basePorts, newRot / 90),
          };
        }
        return cell;
      });
      const recheck = evaluateCircuitFlow(rescrambled, config.gridSize);
      setCells(recheck.updatedCells);
    }
  }, []);

  // Boot up Level 1
  useEffect(() => {
    initLevel(currentLevelId);
  }, [initLevel, currentLevelId]);

  // Level Timer loop (supports Campaign and Daily Hack Countdown)
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && !isLevelWon) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        if (isDailyHackMode) {
          setDailyCountdown((prev) => Math.max(0, prev - 1));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, isLevelWon, isDailyHackMode]);

  // Start Daily Hack Mission
  const startDailyHackMission = useCallback(() => {
    const config = dailyMission.config;
    setIsDailyHackMode(true);
    setCurrentLevelConfig(config);
    setMoves(0);
    setElapsedSeconds(0);
    setDailyCountdown(dailyMission.timeLimitSeconds);
    setIsLevelWon(false);
    setIsTimerActive(true);
    setHintCellId(null);

    const initialCells: GridCell[] = config.cells.map((c) => {
      const basePorts = getBasePortsForKind(c.kind);
      const rotation = c.isLocked ? (c.solutionRotation ?? c.scrambleRotation) : c.scrambleRotation;
      const currentPorts = rotatePorts(basePorts, rotation / 90);
      return {
        id: `${c.row}-${c.col}`,
        row: c.row,
        col: c.col,
        kind: c.kind,
        rotation,
        basePorts,
        currentPorts,
        isPowered: c.kind === 'source',
        isSource: c.kind === 'source',
        isTarget: c.kind === 'target',
        isLocked: c.isLocked || false,
        label: c.label,
      };
    });

    const { updatedCells } = evaluateCircuitFlow(initialCells, config.gridSize);
    setCells(updatedCells);
    CyberAudioEngine.playPowerConnect();
  }, [dailyMission]);

  // Exit Daily Hack Mission back to campaign
  const exitDailyHackMission = useCallback(() => {
    setIsDailyHackMode(false);
    initLevel(currentLevelId);
  }, [currentLevelId, initLevel]);

  // Rotate a Tile on User Click / Tap
  const handleRotateCell = (cell: GridCell) => {
    if (isLevelWon || cell.isLocked || cell.kind === 'empty') return;

    // Start timer on first move
    if (!isTimerActive) {
      setIsTimerActive(true);
    }

    // Play rotate servo sound
    CyberAudioEngine.playRotate();

    const newRotation = (cell.rotation + 90) % 360;
    const newPorts = rotatePorts(cell.basePorts, newRotation / 90);

    const updated = cells.map((c) => {
      if (c.id === cell.id) {
        return {
          ...c,
          rotation: newRotation,
          currentPorts: newPorts,
        };
      }
      return c;
    });

    const previousPoweredCount = cells.filter((c) => c.isPowered).length;
    const { updatedCells, allTargetsPowered, poweredCount } = evaluateCircuitFlow(
      updated,
      currentLevelConfig.gridSize
    );

    if (poweredCount > previousPoweredCount) {
      CyberAudioEngine.playPowerConnect();
    }

    setCells(updatedCells);
    setMoves((prev) => prev + 1);

    // Check Win Condition
    if (allTargetsPowered) {
      handleLevelWin(moves + 1);
    }
  };

  // Level Complete Handler
  const handleLevelWin = (finalMoves: number) => {
    setIsLevelWon(true);
    setIsTimerActive(false);

    // Play Victory Cyber Fanfare
    CyberAudioEngine.playLevelWin();

    // Trigger Popunder Ads for free players upon completing level
    if (!isAdFree) {
      triggerLevelCompleteAds();
    }

    // 1. Daily Hack Mission Special Victory Flow
    if (isDailyHackMode) {
      const beatTimeLimit = elapsedSeconds <= dailyMission.timeLimitSeconds;
      const baseScore = calculateScore(
        dailyMission.config,
        finalMoves,
        elapsedSeconds,
        currentStreak
      );
      const bonusPoints = beatTimeLimit ? dailyMission.bonusPoints : 0;
      const totalEarned = baseScore + bonusPoints;

      const newRecord: DailyHackRecord = {
        dateString: dailyMission.dateString,
        completed: true,
        timeTaken: elapsedSeconds,
        beatTimeLimit,
        bonusAwarded: bonusPoints,
        completedAt: new Date().toISOString(),
      };

      setDailyHackRecord(newRecord);
      localStorage.setItem(`wire_cyber_daily_${dailyMission.dateString}`, JSON.stringify(newRecord));

      const newStreak = currentStreak + 1;
      const newTotalScore = totalScore + totalEarned;
      setCurrentStreak(newStreak);
      setTotalScore(newTotalScore);
      localStorage.setItem('wire_cyber_streak', newStreak.toString());
      localStorage.setItem('wire_cyber_total_score', newTotalScore.toString());

      if (user) {
        const updatedProfile: UserProfile = {
          userId: user.uid,
          displayName: user.displayName || 'Cyber Agent',
          photoURL: user.photoURL || undefined,
          highestLevel,
          totalScore: newTotalScore,
          starsEarned: Object.values(starsMap).reduce((a, b) => a + b, 0),
          currentStreak: newStreak,
          puzzlesSolved: Object.keys(starsMap).length + 1,
        };
        setProfile(updatedProfile);
        saveUserProfile(updatedProfile).catch((err) => {
          console.warn('Cloud sync error after daily hack win:', err);
        });
      }

      setDailyHackWinStats({
        moves: finalMoves,
        timeTaken: elapsedSeconds,
        beatTimeLimit,
        baseScore,
        bonusPoints,
      });

      if (beatTimeLimit) {
        CyberAudioEngine.playStreak();
      }

      setIsDailyHackCompleteModalOpen(true);
      return;
    }

    // 2. Standard Campaign Level Victory Flow
    const stars = calculateStars(finalMoves, currentLevelConfig.parMoves);
    const scoreGained = calculateScore(
      currentLevelConfig,
      finalMoves,
      elapsedSeconds,
      currentStreak
    );

    setLevelWinStats({ stars, scoreGained });

    // Update streak and total score
    const newStreak = currentStreak + 1;
    const newTotalScore = totalScore + scoreGained;
    const newHighest = Math.min(TOTAL_CAMPAIGN_LEVELS, Math.max(highestLevel, currentLevelId + 1));
    const newStarsMap = {
      ...starsMap,
      [currentLevelId]: Math.max(starsMap[currentLevelId] || 0, stars),
    };

    setCurrentStreak(newStreak);
    setTotalScore(newTotalScore);
    setHighestLevel(newHighest);
    setStarsMap(newStarsMap);

    // Local Storage caching (offline mode)
    localStorage.setItem('wire_cyber_streak', newStreak.toString());
    localStorage.setItem('wire_cyber_total_score', newTotalScore.toString());
    localStorage.setItem('wire_cyber_highest_level', newHighest.toString());
    localStorage.setItem('wire_cyber_stars', JSON.stringify(newStarsMap));

    // Cloud Sync to Firebase Firestore if logged in
    if (user) {
      const updatedProfile: UserProfile = {
        userId: user.uid,
        displayName: user.displayName || 'Cyber Agent',
        photoURL: user.photoURL || undefined,
        highestLevel: newHighest,
        totalScore: newTotalScore,
        starsEarned: Object.values(newStarsMap).reduce((a, b) => a + b, 0),
        currentStreak: newStreak,
        puzzlesSolved: Object.keys(newStarsMap).length,
      };
      setProfile(updatedProfile);
      saveUserProfile(updatedProfile).catch((err) => {
        console.warn('Cloud sync error after level win:', err);
      });
    }
  };

  // Advance to Next Level
  const handleNextLevel = () => {
    if (currentLevelId < TOTAL_CAMPAIGN_LEVELS) {
      if (!isAdFree) {
        triggerLevelCompleteAds();
      }
      initLevel(currentLevelId + 1);
    }
  };

  // Replay Current Level
  const handleReplay = () => {
    initLevel(currentLevelId);
  };

  // Use a Circuit Hint
  const handleUseHint = () => {
    if (hintsAvailable <= 0 || isLevelWon) return;

    // Find a misaligned cell
    const targetCell = currentLevelConfig.cells.find((configCell) => {
      const liveCell = cells.find((c) => c.row === configCell.row && c.col === configCell.col);
      if (!liveCell || liveCell.isLocked || liveCell.kind === 'empty') return false;
      // Compare current rotated ports with solution rotated ports
      const solPorts = rotatePorts(liveCell.basePorts, configCell.solutionRotation / 90);
      return liveCell.currentPorts !== solPorts;
    });

    if (targetCell) {
      setHintCellId(`${targetCell.row}-${targetCell.col}`);
      setHintsAvailable((prev) => prev - 1);
      CyberAudioEngine.playPowerConnect();

      // Clear visual hint ping after 3 seconds
      setTimeout(() => {
        setHintCellId(null);
      }, 3000);
    }
  };

  // Reset Progress
  const handleResetProgress = () => {
    setHighestLevel(1);
    setTotalScore(0);
    setCurrentStreak(0);
    setStarsMap({});
    localStorage.removeItem('wire_cyber_highest_level');
    localStorage.removeItem('wire_cyber_total_score');
    localStorage.removeItem('wire_cyber_streak');
    localStorage.removeItem('wire_cyber_stars');
    initLevel(1);
  };

  // Background Theme Class
  const getThemeBackgroundClass = () => {
    switch (settings.theme) {
      case 'matrix':
        return 'bg-[#050e08] text-[#c9ffdd] cyber-grid-matrix';
      case 'synthwave':
        return 'bg-[#10071c] text-[#fbeaff] cyber-grid-synth';
      case 'cyberpunk':
      default:
        return 'bg-[#0a0a16] text-[#e2e8f0] cyber-grid-bg';
    }
  };

  // Format Elapsed Time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const totalStarsCount = Object.values(starsMap).reduce((a, b) => a + b, 0);

  return (
    <div className={`min-h-screen w-full flex flex-col relative scanlines select-none ${getThemeBackgroundClass()}`}>
      
      {/* Top Header with Google Auth, Streak, Level Indicator */}
      <CyberHeader
        user={user}
        profile={profile}
        settings={settings}
        currentStreak={currentStreak}
        currentLevel={currentLevelId}
        totalScore={totalScore}
        isDailyHackCompleted={Boolean(dailyHackRecord?.completed)}
        onOpenDailyHack={() => setIsDailyHackModalOpen(true)}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onToggleMute={() => setSettings((s) => ({ ...s, isMuted: !s.isMuted }))}
        onToggleAmbient={() => {
          CyberAudioEngine.toggleAmbient(true);
        }}
        isAdFree={isAdFree}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onOpenAdminVip={() => setIsAdminVipModalOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Game Stage */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col items-center justify-between gap-4">
        
        {/* Sector HUD & Mission Briefing Bar (Switches to High-Alert HUD in Daily Hack Mode) */}
        {isDailyHackMode ? (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#1b0816] via-[#12081d] to-[#090b1e] border-2 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.3)] backdrop-blur-md" id="daily-hack-hud">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-400 shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase tracking-wider">
                    DAILY HACK INFILTRATION
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono text-cyan-400">
                    5x5 OMEGA MATRIX
                  </span>
                </div>
                <h2 className="cyber-font text-base sm:text-lg font-bold text-white tracking-wide mt-0.5 truncate">
                  {dailyMission.title} &bull; <span className="text-rose-400">{dailyMission.targetName}</span>
                </h2>
              </div>
            </div>

            {/* Daily Hack Live Countdown & Bounty HUD */}
            <div className="flex items-center gap-3 sm:gap-5 font-mono text-xs sm:text-sm w-full sm:w-auto justify-between sm:justify-end">
              {/* Circuit moves */}
              <div className="flex flex-col items-end">
                <span className="text-slate-400 text-[10px]">MOVES</span>
                <span className="font-bold text-white text-sm sm:text-base">
                  <span className="text-cyan-400">{moves}</span>
                  <span className="text-slate-500 text-xs"> / {currentLevelConfig.parMoves}</span>
                </span>
              </div>

              <div className="h-8 w-px bg-rose-900/50" />

              {/* Glowing High-Stakes Countdown */}
              <div className="flex flex-col items-end">
                <span className="text-slate-400 text-[10px] uppercase">
                  {dailyCountdown > 0 ? 'COUNTDOWN' : 'TIME EXPIRED'}
                </span>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-bold text-sm sm:text-base transition-all ${
                  dailyCountdown > 20
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-400'
                    : dailyCountdown > 0
                    ? 'bg-red-950/70 border-red-500 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}>
                  <Timer className={`w-4 h-4 ${dailyCountdown <= 20 && dailyCountdown > 0 ? 'animate-spin' : ''}`} />
                  <span>{formatTime(dailyCountdown)}</span>
                </div>
              </div>

              <div className="h-8 w-px bg-rose-900/50" />

              {/* Bonus Active Flag */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-slate-400 text-[10px]">TIME BOUNTY</span>
                <span className={`text-xs font-bold ${
                  dailyCountdown > 0 ? 'text-[#00ff66]' : 'text-slate-500 line-through'
                }`}>
                  +{dailyMission.bonusPoints} PTS
                </span>
              </div>

              {/* Abort Hack Button */}
              <button
                onClick={exitDailyHackMission}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1a1429] hover:bg-[#251b3d] border border-slate-700 text-slate-400 hover:text-white text-xs font-mono transition-all cursor-pointer"
                title="Exit Daily Hack and return to Campaign"
                id="abort-hack-btn"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ABORT</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-[#0d0e23]/80 border border-slate-800/80 backdrop-blur-md shadow-lg" id="mission-hud">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Prominent High-Contrast Level Badge for Mobile & Desktop */}
              <div 
                onClick={() => setIsLevelSelectOpen(true)}
                className="flex flex-col items-center justify-center px-3.5 py-1.5 rounded-xl bg-cyan-950/80 border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.35)] cursor-pointer hover:scale-105 transition-transform shrink-0"
                title="Click to Choose Sector / Level"
                id="mission-hud-level-badge"
              >
                <span className="text-[10px] font-mono font-extrabold text-cyan-300 uppercase tracking-widest leading-none mb-0.5">
                  LEVEL
                </span>
                <span className="font-mono text-xl sm:text-2xl font-black text-white leading-none">
                  #{currentLevelConfig.id}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {currentLevelConfig.gridSize}x{currentLevelConfig.gridSize} MATRIX
                  </span>
                  <span className={`text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    currentLevelConfig.difficulty === 'Omega' ? 'text-rose-400 border-rose-500/40 bg-rose-500/10' :
                    currentLevelConfig.difficulty === 'Gamma' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
                    currentLevelConfig.difficulty === 'Beta' ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' :
                    'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                  }`}>
                    {currentLevelConfig.difficulty}
                  </span>
                </div>
                <h2 className="cyber-font text-sm sm:text-base md:text-lg font-bold text-white tracking-wide mt-1 truncate">
                  {currentLevelConfig.name}
                </h2>
              </div>
            </div>

            {/* Real-time stats: Moves vs Par, Timer */}
            <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs sm:text-sm">
              <div className="flex flex-col items-end">
                <span className="text-slate-400 text-[10px] sm:text-xs">CIRCUIT MOVES</span>
                <span className="font-bold text-white">
                  <span className="text-[#00f3ff] text-base">{moves}</span>
                  <span className="text-slate-500 text-xs"> / {currentLevelConfig.parMoves} par</span>
                </span>
              </div>

              <div className="h-8 w-px bg-slate-800" />

              <div className="flex flex-col items-end">
                <span className="text-slate-400 text-[10px] sm:text-xs">ELAPSED TIME</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {formatTime(elapsedSeconds)}
                </span>
              </div>

              <div className="h-8 w-px bg-slate-800" />

              {/* Offline / Cloud Status Indicator */}
              <div className="flex items-center gap-1.5" title={isOnline ? 'Network Connected' : 'Offline Mode'}>
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-[#00ff66]" />
                ) : (
                  <WifiOff className="w-4 h-4 text-amber-400" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Central Circuit Grid */}
        <div className="w-full flex flex-col items-center justify-center my-auto py-2">
          <CircuitBoard
            cells={cells}
            gridSize={currentLevelConfig.gridSize}
            theme={settings.theme}
            glowIntensity={settings.glowIntensity}
            onRotateCell={handleRotateCell}
            hintCellId={hintCellId}
          />
        </div>

        {/* Tactical Controls & Quick Sector Navigation */}
        <div className="w-full max-w-xl flex items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-[#0d0e23]/80 border border-slate-800/80 backdrop-blur-md">
          {/* Quick Prev Level (Campaign only) */}
          {!isDailyHackMode && (
            <button
              onClick={() => initLevel(Math.max(1, currentLevelId - 1))}
              disabled={currentLevelId <= 1}
              className="p-2 rounded-lg bg-[#14142f] hover:bg-[#1a1a3d] border border-slate-700/60 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous Sector"
              id="prev-level-btn"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          {/* Reset / Scramble Button */}
          <button
            onClick={handleReplay}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg bg-[#14142f] hover:bg-[#1a1a3d] border border-slate-700/60 hover:border-slate-500 text-slate-300 text-xs font-mono transition-all cursor-pointer"
            id="reset-puzzle-btn"
            title="Reset Board to Starting Rotation"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">RESET</span>
          </button>

          {/* Lore description hint / Sector pill */}
          <div 
            onClick={() => !isDailyHackMode && setIsLevelSelectOpen(true)}
            className="text-[11px] font-mono text-slate-400 text-center truncate px-2 cursor-pointer hover:text-cyan-300 transition-colors flex items-center gap-1.5 justify-center flex-1"
            title="Click to Open Sector Matrix (1000 Levels)"
          >
            <span className="text-cyan-300 font-extrabold text-xs sm:text-sm font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40 shadow-[0_0_6px_rgba(0,243,255,0.2)]">
              LEVEL #{currentLevelId}
            </span>
            <span className="hidden md:inline text-slate-600">&bull;</span>
            <span className="hidden md:inline truncate">{currentLevelConfig.name}</span>
          </div>

          {/* Hint Trigger Button */}
          <button
            onClick={handleUseHint}
            disabled={hintsAvailable <= 0 || isLevelWon}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
              hintsAvailable > 0
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            id="hint-btn"
            title="Reveal alignment of one misplaced wire"
          >
            <Lightbulb className="w-4 h-4" />
            <span>HINT ({hintsAvailable})</span>
          </button>

          {/* Quick Settings Access (especially helpful on mobile) */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg bg-[#14142f] hover:bg-[#1a1a3d] border border-cyan-500/40 text-cyan-400 hover:text-white transition-all cursor-pointer shrink-0"
            title="System Settings & Themes"
            id="tactical-settings-btn"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Quick Next Level (Campaign only) */}
          {!isDailyHackMode && (
            <button
              onClick={() => initLevel(Math.min(TOTAL_CAMPAIGN_LEVELS, currentLevelId + 1))}
              disabled={currentLevelId >= highestLevel || currentLevelId >= TOTAL_CAMPAIGN_LEVELS}
              className="p-2 rounded-lg bg-[#14142f] hover:bg-[#1a1a3d] border border-slate-700/60 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title={currentLevelId >= highestLevel ? "Complete current level to breach next" : "Next Sector"}
              id="quick-next-level-btn"
            >
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
          )}
        </div>

        {/* Adsterra Sponsored Ad Banners (728x90 on Desktop, 468x60 on Mobile) */}
        <ResponsiveAdBanner 
          isAdFree={isAdFree} 
          onOpenSubscription={handleOpenSubscription} 
        />

        {/* Adsterra Native Banner */}
        <NativeAdBanner 
          isAdFree={isAdFree} 
          onOpenSubscription={handleOpenSubscription} 
        />

        {/* Bottom Cyber Circuit Status Line */}
        <footer className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
            <span>Quantum Source: ENERGIZED</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-cyan-400">
              Receivers: {cells.filter(c => c.isTarget && c.isPowered).length} / {cells.filter(c => c.isTarget).length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline">Click or tap tiles to rotate 90&deg;</span>
            <span className="text-[#00f3ff] font-bold">
              Wire Connect: Cyber Circuit
            </span>
          </div>
        </footer>

      </main>

      {/* MODALS */}
      {/* 1. Level Complete Victory Modal (Campaign Mode) */}
      <LevelCompleteModal
        isOpen={isLevelWon && !isDailyHackMode}
        level={currentLevelConfig}
        moves={moves}
        seconds={elapsedSeconds}
        stars={levelWinStats.stars}
        scoreGained={levelWinStats.scoreGained}
        currentStreak={currentStreak}
        isLoggedIn={Boolean(user)}
        isAdFree={isAdFree}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onNextLevel={handleNextLevel}
        onReplay={handleReplay}
        onOpenLeaderboard={() => {
          setIsLevelWon(false);
          setIsLeaderboardOpen(true);
        }}
      />

      {/* 2. Daily Hack Mission Launch & Intel Modal */}
      <DailyHackModal
        isOpen={isDailyHackModalOpen}
        mission={dailyMission}
        record={dailyHackRecord}
        onStartMission={startDailyHackMission}
        onClose={() => setIsDailyHackModalOpen(false)}
      />

      {/* 3. Daily Hack Mission Victory Modal */}
      <DailyHackCompleteModal
        isOpen={isDailyHackCompleteModalOpen}
        mission={dailyMission}
        moves={dailyHackWinStats.moves}
        timeTaken={dailyHackWinStats.timeTaken}
        beatTimeLimit={dailyHackWinStats.beatTimeLimit}
        baseScore={dailyHackWinStats.baseScore}
        bonusPoints={dailyHackWinStats.bonusPoints}
        currentStreak={currentStreak}
        isLoggedIn={Boolean(user)}
        isAdFree={isAdFree}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onReturnToCampaign={() => {
          setIsDailyHackCompleteModalOpen(false);
          exitDailyHackMission();
        }}
        onReplayMission={() => {
          setIsDailyHackCompleteModalOpen(false);
          startDailyHackMission();
        }}
        onOpenLeaderboard={() => {
          setIsDailyHackCompleteModalOpen(false);
          setIsLeaderboardOpen(true);
        }}
      />

      {/* 4. Global Cyber Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        currentUserId={user?.uid}
        currentScore={totalScore}
        currentHighestLevel={highestLevel}
        currentStars={totalStarsCount}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* 5. Level Select Sector Grid Modal */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        highestUnlockedLevel={highestLevel}
        currentLevel={currentLevelId}
        starsMap={starsMap}
        onSelectLevel={(lvlId) => {
          if (isDailyHackMode) {
            setIsDailyHackMode(false);
          }
          initLevel(lvlId);
        }}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      {/* 6. Settings & Theme Calibration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        isAdFree={isAdFree}
        user={user}
        onSignOut={handleSignOut}
        onGoogleSignIn={handleGoogleSignIn}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onOpenAdminVip={() => setIsAdminVipModalOpen(true)}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onResetProgress={handleResetProgress}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* 7. Push Alerts & Daily Hack Events Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* 8. Cyber VIP Subscription / Ad-Free Pass Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        isAdFree={isAdFree}
        onToggleAdFree={handleToggleAdFree}
        onOpenAdminPanel={() => setIsAdminVipModalOpen(true)}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      {/* 9. Admin VIP Approval Panel Modal */}
      <AdminVipModal
        isOpen={isAdminVipModalOpen}
        currentUser={user}
        onClose={() => setIsAdminVipModalOpen(false)}
        onVipApprovedLocally={() => handleToggleAdFree(true)}
      />

    </div>
  );
}
