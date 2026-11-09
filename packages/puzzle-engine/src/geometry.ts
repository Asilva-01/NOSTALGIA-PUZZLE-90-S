import { defined, mulberry32, randomFloat } from '@puzzle-universe/shared-utils';
import { gridForPieceCount } from './grid.ts';
import {
  boundsOf,
  cubicTo,
  dropMove,
  lastPoint,
  lineTo,
  moveTo,
  reverseCommands,
} from './path.ts';
import type {
  EdgeKind,
  PathCommand,
  PieceCount,
  PieceGeometry,
  PuzzleGeneration,
  SharedEdge,
} from './types.ts';

export type GeneratePuzzleInput = {
  width: number;
  height: number;
  pieceCount: PieceCount;
  seed: number;
  /** Extra board origin, usually 0. */
  originX?: number;
  originY?: number;
};

function edgeKindForSide(edge: SharedEdge, side: 'top' | 'right' | 'bottom' | 'left'): EdgeKind {
  if (edge.kind === 'flat') {
    return 'flat';
  }
  if (side === 'right') {
    return edge.sign === 1 ? 'tab' : 'blank';
  }
  if (side === 'left') {
    return edge.sign === 1 ? 'blank' : 'tab';
  }
  if (side === 'bottom') {
    return edge.sign === 1 ? 'tab' : 'blank';
  }
  return edge.sign === 1 ? 'blank' : 'tab';
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Curva Bézier de aba clássica, na direção canônica da aresta compartilhada.
 * Horizontal L→R, bulge +y quando sign = +1.
 * Vertical T→B, bulge +x quando sign = +1.
 */
export function shapedEdgeCommands(edge: SharedEdge): PathCommand[] {
  const { x0, y0, x1, y1, sign, center, size } = edge;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const nx = edge.axis === 'h' ? 0 : sign;
  const ny = edge.axis === 'h' ? sign : 0;
  const depth = len * 0.22 * size;
  const half = 0.18 * size;

  const tLine = Math.max(0.12, center - half);
  const tNeck = center - half * 0.45;
  const tMid = center;
  const tNeck2 = center + half * 0.45;
  const tLine2 = Math.min(0.88, center + half);

  const p = (t: number, offset: number) => ({
    x: mix(x0, x1, t) + nx * offset,
    y: mix(y0, y1, t) + ny * offset,
  });

  const a = p(tLine, 0);
  const neckOut = p(tNeck, depth * 0.15);
  const knobA = p(tNeck, depth * 0.92);
  const knob = p(tMid, depth);
  const knobB = p(tNeck2, depth * 0.92);
  const neckIn = p(tNeck2, depth * 0.15);
  const b = p(tLine2, 0);
  const end = { x: x1, y: y1 };

  return [
    moveTo(x0, y0),
    lineTo(a.x, a.y),
    cubicTo(neckOut.x, neckOut.y, knobA.x, knobA.y, knob.x, knob.y),
    cubicTo(knobB.x, knobB.y, neckIn.x, neckIn.y, b.x, b.y),
    lineTo(end.x, end.y),
  ];
}

export function flatEdgeCommands(x0: number, y0: number, x1: number, y1: number): PathCommand[] {
  return [moveTo(x0, y0), lineTo(x1, y1)];
}

export function edgeCommands(edge: SharedEdge, reverse: boolean): PathCommand[] {
  const canonical =
    edge.kind === 'flat'
      ? flatEdgeCommands(edge.x0, edge.y0, edge.x1, edge.y1)
      : shapedEdgeCommands(edge);
  return reverse ? reverseCommands(canonical) : canonical;
}

function appendEdge(path: PathCommand[], edge: SharedEdge, reverse: boolean): void {
  const cmds = dropMove(edgeCommands(edge, reverse));
  const cursor = lastPoint(path);
  const first = cmds[0];
  if (first && first.type !== 'Z') {
    const gap = Math.hypot(first.x - cursor.x, first.y - cursor.y);
    if (gap > 0.6) {
      path.push(lineTo(first.x, first.y));
    }
  }
  path.push(...cmds);
}

export function generatePuzzle(input: GeneratePuzzleInput): PuzzleGeneration {
  const originX = input.originX ?? 0;
  const originY = input.originY ?? 0;
  const aspect = input.width / input.height;
  const { cols, rows } = gridForPieceCount(input.pieceCount, aspect);
  const cellW = input.width / cols;
  const cellH = input.height / rows;
  const rng = mulberry32(input.seed);

  const horizontal: SharedEdge[][] = [];
  for (let r = 0; r <= rows; r += 1) {
    const row: SharedEdge[] = [];
    for (let c = 0; c < cols; c += 1) {
      const x0 = originX + c * cellW;
      const y0 = originY + r * cellH;
      const x1 = originX + (c + 1) * cellW;
      const y1 = y0;
      const border = r === 0 || r === rows;
      row.push({
        id: `h-${r}-${c}`,
        axis: 'h',
        x0,
        y0,
        x1,
        y1,
        kind: border ? 'flat' : 'shaped',
        sign: rng() < 0.5 ? 1 : -1,
        center: randomFloat(rng, 0.44, 0.56),
        size: randomFloat(rng, 0.86, 1.14),
      });
    }
    horizontal.push(row);
  }

  const vertical: SharedEdge[][] = [];
  for (let r = 0; r < rows; r += 1) {
    const row: SharedEdge[] = [];
    for (let c = 0; c <= cols; c += 1) {
      const x0 = originX + c * cellW;
      const y0 = originY + r * cellH;
      const x1 = x0;
      const y1 = originY + (r + 1) * cellH;
      const border = c === 0 || c === cols;
      row.push({
        id: `v-${r}-${c}`,
        axis: 'v',
        x0,
        y0,
        x1,
        y1,
        kind: border ? 'flat' : 'shaped',
        sign: rng() < 0.5 ? 1 : -1,
        center: randomFloat(rng, 0.44, 0.56),
        size: randomFloat(rng, 0.86, 1.14),
      });
    }
    vertical.push(row);
  }

  const pieces: PieceGeometry[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const top = defined(defined(horizontal[r], 'h row')[c], 'top edge');
      const bottom = defined(defined(horizontal[r + 1], 'h row+1')[c], 'bottom edge');
      const left = defined(defined(vertical[r], 'v row')[c], 'left edge');
      const right = defined(defined(vertical[r], 'v row')[c + 1], 'right edge');

      const path: PathCommand[] = [moveTo(top.x0, top.y0)];
      appendEdge(path, top, false);
      appendEdge(path, right, false);
      appendEdge(path, bottom, true);
      appendEdge(path, left, true);
      path.push({ type: 'Z' });

      const isEdge = r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
      pieces.push({
        id: `p-${r}-${c}`,
        row: r,
        col: c,
        bounds: boundsOf(path),
        cell: {
          x: originX + c * cellW,
          y: originY + r * cellH,
          width: cellW,
          height: cellH,
        },
        path,
        edges: {
          top: edgeKindForSide(top, 'top'),
          right: edgeKindForSide(right, 'right'),
          bottom: edgeKindForSide(bottom, 'bottom'),
          left: edgeKindForSide(left, 'left'),
        },
        edgeIds: {
          top: top.id,
          right: right.id,
          bottom: bottom.id,
          left: left.id,
        },
        isEdge,
      });
    }
  }

  return {
    cols,
    rows,
    board: { x: originX, y: originY, width: input.width, height: input.height },
    pieces,
    edges: [...horizontal.flat(), ...vertical.flat()],
    seed: input.seed,
    pieceCount: input.pieceCount,
  };
}

export function complementKind(kind: EdgeKind): EdgeKind {
  if (kind === 'flat') return 'flat';
  return kind === 'tab' ? 'blank' : 'tab';
}

export function pieceAt(
  generation: PuzzleGeneration,
  row: number,
  col: number,
): PieceGeometry {
  const piece = generation.pieces.find((item) => item.row === row && item.col === col);
  return defined(piece, `Peça ${row},${col} não encontrada`);
}
