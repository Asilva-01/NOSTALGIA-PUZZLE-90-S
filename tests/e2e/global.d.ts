import type { PuzzleTestHook } from '@puzzle-universe/puzzle-engine';

declare global {
  interface Window {
    __PUZZLE_TEST__?: PuzzleTestHook;
  }
}

export {};
