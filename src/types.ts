export const DIR = {
  TOP: 1,     // 0001
  RIGHT: 2,   // 0010
  BOTTOM: 4,  // 0100
  LEFT: 8,    // 1000
} as const;

export type DirectionBit = 1 | 2 | 4 | 8;

export type TileKind = 'source' | 'target' | 'wire_straight' | 'wire_corner' | 'wire_tee' | 'wire_cross' | 'empty';

export interface GridCell {
  id: string;
  row: number;
  col: number;
  kind: TileKind;
  rotation: number; // in degrees: 0, 90, 180, 270
  basePorts: number; // bitmask in 0 deg
  currentPorts: number; // bitmask dynamically rotated
  isPowered: boolean;
  isSource: boolean;
  isTarget: boolean;
  isLocked?: boolean; // If fixed in place (like a secured power nexus)
  label?: string;
}

export const TOTAL_CAMPAIGN_LEVELS = 1000;

export interface LevelMetaSummary {
  id: number;
  name: string;
  codename: string;
  gridSize: number;
  difficulty: 'Alpha' | 'Beta' | 'Gamma' | 'Omega';
  parMoves: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  codename: string;
  gridSize: number; // e.g. 3, 4, 5
  parMoves: number;
  difficulty: 'Alpha' | 'Beta' | 'Gamma' | 'Omega';
  lore: string;
  cells: {
    row: number;
    col: number;
    kind: TileKind;
    solutionRotation: number;
    scrambleRotation: number;
    isLocked?: boolean;
    label?: string;
  }[];
}

export interface UserProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  highestLevel: number;
  totalScore: number;
  starsEarned: number;
  currentStreak: number;
  puzzlesSolved: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  score: number;
  highestLevel: number;
  stars: number;
  updatedAt?: string;
}

export type CyberTheme = 'cyberpunk' | 'matrix' | 'synthwave';

export interface GameSettings {
  sfxVolume: number;
  ambientVolume: number;
  isMuted: boolean;
  theme: CyberTheme;
  glowIntensity: 'normal' | 'high' | 'ultra';
  notificationsEnabled: boolean;
}

export interface LevelStats {
  moves: number;
  seconds: number;
  stars: number;
  score: number;
  isCompleted: boolean;
}

export interface DailyHackMission {
  dateString: string; // YYYY-MM-DD
  title: string;
  targetName: string;
  codename: string;
  gridSize: number;
  timeLimitSeconds: number;
  bonusPoints: number;
  lore: string;
  config: LevelConfig;
}

export interface DailyHackRecord {
  dateString: string;
  completed: boolean;
  timeTaken: number;
  beatTimeLimit: boolean;
  bonusAwarded: number;
  completedAt?: string;
}

export interface VipPaymentDetails {
  utrNumber: string;
  plan: 'monthly' | 'lifetime';
  amount: number;
  payeeNumber: string;
  paymentMethod: 'phonepe' | 'gpay' | 'paytm' | 'upi';
  timestamp: string;
  isVerified: boolean;
}

export interface VipRequest {
  id: string;
  userId: string;
  name: string;
  number: string;
  utr: string;
  plan: 'monthly' | 'lifetime';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
}
