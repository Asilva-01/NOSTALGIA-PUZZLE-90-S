export { PIECE_COUNTS, TAB_PROFILES, type PieceCount, type TabProfile } from './types.ts';
export type {
  CameraState,
  DropResult,
  EdgeKind,
  HelpLimits,
  HelpPresetName,
  HelpUsage,
  PartialPeekState,
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
  edgeSignature,
  generatePuzzle,
  pieceAt,
  shapedEdgeCommands,
} from './geometry.ts';
export { fisherYates, scatterPieces, separateEdgePieces } from './shuffle.ts';
export { computeScore, computeStars } from './score.ts';
export {
  CHALLENGE_LIMIT_MS_PER_PIECE,
  STAR_PAR_MS_PER_PIECE,
  challengeTimeLimitMs,
  isChallengeTimedOut,
  remainingChallengeMs,
} from './challenge.ts';
export {
  HELP_PRESETS,
  canUseHelp,
  countHintUses,
  emptyHelpUsage,
  formatHelpBadge,
  formatHelpLimit,
  normalizeHelpUsage,
  remainingHelp,
} from './help.ts';
export { PuzzleSession, type SessionConfig } from './session.ts';
export {
  DEFAULT_SETTINGS,
  PersistStore,
  emptyProgress,
  normalizeSettings,
  sessionKey,
  withSoundEnabled,
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
  nextPlayablePhase,
  nextPracticeCount,
  phaseById,
  pieceCountForPhase,
  practiceCounts,
} from './progression.ts';
export {
  currentPlayerLevel,
  difficultyForPieceCount,
  eligiblePhases,
  pickRandomChallenge,
  pickSurpriseChallenge,
  rememberRandom,
  type SurpriseMeta,
} from './random-challenge.ts';
export { PuzzleRenderer, type PuzzleTestHook } from './renderer.ts';
export {
  MIN_PIECE_SCREEN_PX,
  clampCameraToWorld,
  fitCamera,
  screenToWorld,
  worldToScreen,
} from './camera.ts';
export { pathToSvg } from './path.ts';
export {
  beep,
  getSfxTheme,
  playSfx,
  setSfxTheme,
  sfxVoices,
  silenceAudio,
  unlockAudio,
  type SfxKind,
  type SfxTheme,
  type SfxVoice,
} from './audio.ts';
export {
  MAX_START_OVERLAP,
  contentsWorld,
  fitPlayCamera,
  fitWorldInView,
  layoutPlayfield,
  pieceScreenRect,
  rectsOverlapRatio,
} from './playfield.ts';
export {
  alignmentError,
  areGridNeighbors,
  groupMembers,
} from './groups.ts';
