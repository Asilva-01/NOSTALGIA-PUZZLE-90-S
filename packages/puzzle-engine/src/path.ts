import type { PathCommand, Point, Rect } from './types.ts';

export function moveTo(x: number, y: number): PathCommand {
  return { type: 'M', x, y };
}

export function lineTo(x: number, y: number): PathCommand {
  return { type: 'L', x, y };
}

export function cubicTo(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
  y: number,
): PathCommand {
  return { type: 'C', x1, y1, x2, y2, x, y };
}

export function closePath(): PathCommand {
  return { type: 'Z' };
}

export function pathToSvg(commands: PathCommand[], digits = 2): string {
  return commands
    .map((cmd) => {
      switch (cmd.type) {
        case 'M':
          return `M${cmd.x.toFixed(digits)} ${cmd.y.toFixed(digits)}`;
        case 'L':
          return `L${cmd.x.toFixed(digits)} ${cmd.y.toFixed(digits)}`;
        case 'C':
          return `C${cmd.x1.toFixed(digits)} ${cmd.y1.toFixed(digits)} ${cmd.x2.toFixed(digits)} ${cmd.y2.toFixed(digits)} ${cmd.x.toFixed(digits)} ${cmd.y.toFixed(digits)}`;
        case 'Z':
          return 'Z';
      }
    })
    .join(' ');
}

export function applyPath(ctx: Path2D | CanvasRenderingContext2D, commands: PathCommand[]): void {
  for (const cmd of commands) {
    switch (cmd.type) {
      case 'M':
        ctx.moveTo(cmd.x, cmd.y);
        break;
      case 'L':
        ctx.lineTo(cmd.x, cmd.y);
        break;
      case 'C':
        ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
        break;
      case 'Z':
        ctx.closePath();
        break;
    }
  }
}

export function commandsToPath2D(commands: PathCommand[]): Path2D {
  const path = new Path2D();
  applyPath(path, commands);
  return path;
}

export function reverseCommands(commands: PathCommand[]): PathCommand[] {
  if (commands.length === 0) {
    return [];
  }
  const start = commands[0];
  if (!start || start.type !== 'M') {
    throw new Error('Caminho de borda precisa começar com M');
  }
  const result: PathCommand[] = [];
  let cursor: Point = { x: start.x, y: start.y };
  const segments: Array<{ from: Point; cmd: PathCommand }> = [];
  for (let i = 1; i < commands.length; i += 1) {
    const cmd = commands[i];
    if (!cmd || cmd.type === 'Z' || cmd.type === 'M') {
      continue;
    }
    segments.push({ from: cursor, cmd });
    cursor = { x: cmd.x, y: cmd.y };
  }
  const end = cursor;
  result.push(moveTo(end.x, end.y));
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const seg = segments[i];
    if (!seg) continue;
    if (seg.cmd.type === 'L') {
      result.push(lineTo(seg.from.x, seg.from.y));
    } else if (seg.cmd.type === 'C') {
      result.push(
        cubicTo(seg.cmd.x2, seg.cmd.y2, seg.cmd.x1, seg.cmd.y1, seg.from.x, seg.from.y),
      );
    }
  }
  return result;
}

export function boundsOf(commands: PathCommand[]): Rect {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  const consider = (x: number, y: number) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  };
  for (const cmd of commands) {
    if (cmd.type === 'Z') continue;
    consider(cmd.x, cmd.y);
    if (cmd.type === 'C') {
      consider(cmd.x1, cmd.y1);
      consider(cmd.x2, cmd.y2);
    }
  }
  if (!Number.isFinite(minX)) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function translateCommands(
  commands: PathCommand[],
  dx: number,
  dy: number,
): PathCommand[] {
  return commands.map((cmd) => {
    switch (cmd.type) {
      case 'M':
      case 'L':
        return { ...cmd, x: cmd.x + dx, y: cmd.y + dy };
      case 'C':
        return {
          ...cmd,
          x1: cmd.x1 + dx,
          y1: cmd.y1 + dy,
          x2: cmd.x2 + dx,
          y2: cmd.y2 + dy,
          x: cmd.x + dx,
          y: cmd.y + dy,
        };
      case 'Z':
        return cmd;
    }
  });
}

export function lastPoint(commands: PathCommand[]): Point {
  for (let i = commands.length - 1; i >= 0; i -= 1) {
    const cmd = commands[i];
    if (cmd && cmd.type !== 'Z') {
      return { x: cmd.x, y: cmd.y };
    }
  }
  return { x: 0, y: 0 };
}

export function dropMove(commands: PathCommand[]): PathCommand[] {
  if (commands[0]?.type === 'M') {
    return commands.slice(1);
  }
  return commands;
}
