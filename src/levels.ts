import { DIR, LevelConfig, TileKind, DailyHackMission, LevelMetaSummary, TOTAL_CAMPAIGN_LEVELS } from './types';
import { getBasePortsForKind, rotatePorts } from './gameLogic';

export { TOTAL_CAMPAIGN_LEVELS };

export const CAMPAIGN_LEVELS: LevelConfig[] = [
  // LEVEL 1: 3x3 Introduction
  {
    id: 1,
    name: 'Core Initialization',
    codename: 'PROTO-01',
    gridSize: 3,
    parMoves: 3,
    difficulty: 'Alpha',
    lore: 'Establish basic power feed from the Quantum Generator to the Target Receiver.',
    cells: [
      { row: 0, col: 0, kind: 'source', solutionRotation: 90, scrambleRotation: 0, isLocked: true, label: 'PWR-01' },
      { row: 0, col: 1, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 0, col: 2, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 90 },
      { row: 1, col: 0, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 1, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 2, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 2, col: 0, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 1, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 2, kind: 'target', solutionRotation: 0, scrambleRotation: 0, isLocked: true, label: 'NODE-A' },
    ],
  },
  // LEVEL 2: 3x3 S-Curve
  {
    id: 2,
    name: 'Substation Divert',
    codename: 'ROUTER-02',
    gridSize: 3,
    parMoves: 5,
    difficulty: 'Alpha',
    lore: 'Navigate around corrupted cyber sectors using elbow couplings.',
    cells: [
      { row: 0, col: 0, kind: 'source', solutionRotation: 90, scrambleRotation: 90, isLocked: true, label: 'PWR-02' },
      { row: 0, col: 1, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 90 },
      { row: 0, col: 2, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 0, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 1, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 180 },
      { row: 1, col: 2, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 270 },
      { row: 2, col: 0, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 1, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 2, kind: 'target', solutionRotation: 0, scrambleRotation: 0, isLocked: true, label: 'NODE-B' },
    ],
  },
  // LEVEL 3: 3x3 Central Hub
  {
    id: 3,
    name: 'Neural Junction',
    codename: 'NEXUS-03',
    gridSize: 3,
    parMoves: 6,
    difficulty: 'Alpha',
    lore: 'Route power through the central repeater matrix.',
    cells: [
      { row: 0, col: 0, kind: 'source', solutionRotation: 180, scrambleRotation: 90, isLocked: true, label: 'PWR' },
      { row: 0, col: 1, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 0, col: 2, kind: 'wire_corner', solutionRotation: 90, scrambleRotation: 270 },
      { row: 1, col: 0, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 1, col: 1, kind: 'wire_tee', solutionRotation: 180, scrambleRotation: 0 },
      { row: 1, col: 2, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 2, col: 0, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 270 },
      { row: 2, col: 1, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 2, col: 2, kind: 'target', solutionRotation: 0, scrambleRotation: 0, isLocked: true, label: 'CORE' },
    ],
  },
  // LEVEL 4: 3x3 Split Circuit (2 Targets)
  {
    id: 4,
    name: 'Dual Terminal Surge',
    codename: 'TWIN-04',
    gridSize: 3,
    parMoves: 7,
    difficulty: 'Beta',
    lore: 'Both cyber security vaults must be energized simultaneously.',
    cells: [
      { row: 0, col: 1, kind: 'source', solutionRotation: 180, scrambleRotation: 90, isLocked: true, label: 'MAIN' },
      { row: 0, col: 0, kind: 'wire_corner', solutionRotation: 90, scrambleRotation: 270 },
      { row: 0, col: 2, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 0 },
      { row: 1, col: 0, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 1, col: 1, kind: 'wire_tee', solutionRotation: 90, scrambleRotation: 180 },
      { row: 1, col: 2, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 2, col: 0, kind: 'target', solutionRotation: 0, scrambleRotation: 0, isLocked: true, label: 'VAULT-1' },
      { row: 2, col: 1, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 2, col: 2, kind: 'target', solutionRotation: 0, scrambleRotation: 0, isLocked: true, label: 'VAULT-2' },
    ],
  },
  // LEVEL 5: 3x3 High Density
  {
    id: 5,
    name: 'Vector Loop',
    codename: 'VECTOR-05',
    gridSize: 3,
    parMoves: 8,
    difficulty: 'Beta',
    lore: 'High magnetic interference forces an intricate looping trajectory.',
    cells: [
      { row: 0, col: 0, kind: 'source', solutionRotation: 90, scrambleRotation: 0, isLocked: true, label: 'PWR-A' },
      { row: 0, col: 1, kind: 'wire_tee', solutionRotation: 180, scrambleRotation: 270 },
      { row: 0, col: 2, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 90 },
      { row: 1, col: 0, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 90 },
      { row: 1, col: 1, kind: 'wire_cross', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 2, kind: 'wire_corner', solutionRotation: 270, scrambleRotation: 180 },
      { row: 2, col: 0, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 2, col: 1, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 270 },
      { row: 2, col: 2, kind: 'target', solutionRotation: 270, scrambleRotation: 0, isLocked: true, label: 'DATABANK' },
    ],
  },
  // LEVEL 6: 4x4 Grid - Subnet Access
  {
    id: 6,
    name: 'Subnet Pathway',
    codename: 'GRID-06',
    gridSize: 4,
    parMoves: 8,
    difficulty: 'Beta',
    lore: 'Scale into a 4x4 mainframe bus with alternating bus paths.',
    cells: [
      { row: 0, col: 0, kind: 'source', solutionRotation: 90, scrambleRotation: 90, isLocked: true, label: 'BUS-0' },
      { row: 0, col: 1, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 0, col: 2, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 270 },
      { row: 0, col: 3, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 0, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 1, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 2, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 1, col: 3, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 0, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 1, kind: 'wire_corner', solutionRotation: 90, scrambleRotation: 270 },
      { row: 2, col: 2, kind: 'wire_corner', solutionRotation: 270, scrambleRotation: 180 },
      { row: 2, col: 3, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 3, col: 0, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 3, col: 1, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 180 },
      { row: 3, col: 2, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 3, col: 3, kind: 'target', solutionRotation: 270, scrambleRotation: 270, isLocked: true, label: 'SUB-4' },
    ],
  },
  // LEVEL 7: 4x4 Grid - Neural Pipeline
  {
    id: 7,
    name: 'Neural Pipeline',
    codename: 'SYNAPSE-07',
    gridSize: 4,
    parMoves: 10,
    difficulty: 'Beta',
    lore: 'Route synapsing current across multiple circuit relays.',
    cells: [
      { row: 0, col: 0, kind: 'source', solutionRotation: 90, scrambleRotation: 90, isLocked: true, label: 'SYN-01' },
      { row: 0, col: 1, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 0, col: 2, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 90 },
      { row: 0, col: 3, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 0, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 90 },
      { row: 1, col: 1, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 270 },
      { row: 1, col: 2, kind: 'wire_tee', solutionRotation: 180, scrambleRotation: 90 },
      { row: 1, col: 3, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 270 },
      { row: 2, col: 0, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 1, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 2, col: 2, kind: 'wire_corner', solutionRotation: 90, scrambleRotation: 180 },
      { row: 2, col: 3, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 3, col: 0, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 3, col: 1, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 90 },
      { row: 3, col: 2, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 3, col: 3, kind: 'target', solutionRotation: 0, scrambleRotation: 0, isLocked: true, label: 'MAINFRAME' },
    ],
  },
  // LEVEL 8: 4x4 Grid - Black ICE Shield
  {
    id: 8,
    name: 'Black ICE Shield',
    codename: 'ICE-08',
    gridSize: 4,
    parMoves: 12,
    difficulty: 'Gamma',
    lore: 'Penetrate dynamic defensive barriers to connect both cryptographic relays.',
    cells: [
      { row: 0, col: 0, kind: 'source', solutionRotation: 90, scrambleRotation: 90, isLocked: true, label: 'FEED' },
      { row: 0, col: 1, kind: 'wire_tee', solutionRotation: 90, scrambleRotation: 270 },
      { row: 0, col: 2, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 0, col: 3, kind: 'target', solutionRotation: 270, scrambleRotation: 270, isLocked: true, label: 'VAULT-A' },
      { row: 1, col: 0, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 1, col: 1, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 1, col: 2, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 3, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 0, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 180 },
      { row: 2, col: 1, kind: 'wire_cross', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 2, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 270 },
      { row: 2, col: 3, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 3, col: 0, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 3, col: 1, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 90 },
      { row: 3, col: 2, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 3, col: 3, kind: 'target', solutionRotation: 270, scrambleRotation: 270, isLocked: true, label: 'VAULT-B' },
    ],
  },
  // LEVEL 9: 4x4 Grid - Quantum Accelerator
  {
    id: 9,
    name: 'Quantum Accelerator',
    codename: 'QUANT-09',
    gridSize: 4,
    parMoves: 13,
    difficulty: 'Gamma',
    lore: 'High frequency coils demand precise cross-conduit alignment.',
    cells: [
      { row: 0, col: 0, kind: 'source', solutionRotation: 180, scrambleRotation: 180, isLocked: true, label: 'Q-GEN' },
      { row: 0, col: 1, kind: 'wire_corner', solutionRotation: 90, scrambleRotation: 180 },
      { row: 0, col: 2, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 0, col: 3, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 270 },
      { row: 1, col: 0, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 90 },
      { row: 1, col: 1, kind: 'wire_cross', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 2, kind: 'wire_tee', solutionRotation: 90, scrambleRotation: 180 },
      { row: 1, col: 3, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 2, col: 0, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 2, col: 1, kind: 'wire_tee', solutionRotation: 90, scrambleRotation: 0 },
      { row: 2, col: 2, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 270 },
      { row: 2, col: 3, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 90 },
      { row: 3, col: 0, kind: 'wire_corner', solutionRotation: 270, scrambleRotation: 0 },
      { row: 3, col: 1, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 180 },
      { row: 3, col: 2, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 3, col: 3, kind: 'target', solutionRotation: 0, scrambleRotation: 0, isLocked: true, label: 'TERMINAL' },
    ],
  },
  // LEVEL 10: 5x5 Grid - Cyber Overlord
  {
    id: 10,
    name: 'Overlord Mainframe',
    codename: 'OVERLORD-10',
    gridSize: 5,
    parMoves: 16,
    difficulty: 'Omega',
    lore: 'Master terminal of the city power distribution network. Triple terminal sync required.',
    cells: [
      { row: 0, col: 2, kind: 'source', solutionRotation: 180, scrambleRotation: 90, isLocked: true, label: 'PRIMARY' },
      { row: 0, col: 0, kind: 'target', solutionRotation: 90, scrambleRotation: 0, isLocked: true, label: 'NODE-1' },
      { row: 0, col: 1, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 0, col: 3, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 0, col: 4, kind: 'target', solutionRotation: 270, scrambleRotation: 0, isLocked: true, label: 'NODE-2' },

      { row: 1, col: 0, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },
      { row: 1, col: 1, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 90 },
      { row: 1, col: 2, kind: 'wire_tee', solutionRotation: 180, scrambleRotation: 270 },
      { row: 1, col: 3, kind: 'wire_corner', solutionRotation: 270, scrambleRotation: 180 },
      { row: 1, col: 4, kind: 'empty', solutionRotation: 0, scrambleRotation: 0 },

      { row: 2, col: 0, kind: 'wire_corner', solutionRotation: 90, scrambleRotation: 180 },
      { row: 2, col: 1, kind: 'wire_cross', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 2, kind: 'wire_cross', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 3, kind: 'wire_cross', solutionRotation: 0, scrambleRotation: 0 },
      { row: 2, col: 4, kind: 'wire_corner', solutionRotation: 180, scrambleRotation: 270 },

      { row: 3, col: 0, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 3, col: 1, kind: 'wire_corner', solutionRotation: 270, scrambleRotation: 0 },
      { row: 3, col: 2, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },
      { row: 3, col: 3, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 90 },
      { row: 3, col: 4, kind: 'wire_straight', solutionRotation: 0, scrambleRotation: 90 },

      { row: 4, col: 0, kind: 'wire_corner', solutionRotation: 270, scrambleRotation: 90 },
      { row: 4, col: 1, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 4, col: 2, kind: 'target', solutionRotation: 0, scrambleRotation: 0, isLocked: true, label: 'NODE-3' },
      { row: 4, col: 3, kind: 'wire_straight', solutionRotation: 90, scrambleRotation: 0 },
      { row: 4, col: 4, kind: 'wire_corner', solutionRotation: 0, scrambleRotation: 180 },
    ],
  },
];

// Procedural Level Generator & Metadata Provider for 1,000 Levels
const ALPHA_NAMES = [
  'Silicon Conduit', 'Neon Relay', 'Logic Coupler', 'Photon Highway', 'Synapse Diverter',
  'Grid Interceptor', 'Flux Waveguide', 'Binary Trench', 'Data Highway', 'Pulse Distributor',
  'Resistor Bridge', 'Capacitor Loop', 'Optic Buffer', 'Sub-Relay Core', 'Cyber Channel'
];

const BETA_NAMES = [
  'Orbital Switchyard', 'Black ICE Deflector', 'Mainframe Tap', 'Ghost Waveguide', 'Neural Spire',
  'Cyber Gateway', 'Hyperlane Conductor', 'Plasma Router', 'Cortex Bypass', 'Cipher Grid',
  'Quantum Siphon', 'Titan Busline', 'Echo Repeater', 'Darknet Bridge', 'Vortex Coupling'
];

const GAMMA_NAMES = [
  'Titan Cryptochamber', 'Quantum Entangler', 'Vortex Sub-Relay', 'Darknet Citadel', 'Plasma Gateway',
  'Zero-Point Conduit', 'Neural Singularity', 'Archon Hypergrid', 'Helios Telemetry', 'Black Hole Injector',
  'Chronos Diverter', 'Sub-Zero Logic Array', 'Hyper-Flux Mainframe', 'Superluminal Link', 'Ghost Protocol Vault'
];

const OMEGA_NAMES = [
  'Archon Nexus', 'Zero-Point Core', 'Chronos Synthesizer', 'Singularity Firewall', 'Dark Matter Conductor',
  'Event Horizon Relay', 'Antimatter Waveguide', 'Neural Overmind', 'Infinity Busline', 'Quantum Transcendence',
  'Entropy Inversion Node', 'Omni-Core Distributor', 'Starlight Conductor', 'Galactic Cypher Vault'
];

export function getLevelMeta(id: number): LevelMetaSummary {
  if (id <= CAMPAIGN_LEVELS.length) {
    const l = CAMPAIGN_LEVELS[id - 1];
    return {
      id: l.id,
      name: l.name,
      codename: l.codename,
      gridSize: l.gridSize,
      difficulty: l.difficulty,
      parMoves: l.parMoves,
    };
  }

  const safeId = Math.min(TOTAL_CAMPAIGN_LEVELS, Math.max(1, id));
  const gridSize = safeId <= 15 ? 3 : (safeId <= 120 ? 4 : (safeId <= 600 ? 5 : (safeId % 3 === 0 ? 6 : 5)));
  const diffs: LevelConfig['difficulty'][] = ['Alpha', 'Beta', 'Gamma', 'Omega'];
  const difficulty = diffs[Math.min(3, Math.floor((safeId - 1) / 250))];

  if (safeId === TOTAL_CAMPAIGN_LEVELS) {
    return {
      id: 1000,
      name: 'The Singularity Overmind',
      codename: 'OVERLORD-1000',
      gridSize: 5,
      difficulty: 'Omega',
      parMoves: 26,
    };
  }

  let baseName = '';
  let codenamePrefix = '';
  if (difficulty === 'Alpha') {
    baseName = ALPHA_NAMES[(safeId * 7) % ALPHA_NAMES.length];
    codenamePrefix = 'ALPHA';
  } else if (difficulty === 'Beta') {
    baseName = BETA_NAMES[(safeId * 7) % BETA_NAMES.length];
    codenamePrefix = 'BETA';
  } else if (difficulty === 'Gamma') {
    baseName = GAMMA_NAMES[(safeId * 7) % GAMMA_NAMES.length];
    codenamePrefix = 'GAMMA';
  } else {
    baseName = OMEGA_NAMES[(safeId * 7) % OMEGA_NAMES.length];
    codenamePrefix = 'OMEGA';
  }

  return {
    id: safeId,
    name: `${baseName} #${safeId}`,
    codename: `${codenamePrefix}-${safeId.toString().padStart(3, '0')}`,
    gridSize,
    difficulty,
    parMoves: Math.round(gridSize * 2.8) + (safeId > 500 ? 3 : 0),
  };
}

let cachedAllMetas: LevelMetaSummary[] | null = null;

export function getAllLevelMetas(): LevelMetaSummary[] {
  if (cachedAllMetas && cachedAllMetas.length === TOTAL_CAMPAIGN_LEVELS) {
    return cachedAllMetas;
  }
  const metas: LevelMetaSummary[] = [];
  for (let i = 1; i <= TOTAL_CAMPAIGN_LEVELS; i++) {
    metas.push(getLevelMeta(i));
  }
  cachedAllMetas = metas;
  return metas;
}

// In-memory cache for procedural levels so gameplay transitions are instantaneous
const proceduralLevelCache = new Map<number, LevelConfig>();

export function getOrGenerateLevel(levelId: number): LevelConfig {
  const safeId = Math.min(TOTAL_CAMPAIGN_LEVELS, Math.max(1, levelId));
  const existing = CAMPAIGN_LEVELS.find(l => l.id === safeId);
  if (existing) return existing;

  const cached = proceduralLevelCache.get(safeId);
  if (cached) return cached;

  const generated = generateProceduralLevel(safeId);
  proceduralLevelCache.set(safeId, generated);
  return generated;
}

function generateProceduralLevel(levelId: number): LevelConfig {
  const meta = getLevelMeta(levelId);
  const { gridSize, difficulty, name, codename } = meta;

  let seed = (levelId * 2654435761) ^ 0x5bf03635;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const connections = new Map<string, number>();
  const addEdge = (r1: number, c1: number, r2: number, c2: number) => {
    let d1 = 0, d2 = 0;
    if (r2 < r1) { d1 = DIR.TOP; d2 = DIR.BOTTOM; }
    else if (r2 > r1) { d1 = DIR.BOTTOM; d2 = DIR.TOP; }
    else if (c2 > c1) { d1 = DIR.RIGHT; d2 = DIR.LEFT; }
    else if (c2 < c1) { d1 = DIR.LEFT; d2 = DIR.RIGHT; }

    const k1 = `${r1}-${c1}`;
    const k2 = `${r2}-${c2}`;
    connections.set(k1, (connections.get(k1) || 0) | d1);
    connections.set(k2, (connections.get(k2) || 0) | d2);
  };

  const startR = 0;
  const startC = 0;
  let targetR = gridSize - 1;
  let targetC = gridSize - 1;

  const visited = new Set<string>();
  const path: [number, number][] = [[startR, startC]];
  visited.add(`${startR}-${startC}`);

  let currR = startR;
  let currC = startC;

  const getNeighbors = (r: number, c: number) => {
    const res: [number, number][] = [];
    if (r > 0) res.push([r - 1, c]);
    if (r < gridSize - 1) res.push([r + 1, c]);
    if (c > 0) res.push([r, c - 1]);
    if (c < gridSize - 1) res.push([r, c + 1]);
    return res;
  };

  const minPathLen = gridSize * 2 - 1;

  for (let step = 0; step < 200; step++) {
    if (currR === targetR && currC === targetC && path.length >= minPathLen) {
      break;
    }

    const nbrs = getNeighbors(currR, currC).filter(([nr, nc]) => !visited.has(`${nr}-${nc}`));
    if (nbrs.length === 0) {
      break;
    }

    nbrs.sort((a, b) => {
      const distA = Math.abs(targetR - a[0]) + Math.abs(targetC - a[1]);
      const distB = Math.abs(targetR - b[0]) + Math.abs(targetC - b[1]);
      if (path.length < minPathLen) {
        return distB - distA + (rand() * 2 - 1);
      } else {
        return distA - distB + (rand() * 2 - 1);
      }
    });

    const [nextR, nextC] = nbrs[0];
    addEdge(currR, currC, nextR, nextC);
    visited.add(`${nextR}-${nextC}`);
    path.push([nextR, nextC]);
    currR = nextR;
    currC = nextC;
  }

  if (currR !== targetR || currC !== targetC) {
    targetR = currR;
    targetC = currC;
    if (targetR === startR && targetC === startC) {
      targetR = 0;
      targetC = 1;
      addEdge(0, 0, 0, 1);
      path.push([0, 1]);
    }
  }

  // Cross-ties / loops for higher tiers to enrich puzzle depth
  if (levelId > 80 && path.length > 4) {
    const loopAttempts = Math.floor(gridSize * 0.8);
    for (let a = 0; a < loopAttempts; a++) {
      const idx = Math.floor(rand() * (path.length - 2)) + 1;
      const [pr, pc] = path[idx];
      const nbrs = getNeighbors(pr, pc);
      for (const [nr, nc] of nbrs) {
        if (visited.has(`${nr}-${nc}`) && (nr !== startR || nc !== startC)) {
          addEdge(pr, pc, nr, nc);
          break;
        }
      }
    }
  }

  // Optional 2nd target for advanced levels (Omega tier / levelId > 500)
  let secondTarget: [number, number] | null = null;
  if (levelId > 500 && (levelId % 3 === 0)) {
    for (let i = 2; i < path.length - 2; i++) {
      const [pr, pc] = path[i];
      const nbrs = getNeighbors(pr, pc).filter(([nr, nc]) => !visited.has(`${nr}-${nc}`));
      if (nbrs.length > 0) {
        const [t2r, t2c] = nbrs[0];
        addEdge(pr, pc, t2r, t2c);
        secondTarget = [t2r, t2c];
        visited.add(`${t2r}-${t2c}`);
        break;
      }
    }
  }

  const cells: LevelConfig['cells'] = [];
  const kinds: TileKind[] = ['wire_straight', 'wire_corner', 'wire_tee', 'wire_cross'];

  function getTile(mask: number): { kind: TileKind; rotation: number } {
    for (const kind of kinds) {
      const base = getBasePortsForKind(kind);
      for (let rot = 0; rot < 4; rot++) {
        if (rotatePorts(base, rot) === mask) {
          return { kind, rotation: rot * 90 };
        }
      }
    }
    if (mask & (DIR.TOP | DIR.BOTTOM)) {
      return { kind: 'wire_straight', rotation: 0 };
    }
    return { kind: 'wire_straight', rotation: 90 };
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const key = `${r}-${c}`;
      const mask = connections.get(key) || 0;

      if (r === startR && c === startC) {
        let rot = 90;
        if (mask & DIR.RIGHT) rot = 90;
        else if (mask & DIR.BOTTOM) rot = 180;
        else if (mask & DIR.TOP) rot = 0;
        else if (mask & DIR.LEFT) rot = 270;

        cells.push({
          row: r,
          col: c,
          kind: 'source',
          solutionRotation: rot,
          scrambleRotation: rot,
          isLocked: true,
          label: `PWR-${levelId}`,
        });
      } else if ((r === targetR && c === targetC) || (secondTarget && r === secondTarget[0] && c === secondTarget[1])) {
        let rot = 0;
        if (mask & DIR.TOP) rot = 0;
        else if (mask & DIR.LEFT) rot = 270;
        else if (mask & DIR.BOTTOM) rot = 180;
        else rot = 90;

        cells.push({
          row: r,
          col: c,
          kind: 'target',
          solutionRotation: rot,
          scrambleRotation: rot,
          isLocked: true,
          label: secondTarget && r === secondTarget[0] ? 'NODE-B' : 'NODE-A',
        });
      } else if (mask > 0) {
        const { kind, rotation } = getTile(mask);
        const scrambleSteps = Math.floor(rand() * 3) + 1;
        const scrambleRotation = (rotation + scrambleSteps * 90) % 360;

        cells.push({
          row: r,
          col: c,
          kind,
          solutionRotation: rotation,
          scrambleRotation,
        });
      } else {
        if (rand() > 0.45) {
          const scramble = Math.floor(rand() * 4) * 90;
          cells.push({
            row: r,
            col: c,
            kind: rand() > 0.5 ? 'wire_straight' : 'wire_corner',
            solutionRotation: scramble,
            scrambleRotation: scramble,
          });
        } else {
          cells.push({
            row: r,
            col: c,
            kind: 'empty',
            solutionRotation: 0,
            scrambleRotation: 0,
          });
        }
      }
    }
  }

  const lore = levelId === 1000
    ? 'Grand Master Cyber Matrix: Harmonize all quantum conduits into the central AI core.'
    : `Level ${levelId} security matrix. Stabilize circuit conduits to energize neural nodes.`;

  return {
    id: levelId,
    name,
    codename,
    gridSize,
    parMoves: Math.round(path.length * 1.5) + (secondTarget ? 4 : 0),
    difficulty,
    lore,
    cells,
  };
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyHackMission(dateString?: string): DailyHackMission {
  const targetDate = dateString || getTodayDateString();
  
  // Deterministic seed generation from date string (e.g. 2026-09-21)
  let hash = 0;
  for (let i = 0; i < targetDate.length; i++) {
    hash = ((hash << 5) - hash) + targetDate.charCodeAt(i);
    hash |= 0;
  }
  let seed = Math.abs(hash) + 8421;

  const pseudoRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const missions = [
    {
      title: 'Operation: Black Ice Breach',
      targetName: 'ARASAKA NEURAL MAINFRAME',
      lore: 'High-security multi-terminal mainframe. Synchronize dual quantum encryption nodes before the security countermeasure timer expires.',
    },
    {
      title: 'Operation: Orbital Overdrive',
      targetName: 'HELIOS SATELLITE TELEMETRY',
      lore: 'Infiltrate the orbital relay link. Route plasma waveguides through the 5x5 quantum core before thermal dissipation fails.',
    },
    {
      title: 'Operation: Ghost Protocol',
      targetName: 'ZION CLOUD CYPHER VAULT',
      lore: 'Covert infiltration into military sub-networks. Simultaneous power injection required across both receiving capacitors.',
    },
    {
      title: 'Operation: Neon Infiltration',
      targetName: 'NEO-SEOUL POWER MATRIX',
      lore: 'Critical infrastructure cyber-strike. Bypass redundant logic gates to trigger a city-wide power grid override.',
    },
    {
      title: 'Operation: Zero Day Siphon',
      targetName: 'GENOMICS DATA ARSENAL',
      lore: 'Time-critical deep packet exfiltration. Solve the branching wire conduit puzzle within 90 seconds to extract the payload.',
    },
  ];

  const missionMeta = missions[Math.abs(hash) % missions.length];
  const gridSize = 5;
  const cells: LevelConfig['cells'] = [];

  // Define 5x5 layout with 1 Source and 2 Targets:
  // Source at (2, 0)
  // Target 1 at (0, 4)
  // Target 2 at (4, 4)
  // Path 1: (2,0) -> (1,0) -> (0,0) -> (0,1) -> (0,2) -> (0,3) -> (0,4)
  // Path 2: (2,0) -> (3,0) -> (4,0) -> (4,1) -> (4,2) -> (4,3) -> (4,4)
  // Cross path: (2,0) -> (2,1) -> (2,2) -> (1,2)/(3,2)...
  // Let's create an interconnected network using our pseudo-random branching on the 5x5 grid:
  const connections = new Map<string, number>();

  // Deterministically connect Source (2,0) to mid (2,1) and (2,2)
  // Branch A connects to (0,4) via (0,2)-(0,3)-(0,4) or similar
  // Branch B connects to (4,4) via (4,2)-(4,3)-(4,4)
  // Let's build two verified paths:
  const addEdge = (r1: number, c1: number, r2: number, c2: number) => {
    let dir1 = 0;
    let dir2 = 0;
    if (r2 < r1) { dir1 = DIR.TOP; dir2 = DIR.BOTTOM; }
    else if (r2 > r1) { dir1 = DIR.BOTTOM; dir2 = DIR.TOP; }
    else if (c2 > c1) { dir1 = DIR.RIGHT; dir2 = DIR.LEFT; }
    else if (c2 < c1) { dir1 = DIR.LEFT; dir2 = DIR.RIGHT; }

    const k1 = `${r1}-${c1}`;
    const k2 = `${r2}-${c2}`;
    connections.set(k1, (connections.get(k1) || 0) | dir1);
    connections.set(k2, (connections.get(k2) || 0) | dir2);
  };

  // Branch variation 1 or 2 based on seed
  const variant = Math.floor(pseudoRand() * 3);

  if (variant === 0) {
    // Center spine with upper and lower sweeps
    addEdge(2, 0, 2, 1);
    addEdge(2, 1, 2, 2);
    // Upper branch to Target 1 (0, 4)
    addEdge(2, 1, 1, 1);
    addEdge(1, 1, 0, 1);
    addEdge(0, 1, 0, 2);
    addEdge(0, 2, 0, 3);
    addEdge(0, 3, 0, 4);
    // Lower branch to Target 2 (4, 4)
    addEdge(2, 2, 3, 2);
    addEdge(3, 2, 4, 2);
    addEdge(4, 2, 4, 3);
    addEdge(4, 3, 4, 4);
    // Extra cross-ties
    addEdge(1, 1, 1, 2);
    addEdge(1, 2, 1, 3);
    addEdge(1, 3, 0, 3);
    addEdge(3, 2, 3, 3);
    addEdge(3, 3, 4, 3);
  } else if (variant === 1) {
    // Dual perimeter assault
    addEdge(2, 0, 1, 0);
    addEdge(1, 0, 0, 0);
    addEdge(0, 0, 0, 1);
    addEdge(0, 1, 0, 2);
    addEdge(0, 2, 0, 3);
    addEdge(0, 3, 0, 4);

    addEdge(2, 0, 3, 0);
    addEdge(3, 0, 4, 0);
    addEdge(4, 0, 4, 1);
    addEdge(4, 1, 4, 2);
    addEdge(4, 2, 4, 3);
    addEdge(4, 3, 4, 4);

    addEdge(2, 0, 2, 1);
    addEdge(2, 1, 2, 2);
    addEdge(2, 2, 1, 2);
    addEdge(2, 2, 3, 2);
  } else {
    // Cross matrix flow
    addEdge(2, 0, 2, 1);
    addEdge(2, 1, 1, 1);
    addEdge(1, 1, 1, 2);
    addEdge(1, 2, 0, 2);
    addEdge(0, 2, 0, 3);
    addEdge(0, 3, 0, 4);

    addEdge(2, 1, 3, 1);
    addEdge(3, 1, 3, 2);
    addEdge(3, 2, 4, 2);
    addEdge(4, 2, 4, 3);
    addEdge(4, 3, 4, 4);

    addEdge(2, 1, 2, 2);
    addEdge(2, 2, 2, 3);
    addEdge(2, 3, 1, 3);
    addEdge(2, 3, 3, 3);
  }

  // Populate cells for the 5x5 grid
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const key = `${r}-${c}`;
      const mask = connections.get(key) || 0;

      // Source node at (2, 0)
      if (r === 2 && c === 0) {
        let rot = 90; // faces right
        if (mask === DIR.TOP) rot = 0;
        else if (mask === DIR.BOTTOM) rot = 180;
        else if (mask === DIR.RIGHT) rot = 90;
        cells.push({
          row: r,
          col: c,
          kind: 'source',
          solutionRotation: rot,
          scrambleRotation: rot,
          isLocked: true,
          label: 'Q-GEN',
        });
        continue;
      }

      // Target 1 at (0, 4)
      if (r === 0 && c === 4) {
        let rot = 270; // connects from left
        if (mask === DIR.BOTTOM) rot = 180;
        cells.push({
          row: r,
          col: c,
          kind: 'target',
          solutionRotation: rot,
          scrambleRotation: rot,
          isLocked: true,
          label: 'VAULT-A',
        });
        continue;
      }

      // Target 2 at (4, 4)
      if (r === 4 && c === 4) {
        let rot = 270; // connects from left
        if (mask === DIR.TOP) rot = 0;
        cells.push({
          row: r,
          col: c,
          kind: 'target',
          solutionRotation: rot,
          scrambleRotation: rot,
          isLocked: true,
          label: 'VAULT-B',
        });
        continue;
      }

      if (mask > 0) {
        // Connected wire piece
        const count = ((mask & 1) ? 1 : 0) + ((mask & 2) ? 1 : 0) + ((mask & 4) ? 1 : 0) + ((mask & 8) ? 1 : 0);
        const scramble = (Math.floor(pseudoRand() * 3) + 1) * 90;

        if (count === 4) {
          cells.push({
            row: r,
            col: c,
            kind: 'wire_cross',
            solutionRotation: 0,
            scrambleRotation: 0,
          });
        } else if (count === 3) {
          let solRot = 0;
          if (mask === (DIR.LEFT | DIR.TOP | DIR.RIGHT)) solRot = 0;
          else if (mask === (DIR.TOP | DIR.RIGHT | DIR.BOTTOM)) solRot = 90;
          else if (mask === (DIR.RIGHT | DIR.BOTTOM | DIR.LEFT)) solRot = 180;
          else solRot = 270;

          cells.push({
            row: r,
            col: c,
            kind: 'wire_tee',
            solutionRotation: solRot,
            scrambleRotation: (solRot + scramble) % 360,
          });
        } else if (count === 2) {
          const isStraight = mask === (DIR.TOP | DIR.BOTTOM) || mask === (DIR.LEFT | DIR.RIGHT);
          if (isStraight) {
            const solRot = mask === (DIR.LEFT | DIR.RIGHT) ? 90 : 0;
            cells.push({
              row: r,
              col: c,
              kind: 'wire_straight',
              solutionRotation: solRot,
              scrambleRotation: (solRot + scramble) % 360,
            });
          } else {
            let solRot = 0;
            if (mask === (DIR.TOP | DIR.RIGHT)) solRot = 0;
            else if (mask === (DIR.RIGHT | DIR.BOTTOM)) solRot = 90;
            else if (mask === (DIR.BOTTOM | DIR.LEFT)) solRot = 180;
            else solRot = 270;

            cells.push({
              row: r,
              col: c,
              kind: 'wire_corner',
              solutionRotation: solRot,
              scrambleRotation: (solRot + scramble) % 360,
            });
          }
        } else {
          // Single connection endpoint wire
          cells.push({
            row: r,
            col: c,
            kind: 'wire_straight',
            solutionRotation: 0,
            scrambleRotation: scramble,
          });
        }
      } else {
        // Decorative filler conduit
        const scramble = Math.floor(pseudoRand() * 4) * 90;
        const kind: TileKind = pseudoRand() > 0.4 ? 'wire_corner' : pseudoRand() > 0.5 ? 'wire_straight' : 'empty';
        cells.push({
          row: r,
          col: c,
          kind,
          solutionRotation: scramble,
          scrambleRotation: scramble,
        });
      }
    }
  }

  const cleanDate = targetDate.replace(/-/g, '');
  const config: LevelConfig = {
    id: 9999,
    name: missionMeta.title,
    codename: `HACK-${cleanDate}`,
    gridSize: 5,
    parMoves: 20,
    difficulty: 'Omega',
    lore: missionMeta.lore,
    cells,
  };

  return {
    dateString: targetDate,
    title: missionMeta.title,
    targetName: missionMeta.targetName,
    codename: `HACK-${cleanDate}`,
    gridSize: 5,
    timeLimitSeconds: 90, // 90 second countdown
    bonusPoints: 3000,
    lore: missionMeta.lore,
    config,
  };
}
