import { mulberry32 } from '@puzzle-universe/shared-utils';
import type { CameraState, PieceGeometry, PieceRuntime, Rect } from './types.ts';

function shuffleItems<T>(items: readonly T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const current = result[i];
    const swap = result[j];
    if (current === undefined || swap === undefined) continue;
    result[i] = swap;
    result[j] = current;
  }
  return result;
}

export type ViewSize = { width: number; height: number };

export type PlayfieldLayout = {
  camera: CameraState;
  world: Rect;
  trays: Rect[];
  pieces: PieceRuntime[];
  cellScreen: number;
};

const MARGIN = 8;
const GAP_SCREEN = 10;

export const MAX_START_OVERLAP = 0.22;

export function rectsOverlapRatio(a: Rect, b: Rect): number {
  const x = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const inter = x * y;
  if (inter <= 0) return 0;
  const smaller = Math.min(a.width * a.height, b.width * b.height);
  return smaller <= 0 ? 0 : inter / smaller;
}

export function pieceScreenRect(piece: PieceRuntime, camera: CameraState): Rect {
  return {
    x: piece.x * camera.scale + camera.x,
    y: piece.y * camera.scale + camera.y,
    width: piece.bounds.width * camera.scale,
    height: piece.bounds.height * camera.scale,
  };
}

function minCellPx(pieceCount: number): number {
  if (pieceCount <= 12) return 72;
  if (pieceCount <= 24) return 52;
  return 44;
}

function growTrays(
  board: Rect,
  slotW: number,
  slotH: number,
  count: number,
  portrait: boolean,
  gap: number,
): { trays: Rect[]; slots: Array<{ x: number; y: number }>; world: Rect } {
  if (portrait) {
    const cols = Math.max(1, Math.floor(board.width / Math.max(1, slotW)));
    let rows = Math.max(1, Math.ceil(count / 2 / cols));
    let trays = traysPortrait(board, rows * slotH + 0.5, gap);
    let slots = packSlots(trays, slotW, slotH);
    while (slots.length < count && rows < 80) {
      rows += 1;
      trays = traysPortrait(board, rows * slotH + 0.5, gap);
      slots = packSlots(trays, slotW, slotH);
    }
    return { trays, slots, world: union([board, ...trays]) };
  }
  const rows = Math.max(1, Math.floor(board.height / Math.max(1, slotH)));
  let cols = Math.max(1, Math.ceil(count / 2 / rows));
  let trays = traysLandscape(board, cols * slotW + 0.5, gap);
  let slots = packSlots(trays, slotW, slotH);
  while (slots.length < count && cols < 80) {
    cols += 1;
    trays = traysLandscape(board, cols * slotW + 0.5, gap);
    slots = packSlots(trays, slotW, slotH);
  }
  return { trays, slots, world: union([board, ...trays]) };
}

function packSlots(trays: Rect[], slotW: number, slotH: number): Array<{ x: number; y: number }> {
  const slots: Array<{ x: number; y: number }> = [];
  for (const tray of trays) {
    const cols = Math.max(1, Math.floor(tray.width / slotW));
    const rows = Math.max(1, Math.floor(tray.height / slotH));
    const padX = Math.max(0, (tray.width - cols * slotW) / 2);
    const padY = Math.max(0, (tray.height - rows * slotH) / 2);
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        slots.push({
          x: tray.x + padX + c * slotW,
          y: tray.y + padY + r * slotH,
        });
      }
    }
  }
  return slots;
}

function union(rects: Rect[]): Rect {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const rect of rects) {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function traysPortrait(board: Rect, trayH: number, gap: number): Rect[] {
  return [
    { x: board.x, y: board.y - gap - trayH, width: board.width, height: trayH },
    { x: board.x, y: board.y + board.height + gap, width: board.width, height: trayH },
  ];
}

function traysLandscape(board: Rect, trayW: number, gap: number): Rect[] {
  return [
    { x: board.x - gap - trayW, y: board.y, width: trayW, height: board.height },
    { x: board.x + board.width + gap, y: board.y, width: trayW, height: board.height },
  ];
}

function isPortrait(view: ViewSize): boolean {
  return view.height >= view.width * 0.92;
}

function cameraForWorld(view: ViewSize, world: Rect, scale: number): CameraState {
  const x = (view.width - world.width * scale) / 2 - world.x * scale;
  const y = (view.height - world.height * scale) / 2 - world.y * scale;
  return { x, y, scale };
}

function tryScale(
  view: ViewSize,
  board: Rect,
  slotW: number,
  slotH: number,
  count: number,
  scale: number,
  portrait: boolean,
): { trays: Rect[]; slots: Array<{ x: number; y: number }>; world: Rect } | null {
  const usableW = view.width - MARGIN * 2;
  const usableH = view.height - MARGIN * 2;
  const gap = GAP_SCREEN / scale;
  if (portrait) {
    const leftover = usableH - board.height * scale - GAP_SCREEN * 2;
    if (leftover < 72) return null;
    const trayH = leftover / 2 / scale;
    const trays = traysPortrait(board, trayH, gap);
    const slots = packSlots(trays, slotW, slotH);
    if (slots.length < count) return null;
    return { trays, slots, world: union([board, ...trays]) };
  }
  const leftover = usableW - board.width * scale - GAP_SCREEN * 2;
  if (leftover < 72) return null;
  const trayW = leftover / 2 / scale;
  const trays = traysLandscape(board, trayW, gap);
  const slots = packSlots(trays, slotW, slotH);
  if (slots.length < count) return null;
  return { trays, slots, world: union([board, ...trays]) };
}

export function layoutPlayfield(input: {
  view: ViewSize;
  board: Rect;
  cols: number;
  rows: number;
  pieces: readonly PieceGeometry[];
  seed: number;
  preferEdges?: boolean;
}): PlayfieldLayout {
  const portrait = isPortrait(input.view);
  const count = Math.max(1, input.pieces.length);
  const minCell = minCellPx(count);
  const maxBoundW = Math.max(
    input.board.width / input.cols,
    ...input.pieces.map((piece) => piece.bounds.width),
  );
  const maxBoundH = Math.max(
    input.board.height / input.rows,
    ...input.pieces.map((piece) => piece.bounds.height),
  );
  const slotW = maxBoundW * 0.9;
  const slotH = maxBoundH * 0.9;
  const usableW = input.view.width - MARGIN * 2;
  const usableH = input.view.height - MARGIN * 2;
  const largeBoard = count >= 48;
  let scale = portrait ? usableW / input.board.width : usableH / input.board.height;
  const cellFloor = minCell / (input.board.width / input.cols);

  let chosen: ReturnType<typeof tryScale> = null;
  if (largeBoard) {
    const tactile = Math.max(cellFloor, minCell / (input.board.height / input.rows));
    scale = Math.max(tactile, scale * 0.58);
    const gap = GAP_SCREEN / scale;
    chosen = growTrays(input.board, slotW, slotH, count, portrait, gap);
  } else {
    for (let i = 0; i < 36; i += 1) {
      const attempt = tryScale(input.view, input.board, slotW, slotH, count, scale, portrait);
      if (attempt) {
        chosen = attempt;
        break;
      }
      scale *= 0.93;
      if (scale < cellFloor * 0.55) break;
    }
    if (!chosen) {
      const gap = Math.max(slotW, slotH) * 0.08;
      const cols = Math.max(1, Math.floor(input.board.width / slotW));
      const trayH = slotH * Math.ceil(count / 2 / cols);
      const trays = traysPortrait(input.board, trayH, gap);
      chosen = {
        trays,
        slots: packSlots(trays, slotW, slotH),
        world: union([input.board, ...trays]),
      };
      scale = Math.min(usableW / chosen.world.width, usableH / chosen.world.height);
    }
  }

  const ordered = input.preferEdges
    ? [
        ...input.pieces.filter((piece) => piece.isEdge),
        ...input.pieces.filter((piece) => !piece.isEdge),
      ]
    : shuffleItems(input.pieces, input.seed);

  const pieces: PieceRuntime[] = ordered.map((piece, index) => {
    const slot = chosen.slots[index] ??
      chosen.slots[chosen.slots.length - 1] ?? {
        x: input.board.x - piece.bounds.width,
        y: input.board.y,
      };
    return {
      ...piece,
      x: slot.x,
      y: slot.y,
      placed: false,
      zIndex: index + 1,
      groupId: piece.id,
    };
  });

  const occupied = union([
    chosen.world,
    ...pieces.map((piece) => ({
      x: piece.x,
      y: piece.y,
      width: piece.bounds.width,
      height: piece.bounds.height,
    })),
  ]);
  const camera = fitPlayCamera(input.view, input.board, pieces, Math.max(count, input.cols * input.rows));
  return {
    camera,
    world: occupied,
    trays: chosen.trays,
    pieces,
    cellScreen: (input.board.width / input.cols) * camera.scale,
  };
}

export function fitWorldInView(view: ViewSize, world: Rect): CameraState {
  const innerW = Math.max(80, view.width - MARGIN * 2);
  const innerH = Math.max(80, view.height - MARGIN * 2);
  const scale = Math.min(innerW / world.width, innerH / world.height);
  return cameraForWorld(view, world, scale);
}

export function fitPlayCamera(
  view: ViewSize,
  board: Rect,
  pieces: readonly PieceRuntime[],
  pieceCount: number,
): CameraState {
  const all = contentsWorld(board, pieces);
  const sample = pieces[0];
  const cell = Math.min(
    sample?.cell.width ?? board.width,
    sample?.cell.height ?? board.height,
  );
  const overview = fitWorldInView(view, all);
  if (pieceCount < 48 || overview.scale * cell >= 42) {
    return overview;
  }
  const pad = cell * 0.4;
  const focus: Rect = {
    x: board.x - pad,
    y: board.y - pad,
    width: board.width + pad * 2,
    height: board.height + pad * 2,
  };
  const minScale = 44 / cell;
  const fitted = fitWorldInView(view, focus);
  return {
    ...fitted,
    scale: Math.max(fitted.scale, minScale),
    x:
      fitted.scale >= minScale
        ? fitted.x
        : (view.width - focus.width * minScale) / 2 - focus.x * minScale,
    y:
      fitted.scale >= minScale
        ? fitted.y
        : (view.height - focus.height * minScale) / 2 - focus.y * minScale,
  };
}

export function contentsWorld(board: Rect, pieces: readonly PieceRuntime[]): Rect {
  const boxes: Rect[] = [
    board,
    ...pieces
      .filter((piece) => !piece.placed)
      .map((piece) => ({
        x: piece.x,
        y: piece.y,
        width: piece.bounds.width,
        height: piece.bounds.height,
      })),
  ];
  return union(boxes);
}

export function isPortraitView(view: ViewSize): boolean {
  return isPortrait(view);
}
