import type { HelpLimits, HelpPresetName, HelpUsage } from './types.ts';

export const HELP_PRESETS: Record<HelpPresetName, HelpLimits> = {
  casual: {
    peekImage: Number.POSITIVE_INFINITY,
    highlight: 5,
    separateEdges: 3,
    shuffle: Number.POSITIVE_INFINITY,
  },
  desafio: {
    peekImage: 1,
    highlight: 1,
    separateEdges: 1,
    shuffle: 1,
  },
};

export function emptyHelpUsage(): HelpUsage {
  return {
    peekImage: 0,
    highlight: 0,
    separateEdges: 0,
    shuffle: 0,
  };
}

export function remainingHelp(limits: HelpLimits, used: HelpUsage): HelpLimits {
  return {
    peekImage: Math.max(0, limits.peekImage - used.peekImage),
    highlight: Math.max(0, limits.highlight - used.highlight),
    separateEdges: Math.max(0, limits.separateEdges - used.separateEdges),
    shuffle: Math.max(0, limits.shuffle - used.shuffle),
  };
}

export function canUseHelp(limits: HelpLimits, used: HelpUsage, key: keyof HelpUsage): boolean {
  return used[key] < limits[key];
}

export function formatHelpLimit(value: number): string {
  if (!Number.isFinite(value)) {
    return 'ilimitado';
  }
  return String(value);
}

export function formatHelpBadge(value: number): string {
  if (!Number.isFinite(value)) {
    return '∞';
  }
  return String(value);
}
