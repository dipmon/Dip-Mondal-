import { DIR, GridCell, LevelConfig, TileKind } from './types';

export function getBasePortsForKind(kind: TileKind): number {
  switch (kind) {
    case 'source':
      // Source node radiates power to all adjacent connected conduits
      return DIR.TOP | DIR.RIGHT | DIR.BOTTOM | DIR.LEFT;
    case 'target':
      // Target terminal can receive power from any adjacent connected conduit
      return DIR.TOP | DIR.RIGHT | DIR.BOTTOM | DIR.LEFT;
    case 'wire_straight':
      // Connects TOP and BOTTOM (5)
      return DIR.TOP | DIR.BOTTOM;
    case 'wire_corner':
      // Connects TOP and RIGHT (3)
      return DIR.TOP | DIR.RIGHT;
    case 'wire_tee':
      // Connects TOP, RIGHT, and BOTTOM (7)
      return DIR.TOP | DIR.RIGHT | DIR.BOTTOM;
    case 'wire_cross':
      // Connects all 4 directions (15)
      return DIR.TOP | DIR.RIGHT | DIR.BOTTOM | DIR.LEFT;
    case 'empty':
    default:
      return 0;
  }
}

export function rotatePorts(ports: number, times: number = 1): number {
  let p = ports;
  const count = ((times % 4) + 4) % 4;
  for (let i = 0; i < count; i++) {
    // 1(TOP) -> 2(RIGHT) -> 4(BOTTOM) -> 8(LEFT) -> 1(TOP)
    p = (((p << 1) & 0x0E) | ((p & 0x08) ? 1 : 0));
  }
  return p;
}

// Compute power flow across all cells in grid
export function evaluateCircuitFlow(
  cells: GridCell[],
  gridSize: number
): {
  updatedCells: GridCell[];
  allTargetsPowered: boolean;
  poweredCount: number;
} {
  const cellMap = new Map<string, GridCell>();
  cells.forEach(c => {
    const isSourceOrTarget = c.isSource || c.isTarget;
    cellMap.set(`${c.row}-${c.col}`, {
      ...c,
      isPowered: false,
      // Ensure sources and targets have 4-way connectivity during graph traversal
      currentPorts: isSourceOrTarget ? (DIR.TOP | DIR.RIGHT | DIR.BOTTOM | DIR.LEFT) : c.currentPorts,
    });
  });

  // Find all sources
  const queue: GridCell[] = [];
  cellMap.forEach(c => {
    if (c.isSource) {
      c.isPowered = true;
      queue.push(c);
    }
  });

  const visited = new Set<string>();
  queue.forEach(c => visited.add(c.id));

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const { row, col, currentPorts } = curr;

    // Check North (row - 1, col)
    if (currentPorts & DIR.TOP && row > 0) {
      const neighbor = cellMap.get(`${row - 1}-${col}`);
      if (neighbor && (neighbor.currentPorts & DIR.BOTTOM) && !visited.has(neighbor.id)) {
        neighbor.isPowered = true;
        visited.add(neighbor.id);
        queue.push(neighbor);
      }
    }

    // Check East (row, col + 1)
    if (currentPorts & DIR.RIGHT && col < gridSize - 1) {
      const neighbor = cellMap.get(`${row}-${col + 1}`);
      if (neighbor && (neighbor.currentPorts & DIR.LEFT) && !visited.has(neighbor.id)) {
        neighbor.isPowered = true;
        visited.add(neighbor.id);
        queue.push(neighbor);
      }
    }

    // Check South (row + 1, col)
    if (currentPorts & DIR.BOTTOM && row < gridSize - 1) {
      const neighbor = cellMap.get(`${row + 1}-${col}`);
      if (neighbor && (neighbor.currentPorts & DIR.TOP) && !visited.has(neighbor.id)) {
        neighbor.isPowered = true;
        visited.add(neighbor.id);
        queue.push(neighbor);
      }
    }

    // Check West (row, col - 1)
    if (currentPorts & DIR.LEFT && col > 0) {
      const neighbor = cellMap.get(`${row}-${col - 1}`);
      if (neighbor && (neighbor.currentPorts & DIR.RIGHT) && !visited.has(neighbor.id)) {
        neighbor.isPowered = true;
        visited.add(neighbor.id);
        queue.push(neighbor);
      }
    }
  }

  // Visual polish: Adapt displayed ports of source & target to adjacent connecting wires
  cellMap.forEach(c => {
    if (c.isSource || c.isTarget) {
      let activePorts = 0;
      const { row, col } = c;

      if (row > 0) {
        const north = cellMap.get(`${row - 1}-${col}`);
        if (north && (north.currentPorts & DIR.BOTTOM)) {
          activePorts |= DIR.TOP;
        }
      }
      if (col < gridSize - 1) {
        const east = cellMap.get(`${row}-${col + 1}`);
        if (east && (east.currentPorts & DIR.LEFT)) {
          activePorts |= DIR.RIGHT;
        }
      }
      if (row < gridSize - 1) {
        const south = cellMap.get(`${row + 1}-${col}`);
        if (south && (south.currentPorts & DIR.TOP)) {
          activePorts |= DIR.BOTTOM;
        }
      }
      if (col > 0) {
        const west = cellMap.get(`${row}-${col - 1}`);
        if (west && (west.currentPorts & DIR.RIGHT)) {
          activePorts |= DIR.LEFT;
        }
      }

      // If at least one adjacent wire is pointing towards it, display those connections.
      // If none yet, display ports facing towards in-bounds, non-empty neighbor cells.
      if (activePorts !== 0) {
        c.currentPorts = activePorts;
      } else {
        let validInBounds = 0;
        if (row > 0 && cellMap.get(`${row - 1}-${col}`)?.kind !== 'empty') validInBounds |= DIR.TOP;
        if (col < gridSize - 1 && cellMap.get(`${row}-${col + 1}`)?.kind !== 'empty') validInBounds |= DIR.RIGHT;
        if (row < gridSize - 1 && cellMap.get(`${row + 1}-${col}`)?.kind !== 'empty') validInBounds |= DIR.BOTTOM;
        if (col > 0 && cellMap.get(`${row}-${col - 1}`)?.kind !== 'empty') validInBounds |= DIR.LEFT;
        c.currentPorts = validInBounds || DIR.BOTTOM;
      }
    }
  });

  const updatedCells: GridCell[] = [];
  let allTargetsPowered = true;
  let targetCount = 0;
  let poweredCount = 0;

  cellMap.forEach(c => {
    updatedCells.push(c);
    if (c.isPowered) poweredCount++;
    if (c.isTarget) {
      targetCount++;
      if (!c.isPowered) {
        allTargetsPowered = false;
      }
    }
  });

  return {
    updatedCells,
    allTargetsPowered: targetCount > 0 && allTargetsPowered,
    poweredCount,
  };
}

export function calculateStars(moves: number, parMoves: number): number {
  if (moves <= parMoves) return 3;
  if (moves <= Math.ceil(parMoves * 1.5)) return 2;
  return 1;
}

export function calculateScore(
  level: LevelConfig,
  moves: number,
  elapsedSeconds: number,
  streak: number
): number {
  const basePoints = level.gridSize * 200 + level.id * 150;
  const speedBonus = Math.max(0, 300 - elapsedSeconds * 4);
  const moveBonus = Math.max(0, (level.parMoves * 2 - moves) * 25);
  const streakMultiplier = 1 + Math.min(2.5, streak * 0.15);

  return Math.round((basePoints + speedBonus + moveBonus) * streakMultiplier);
}
