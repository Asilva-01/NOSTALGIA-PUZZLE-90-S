export const PIECE_COUNTS = [12, 24, 48, 72, 96, 150, 200] as const;
export type PieceCount = (typeof PIECE_COUNTS)[number];

export type Point = { x: number; y: number };

export type Rect = { x: number; y: number; width: number; height: number };

export type PathCommand =
  | { type: 'M'; x: number; y: number }
  | { type: 'L'; x: number; y: number }
  | { type: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { type: 'Z' };

export type EdgeKind = 'flat' | 'tab' | 'blank';

export const TAB_PROFILES = ['classic', 'wide', 'tall', 'round', 'square', 'stem'] as const;
export type TabProfile = (typeof TAB_PROFILES)[number];

export type HelpPresetName = 'casual' | 'desafio';

export type HelpLimits = {
  peekImage: number;
  highlight: number;
  separateEdges: number;
  shuffle: number;
  partialPeek: number;
};

export type HelpUsage = {
  peekImage: number;
  highlight: number;
  separateEdges: number;
  shuffle: number;
  partialPeek: number;
};

export type SharedEdge = {
  id: string;
  axis: 'h' | 'v';
  /** Canonical start (left or top). */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  kind: 'flat' | 'shaped';
  /**
   * Horizontal: +1 bulge down (+y). Vertical: +1 bulge right (+x).
   */
  sign: 1 | -1;
  center: number;
  size: number;
  profile: TabProfile;
  /** Skew of the knob along the edge, -1…1. */
  lean: number;
};

export type PieceGeometry = {
  id: string;
  row: number;
  col: number;
  /** Bounding box of the path in board coordinates. */
  bounds: Rect;
  /** Tight cell rectangle without tabs. */
  cell: Rect;
  path: PathCommand[];
  edges: {
    top: EdgeKind;
    right: EdgeKind;
    bottom: EdgeKind;
    left: EdgeKind;
  };
  edgeIds: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  isEdge: boolean;
};

export type PieceRuntime = PieceGeometry & {
  x: number;
  y: number;
  placed: boolean;
  zIndex: number;
  groupId: string;
};

export type PuzzleGeneration = {
  cols: number;
  rows: number;
  board: Rect;
  pieces: PieceGeometry[];
  edges: SharedEdge[];
  seed: number;
  pieceCount: PieceCount;
};

export type SavedPiece = {
  id: string;
  x: number;
  y: number;
  placed: boolean;
  zIndex: number;
  groupId?: string;
};

export type DropResult = {
  placed: boolean;
  joined: boolean;
  completed: boolean;
};

export type PartialPeekState = {
  pieceIds: string[];
  until: number;
} | null;

export type SavedSession = {
  version: 1;
  appId: string;
  puzzleId: string;
  phaseId: string | null;
  pieceCount: PieceCount;
  seed: number;
  imageSrc: string;
  pieces: SavedPiece[];
  elapsedMs: number;
  timerEnabled: boolean;
  paused: boolean;
  completed: boolean;
  helpUsed: HelpUsage;
  helpPreset: HelpPresetName;
  score: number;
  startedAt: string;
  updatedAt: string;
};

export type ProgressState = {
  version: 1;
  appId: string;
  completedPhaseIds: string[];
  unlockedPhaseIds: string[];
  stars: Record<string, number>;
  bestScores: Record<string, number>;
  lastRandomId: string | null;
  randomHistory: string[];
  stats: {
    completedGames: number;
    totalTimeMs: number;
  };
};

export type PhaseDefinition = {
  id: string;
  number: number;
  pieceCount: PieceCount;
  puzzleId: string;
};

export type CameraState = {
  x: number;
  y: number;
  scale: number;
};
