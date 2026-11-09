export { PIECE_COUNTS, type PieceCount } from './types.ts';
export type {
  CameraState,
  EdgeKind,
  HelpLimits,
  HelpPresetName,
  HelpUsage,
  PathCommand,
  PhaseDefinition,
  PieceGeometry,
  PieceRuntime,
  ProgressState,
  PuzzleGeneration,
  SavedSession,
  SharedEdge,
} from './types.ts';
export { GRID_OPTIONS, gridForPieceCount, isPieceCount } from './grid.ts';
export {
  complementKind,
  edgeCommands,
  generatePuzzle,
  pieceAt,
  shapedEdgeCommands,
} from './geometry.ts';
export { fisherYates, scatterPieces, separateEdgePieces } from './shuffle.ts';
export { computeScore, computeStars } from './score.ts';
export { HELP_PRESETS, canUseHelp, emptyHelpUsage, formatHelpLimit, remainingHelp } from './help.ts';
export { PuzzleSession, type SessionConfig } from './session.ts';
export {
  PersistStore,
  emptyProgress,
  sessionKey,
  type AppSettings,
} from './persist.ts';
export {
  PHASE_BANDS,
  PLAYABLE_COUNTS,
  applyCompletion,
  buildPhaseTable,
  canPlayPieceCount,
  ensureProgress,
  isUnlocked,
  phaseById,
  pieceCountForPhase,
  practiceCounts,
} from './progression.ts';
export {
  eligiblePhases,
  pickRandomChallenge,
  rememberRandom,
} from './random-challenge.ts';
export { PuzzleRenderer, type PuzzleTestHook } from './renderer.ts';
export {
  MIN_PIECE_SCREEN_PX,
  fitCamera,
  screenToWorld,
  worldToScreen,
} from './camera.ts';
export { pathToSvg } from './path.ts';
export { beep } from './audio.ts';
