import { clamp } from '@puzzle-universe/shared-utils';
import type { CameraState, Rect } from './types.ts';

export const MIN_PIECE_SCREEN_PX = 44;

export type CameraWorld = {
  board: Rect;
  scatterPad: number;
};

export function worldRect(board: Rect, scatterPad: number): Rect {
  return {
    x: board.x - scatterPad,
    y: board.y - scatterPad,
    width: board.width + scatterPad * 2,
    height: board.height + scatterPad * 2,
  };
}

export function fitCamera(
  viewWidth: number,
  viewHeight: number,
  board: Rect,
  cols: number,
  rows: number,
  scatterPad: number,
): CameraState {
  const world = worldRect(board, scatterPad);
  const fitScale = Math.min(viewWidth / world.width, viewHeight / world.height);
  const minScaleX = (MIN_PIECE_SCREEN_PX * cols) / board.width;
  const minScaleY = (MIN_PIECE_SCREEN_PX * rows) / board.height;
  const minScale = Math.max(minScaleX, minScaleY);
  const scale = Math.max(fitScale, minScale) * 0.92;
  const x = viewWidth / 2 - (board.x + board.width / 2) * scale;
  const y = viewHeight / 2 - (board.y + board.height / 2) * scale;
  return { x, y, scale };
}

export function screenToWorld(
  camera: CameraState,
  screenX: number,
  screenY: number,
): { x: number; y: number } {
  return {
    x: (screenX - camera.x) / camera.scale,
    y: (screenY - camera.y) / camera.scale,
  };
}

export function worldToScreen(
  camera: CameraState,
  worldX: number,
  worldY: number,
): { x: number; y: number } {
  return {
    x: worldX * camera.scale + camera.x,
    y: worldY * camera.scale + camera.y,
  };
}

export function zoomAt(
  camera: CameraState,
  screenX: number,
  screenY: number,
  factor: number,
  minScale: number,
  maxScale: number,
): CameraState {
  const world = screenToWorld(camera, screenX, screenY);
  const scale = clamp(camera.scale * factor, minScale, maxScale);
  return {
    scale,
    x: screenX - world.x * scale,
    y: screenY - world.y * scale,
  };
}

export function panCamera(camera: CameraState, dx: number, dy: number): CameraState {
  return { ...camera, x: camera.x + dx, y: camera.y + dy };
}
