export type {
  Catalog,
  CatalogEntry,
  CatalogImage,
  Difficulty,
  LicenseMeta,
  LicenseType,
  StoryMeta,
  UnlockRule,
} from './schema.ts';
export { DIFFICULTIES, LICENSE_TYPES, PIECE_COUNTS, isPieceCount } from './schema.ts';
export {
  loadCatalogFile,
  validateCatalogJson,
  type ValidateOptions,
  type ValidationIssue,
  type ValidationResult,
} from './validate.ts';
