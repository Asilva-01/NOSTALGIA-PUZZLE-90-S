import { debounce } from '@puzzle-universe/shared-utils';
import { beep } from './audio.ts';
import {
  fitCamera,
  MIN_PIECE_SCREEN_PX,
  panCamera,
  screenToWorld,
  worldToScreen,
  zoomAt,
} from './camera.ts';
import { applyPath } from './path.ts';
import type { PuzzleSession } from './session.ts';
import type { CameraState, PathCommand, PieceRuntime } from './types.ts';

export type PuzzleTestHook = {
  getUnplaced: () => Array<{
    id: string;
    screen: { x: number; y: number; width: number; height: number };
    target: { x: number; y: number };
  }>;
  session: PuzzleSession;
  camera: () => CameraState;
};

declare global {
  interface Window {
    __PUZZLE_TEST__?: PuzzleTestHook;
  }
}

type PieceBitmap = {
  bitmap: CanvasImageSource;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};

function createLayer(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export class PuzzleRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly session: PuzzleSession;
  private readonly image: CanvasImageSource;
  private camera: CameraState;
  private dirty = true;
  private raf = 0;
  private running = false;
  private bitmaps = new Map<string, PieceBitmap>();
  private cacheScale = 1;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinchStart: { dist: number; scale: number } | null = null;
  private panning = false;
  private dpr = 1;
  private readonly onChange: () => void;
  private readonly onComplete: () => void;
  private readonly persist: () => void;
  private readonly persistDebounced: ReturnType<typeof debounce>;
  private pathCache = new Map<string, Path2D>();

  constructor(options: {
    canvas: HTMLCanvasElement;
    session: PuzzleSession;
    image: CanvasImageSource;
    onChange: () => void;
    onComplete: () => void;
    persist: () => void;
  }) {
    this.canvas = options.canvas;
    const ctx = this.canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      throw new Error('Canvas 2D indisponível');
    }
    this.ctx = ctx;
    this.session = options.session;
    this.image = options.image;
    this.onChange = options.onChange;
    this.onComplete = options.onComplete;
    this.persist = options.persist;
    this.persistDebounced = debounce(this.persist, 400);
    this.camera = fitCamera(
      1,
      1,
      this.session.board,
      this.session.generation.cols,
      this.session.generation.rows,
      this.scatterPad(),
    );
    this.resize();
    this.bind();
    this.rebuildBitmaps();
    this.exposeTestHook();
  }

  start(): void {
    this.running = true;
    this.dirty = true;
    this.loop();
  }

  destroy(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.persistDebounced.cancel();
    this.unbind();
    if (typeof window !== 'undefined' && window.__PUZZLE_TEST__?.session === this.session) {
      delete window.__PUZZLE_TEST__;
    }
  }

  requestFit(): void {
    this.camera = fitCamera(
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      this.session.board,
      this.session.generation.cols,
      this.session.generation.rows,
      this.scatterPad(),
    );
    this.markDirty();
  }

  zoomBy(factor: number): void {
    const rect = this.canvas.getBoundingClientRect();
    this.camera = zoomAt(
      this.camera,
      rect.width / 2,
      rect.height / 2,
      factor,
      this.minScale(),
      this.maxScale(),
    );
    this.markDirty();
  }

  markDirty(): void {
    this.dirty = true;
  }

  private scatterPad(): number {
    return Math.max(this.session.board.width, this.session.board.height) * 0.12;
  }

  private minScale(): number {
    const { cols, rows, board } = this.session.generation;
    return Math.max(
      (MIN_PIECE_SCREEN_PX * cols) / board.width,
      (MIN_PIECE_SCREEN_PX * rows) / board.height,
    ) * 0.7;
  }

  private maxScale(): number {
    return this.minScale() * 6;
  }

  private loop = (): void => {
    if (!this.running) return;
    this.session.tick(performance.now());
    if (this.dirty || this.session.draggingId) {
      this.draw();
      this.dirty = Boolean(this.session.draggingId);
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.floor(rect.width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * this.dpr));
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.camera = fitCamera(
      rect.width,
      rect.height,
      this.session.board,
      this.session.generation.cols,
      this.session.generation.rows,
      this.scatterPad(),
    );
    this.rebuildBitmaps();
    this.markDirty();
  }

  private rebuildBitmaps(): void {
    const scale = Math.min(2.2, Math.max(1, this.camera.scale * this.dpr));
    this.cacheScale = scale;
    this.bitmaps.clear();
    this.pathCache.clear();
    for (const piece of this.session.generation.pieces) {
      this.bitmaps.set(piece.id, this.rasterize(piece.path, piece.bounds, scale));
      const path = new Path2D();
      applyPath(path, piece.path);
      this.pathCache.set(piece.id, path);
    }
  }

  private rasterize(path: PathCommand[], bounds: PieceRuntime['bounds'], scale: number): PieceBitmap {
    const pad = 4;
    const width = Math.max(2, Math.ceil((bounds.width + pad * 2) * scale));
    const height = Math.max(2, Math.ceil((bounds.height + pad * 2) * scale));
    const layer = createLayer(width, height);
    const ctx = layer.getContext('2d');
    if (!ctx) {
      throw new Error('Falha ao rasterizar peça');
    }
    ctx.scale(scale, scale);
    ctx.translate(-bounds.x + pad, -bounds.y + pad);
    const clip = new Path2D();
    applyPath(clip, path);
    ctx.save();
    ctx.clip(clip);
    ctx.drawImage(
      this.image,
      this.session.board.x,
      this.session.board.y,
      this.session.board.width,
      this.session.board.height,
    );
    ctx.restore();
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1.2, 1.6 / scale);
    ctx.strokeStyle = 'rgba(20, 12, 8, 0.55)';
    ctx.stroke(clip);
    return {
      bitmap: layer,
      width,
      height,
      offsetX: pad,
      offsetY: pad,
    };
  }

  private draw(): void {
    const { ctx, canvas, camera } = this;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.scale, camera.scale);

    this.drawBoard();
    const highlightId = this.session.highlight?.pieceId;
    if (highlightId) {
      const piece = this.session.pieceById(highlightId);
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 214, 64, 0.95)';
      ctx.lineWidth = 4 / camera.scale;
      ctx.setLineDash([8 / camera.scale, 6 / camera.scale]);
      const ghost = this.pathCache.get(piece.id);
      if (ghost) {
        ctx.stroke(ghost);
      }
      ctx.restore();
    }

    const ordered = [...this.session.pieces].sort((a, b) => {
      if (a.placed !== b.placed) {
        return a.placed ? -1 : 1;
      }
      return a.zIndex - b.zIndex;
    });
    for (const piece of ordered) {
      this.drawPiece(piece);
    }
    ctx.restore();
  }

  private drawBoard(): void {
    const { ctx } = this;
    const { board } = this.session;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.28)';
    ctx.shadowBlur = 24 / this.camera.scale;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(board.x - 8, board.y - 8, board.width + 16, board.height + 16);
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(board.x, board.y, board.width, board.height);
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = 2 / this.camera.scale;
    ctx.strokeRect(board.x, board.y, board.width, board.height);
  }

  private drawPiece(piece: PieceRuntime): void {
    const bitmap = this.bitmaps.get(piece.id);
    const { ctx } = this;
    const dx = piece.x - piece.bounds.x;
    const dy = piece.y - piece.bounds.y;
    ctx.save();
    ctx.translate(dx, dy);
    if (bitmap) {
      ctx.drawImage(
        bitmap.bitmap,
        piece.bounds.x - bitmap.offsetX,
        piece.bounds.y - bitmap.offsetY,
        bitmap.width / this.cacheScale,
        bitmap.height / this.cacheScale,
      );
    } else {
      const path = this.pathCache.get(piece.id);
      if (path) {
        ctx.fillStyle = '#ccc';
        ctx.fill(path);
      }
    }
    if (this.session.draggingId === piece.id) {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 3 / this.camera.scale;
      const path = this.pathCache.get(piece.id);
      if (path) ctx.stroke(path);
    }
    ctx.restore();
  }

  private bind(): void {
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointercancel', this.onPointerUp);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('resize', this.onResize);
  }

  private unbind(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerUp);
    this.canvas.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onResize);
  }

  private onResize = (): void => {
    this.resize();
  };

  private onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const factor = event.deltaY < 0 ? 1.08 : 0.92;
    this.camera = zoomAt(
      this.camera,
      event.clientX - rect.left,
      event.clientY - rect.top,
      factor,
      this.minScale(),
      this.maxScale(),
    );
    this.markDirty();
  };

  private onPointerDown = (event: PointerEvent): void => {
    if (this.session.paused && !this.session.completed) {
      return;
    }
    this.canvas.setPointerCapture(event.pointerId);
    const point = this.eventPoint(event);
    this.pointers.set(event.pointerId, point);
    if (this.pointers.size === 2) {
      this.session.draggingId = null;
      this.panning = false;
      const pts = [...this.pointers.values()];
      const a = pts[0];
      const b = pts[1];
      if (a && b) {
        this.pinchStart = {
          dist: Math.hypot(b.x - a.x, b.y - a.y),
          scale: this.camera.scale,
        };
      }
      return;
    }
    const world = screenToWorld(this.camera, point.x, point.y);
    const hit = this.session.hitTest(world.x, world.y);
    if (hit && !this.session.paused) {
      this.session.beginDrag(hit.id, world.x, world.y);
      this.markDirty();
      this.onChange();
      return;
    }
    this.panning = true;
  };

  private onPointerMove = (event: PointerEvent): void => {
    const point = this.eventPoint(event);
    const prev = this.pointers.get(event.pointerId);
    this.pointers.set(event.pointerId, point);
    if (this.pointers.size === 2 && this.pinchStart) {
      const pts = [...this.pointers.values()];
      const a = pts[0];
      const b = pts[1];
      if (!a || !b) return;
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const factor = dist / Math.max(1, this.pinchStart.dist);
      this.camera = zoomAt(
        { ...this.camera, scale: this.pinchStart.scale },
        midX,
        midY,
        factor,
        this.minScale(),
        this.maxScale(),
      );
      this.markDirty();
      return;
    }
    if (this.session.draggingId) {
      const world = screenToWorld(this.camera, point.x, point.y);
      this.session.dragTo(world.x, world.y);
      this.markDirty();
      return;
    }
    if (this.panning && prev) {
      this.camera = panCamera(this.camera, point.x - prev.x, point.y - prev.y);
      this.markDirty();
    }
  };

  private onPointerUp = (event: PointerEvent): void => {
    this.pointers.delete(event.pointerId);
    if (this.pointers.size < 2) {
      this.pinchStart = null;
    }
    if (this.session.draggingId) {
      const snapped = this.session.endDrag();
      if (snapped) {
        beep('snap');
        if (this.session.completed) {
          beep('complete');
          this.onComplete();
        }
      }
      this.persistDebounced();
      this.onChange();
      this.markDirty();
    }
    this.panning = false;
    try {
      this.canvas.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
  };

  private eventPoint(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private exposeTestHook(): void {
    if (typeof window === 'undefined') return;
    window.__PUZZLE_TEST__ = {
      session: this.session,
      camera: () => this.camera,
      getUnplaced: () => {
        const rect = this.canvas.getBoundingClientRect();
        return this.session
          .unplacedPieces()
          .slice()
          .sort((a, b) => b.zIndex - a.zIndex)
          .map((piece) => {
            const screenOrigin = worldToScreen(this.camera, piece.x, piece.y);
            const target = worldToScreen(this.camera, piece.bounds.x, piece.bounds.y);
            const width = piece.bounds.width * this.camera.scale;
            const height = piece.bounds.height * this.camera.scale;
            return {
              id: piece.id,
              screen: {
                x: rect.left + screenOrigin.x + width / 2,
                y: rect.top + screenOrigin.y + height / 2,
                width,
                height,
              },
              target: {
                x: rect.left + target.x + width / 2,
                y: rect.top + target.y + height / 2,
              },
            };
          });
      },
    };
  }
}
