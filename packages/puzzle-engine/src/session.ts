import { clamp, defined, dist } from '@puzzle-universe/shared-utils';
import { generatePuzzle } from './geometry.ts';
import { canUseHelp, emptyHelpUsage, HELP_PRESETS, remainingHelp } from './help.ts';
import { computeScore, computeStars } from './score.ts';
import { contentsWorld, fitWorldInView, isPortraitView, layoutPlayfield } from './playfield.ts';
import { DEFAULT_LAYOUT_VIEW, scatterPieces, separateEdgePieces } from './shuffle.ts';
import type { CameraState } from './types.ts';
import type {
  HelpLimits,
  HelpPresetName,
  HelpUsage,
  PieceCount,
  PieceRuntime,
  PuzzleGeneration,
  Rect,
  SavedSession,
} from './types.ts';

export type SessionConfig = {
  appId: string;
  puzzleId: string;
  phaseId: string | null;
  imageSrc: string;
  imageWidth: number;
  imageHeight: number;
  pieceCount: PieceCount;
  seed: number;
  helpPreset?: HelpPresetName;
  helpLimits?: HelpLimits;
  timerEnabled?: boolean;
  snapRatio?: number;
};

export type HighlightState = {
  pieceId: string;
  until: number;
} | null;

export class PuzzleSession {
  readonly generation: PuzzleGeneration;
  readonly config: SessionConfig;
  readonly helpLimits: HelpLimits;
  pieces: PieceRuntime[];
  helpUsed: HelpUsage;
  helpPreset: HelpPresetName;
  elapsedMs: number;
  timerEnabled: boolean;
  paused: boolean;
  completed: boolean;
  score: number;
  startedAt: string;
  updatedAt: string;
  highlight: HighlightState = null;
  draggingId: string | null = null;
  lastPulseId: string | null = null;
  private dragOffset = { x: 0, y: 0 };
  private maxZ: number;
  private lastTick: number | null = null;
  private view = DEFAULT_LAYOUT_VIEW;
  private restored = false;
  private didLayout = false;

  constructor(config: SessionConfig, saved?: SavedSession) {
    this.config = config;
    this.generation = generatePuzzle({
      width: config.imageWidth,
      height: config.imageHeight,
      pieceCount: config.pieceCount,
      seed: config.seed,
    });
    this.helpPreset = config.helpPreset ?? 'casual';
    this.helpLimits = config.helpLimits ?? HELP_PRESETS[this.helpPreset];
    this.helpUsed = emptyHelpUsage();
    this.elapsedMs = 0;
    this.timerEnabled = config.timerEnabled ?? true;
    this.paused = false;
    this.completed = false;
    this.score = 0;
    this.startedAt = new Date().toISOString();
    this.updatedAt = this.startedAt;
    this.pieces = scatterPieces(this.generation.pieces, this.generation.board, config.seed);
    this.maxZ = this.pieces.length;

    if (saved) {
      this.restore(saved);
      this.restored = true;
    }
  }

  fitToView(width: number, height: number): CameraState {
    this.view = { width: Math.max(80, width), height: Math.max(80, height) };
    return fitWorldInView(this.view, contentsWorld(this.board, this.pieces));
  }

  layoutToView(width: number, height: number): CameraState {
    const next = { width: Math.max(80, width), height: Math.max(80, height) };
    const tooSmall = next.width < 160 || next.height < 160;
    const orientationChanged =
      this.didLayout && isPortraitView(next) !== isPortraitView(this.view);
    this.view = next;
    if (
      !tooSmall &&
      !this.restored &&
      !this.draggingId &&
      (!this.didLayout || orientationChanged)
    ) {
      const placed = this.pieces.filter((piece) => piece.placed);
      const loose = this.generation.pieces.filter(
        (geometry) => !placed.some((piece) => piece.id === geometry.id),
      );
      const laid = layoutPlayfield({
        view: this.view,
        board: this.board,
        cols: this.generation.cols,
        rows: this.generation.rows,
        pieces: loose.length > 0 ? loose : this.generation.pieces,
        seed: this.config.seed,
      });
      this.pieces = placed.length > 0 ? [...placed, ...laid.pieces] : laid.pieces;
      this.maxZ = this.pieces.reduce((max, piece) => Math.max(max, piece.zIndex), 0);
      this.didLayout = true;
    }
    return fitWorldInView(this.view, contentsWorld(this.board, this.pieces));
  }

  get board(): Rect {
    return this.generation.board;
  }

  get snapThreshold(): number {
    const ratio = this.config.snapRatio ?? 0.28;
    const cell = this.generation.pieces[0]?.cell;
    const size = cell ? Math.min(cell.width, cell.height) : 64;
    return Math.max(18, size * ratio);
  }

  remainingHelp() {
    return remainingHelp(this.helpLimits, this.helpUsed);
  }

  tick(now: number): void {
    if (this.paused || this.completed || !this.timerEnabled) {
      this.lastTick = now;
      return;
    }
    if (this.lastTick !== null) {
      this.elapsedMs += now - this.lastTick;
    }
    this.lastTick = now;
    if (this.highlight && now > this.highlight.until) {
      this.highlight = null;
    }
  }

  pause(): void {
    this.paused = true;
    this.lastTick = null;
    this.touch();
  }

  resume(): void {
    if (this.completed) return;
    this.paused = false;
    this.lastTick = null;
    this.touch();
  }

  setTimerEnabled(enabled: boolean): void {
    this.timerEnabled = enabled;
    this.touch();
  }

  pieceById(id: string): PieceRuntime {
    return defined(
      this.pieces.find((piece) => piece.id === id),
      `Peça ${id} não encontrada`,
    );
  }

  unplacedPieces(): PieceRuntime[] {
    return this.pieces.filter((piece) => !piece.placed);
  }

  hitTest(worldX: number, worldY: number): PieceRuntime | null {
    const ordered = [...this.pieces].sort((a, b) => b.zIndex - a.zIndex);
    for (const piece of ordered) {
      if (piece.placed) continue;
      if (pointInBounds(worldX, worldY, piece)) {
        return piece;
      }
    }
    return null;
  }

  beginDrag(id: string, worldX: number, worldY: number): void {
    if (this.paused || this.completed) return;
    const piece = this.pieceById(id);
    if (piece.placed) return;
    this.draggingId = id;
    this.dragOffset = { x: worldX - piece.x, y: worldY - piece.y };
    this.maxZ += 1;
    piece.zIndex = this.maxZ;
  }

  dragTo(worldX: number, worldY: number): void {
    if (!this.draggingId || this.paused) return;
    const piece = this.pieceById(this.draggingId);
    piece.x = worldX - this.dragOffset.x;
    piece.y = worldY - this.dragOffset.y;
  }

  endDrag(): boolean {
    if (!this.draggingId) return false;
    const id = this.draggingId;
    this.draggingId = null;
    return this.trySnap(id);
  }

  trySnap(id: string): boolean {
    const piece = this.pieceById(id);
    if (piece.placed) return false;
    const targetX = piece.bounds.x;
    const targetY = piece.bounds.y;
    const distance = dist(piece.x, piece.y, targetX, targetY);
    if (distance <= this.snapThreshold) {
      this.placePiece(piece);
      this.lastPulseId = piece.id;
      return true;
    }
    this.touch();
    return false;
  }

  /** Coloca a peça na posição correta — usado pelos testes e pelo E2E. */
  placePieceById(id: string): void {
    this.placePiece(this.pieceById(id));
  }

  movePiece(id: string, x: number, y: number): boolean {
    const piece = this.pieceById(id);
    if (piece.placed) return false;
    piece.x = x;
    piece.y = y;
    return this.trySnap(id);
  }

  shuffle(seed = this.config.seed ^ (this.helpUsed.shuffle + 1) * 997): boolean {
    if (this.paused || this.completed) return false;
    if (!canUseHelp(this.helpLimits, this.helpUsed, 'shuffle')) return false;
    const placed = this.pieces.filter((piece) => piece.placed);
    const loose = this.generation.pieces.filter(
      (geometry) => !placed.some((piece) => piece.id === geometry.id),
    );
    const scattered = scatterPieces(loose, this.board, seed, this.view);
    this.pieces = [...placed, ...scattered];
    this.helpUsed.shuffle += 1;
    this.touch();
    return true;
  }

  separateEdges(): boolean {
    if (this.paused || this.completed) return false;
    if (!canUseHelp(this.helpLimits, this.helpUsed, 'separateEdges')) return false;
    this.pieces = separateEdgePieces(this.pieces, this.board, this.view);
    this.helpUsed.separateEdges += 1;
    this.touch();
    return true;
  }

  peekImage(): boolean {
    if (this.completed) return false;
    if (!canUseHelp(this.helpLimits, this.helpUsed, 'peekImage')) return false;
    this.helpUsed.peekImage += 1;
    this.touch();
    return true;
  }

  highlightPiece(now = Date.now()): string | null {
    if (this.paused || this.completed) return null;
    if (!canUseHelp(this.helpLimits, this.helpUsed, 'highlight')) return null;
    const candidates = this.unplacedPieces();
    if (candidates.length === 0) return null;
    const piece = defined(candidates[0], 'sem peça para destacar');
    this.highlight = { pieceId: piece.id, until: now + 4000 };
    this.helpUsed.highlight += 1;
    this.maxZ += 1;
    piece.zIndex = this.maxZ;
    this.touch();
    return piece.id;
  }

  toSaved(): SavedSession {
    return {
      version: 1,
      appId: this.config.appId,
      puzzleId: this.config.puzzleId,
      phaseId: this.config.phaseId,
      pieceCount: this.config.pieceCount,
      seed: this.config.seed,
      imageSrc: this.config.imageSrc,
      pieces: this.pieces.map((piece) => ({
        id: piece.id,
        x: piece.x,
        y: piece.y,
        placed: piece.placed,
        zIndex: piece.zIndex,
      })),
      elapsedMs: this.elapsedMs,
      timerEnabled: this.timerEnabled,
      paused: this.paused,
      completed: this.completed,
      helpUsed: { ...this.helpUsed },
      helpPreset: this.helpPreset,
      score: this.score,
      startedAt: this.startedAt,
      updatedAt: this.updatedAt,
    };
  }

  restore(saved: SavedSession): void {
    this.helpUsed = { ...saved.helpUsed };
    this.helpPreset = saved.helpPreset;
    this.elapsedMs = saved.elapsedMs;
    this.timerEnabled = saved.timerEnabled;
    this.paused = saved.paused;
    this.completed = saved.completed;
    this.score = saved.score;
    this.startedAt = saved.startedAt;
    this.updatedAt = saved.updatedAt;
    const byId = new Map(this.pieces.map((piece) => [piece.id, piece]));
    for (const savedPiece of saved.pieces) {
      const piece = byId.get(savedPiece.id);
      if (!piece) continue;
      piece.x = savedPiece.x;
      piece.y = savedPiece.y;
      piece.placed = savedPiece.placed;
      piece.zIndex = savedPiece.zIndex;
      if (piece.placed) {
        piece.x = piece.bounds.x;
        piece.y = piece.bounds.y;
      }
    }
    this.maxZ = this.pieces.reduce((max, piece) => Math.max(max, piece.zIndex), 0);
    if (this.completed) {
      this.score = computeScore({
        pieceCount: this.config.pieceCount,
        elapsedMs: this.elapsedMs,
        helpUsed: this.helpUsed,
      });
    }
  }

  stars(): 1 | 2 | 3 {
    return computeStars({
      pieceCount: this.config.pieceCount,
      elapsedMs: this.elapsedMs,
      helpUsed: this.helpUsed,
    });
  }

  private placePiece(piece: PieceRuntime): void {
    piece.placed = true;
    piece.x = piece.bounds.x;
    piece.y = piece.bounds.y;
    piece.zIndex = piece.row * this.generation.cols + piece.col;
    if (this.unplacedPieces().length === 0) {
      this.completed = true;
      this.paused = true;
      this.score = computeScore({
        pieceCount: this.config.pieceCount,
        elapsedMs: this.elapsedMs,
        helpUsed: this.helpUsed,
      });
    }
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date().toISOString();
  }
}

function pointInBounds(x: number, y: number, piece: PieceRuntime): boolean {
  const localX = x - piece.x + piece.bounds.x;
  const localY = y - piece.y + piece.bounds.y;
  const pad = 2;
  return (
    localX >= piece.bounds.x - pad &&
    localY >= piece.bounds.y - pad &&
    localX <= piece.bounds.x + piece.bounds.width + pad &&
    localY <= piece.bounds.y + piece.bounds.height + pad
  );
}

export function clampToWorld(x: number, y: number, world: Rect): { x: number; y: number } {
  return {
    x: clamp(x, world.x, world.x + world.width),
    y: clamp(y, world.y, world.y + world.height),
  };
}
