import type { Wave } from '@/api/types';

export type WaveCadence = 'weekly' | 'monthly' | 'quarterly';

export const WAVE_CADENCE_OPTIONS: Array<{ label: string; value: WaveCadence }> = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
];

const MONTH_NAME_PATTERN = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|month)\b/i;
const QUARTER_PATTERN = /\b(q[1-4]|quarter)\b/i;
const WEEK_PATTERN = /\b(wk|week)\b/i;

function getWaveSpanInDays(wave: Wave): number | undefined {
  const start = Date.parse(wave.start_date);
  const end = Date.parse(wave.end_date);
  if (Number.isNaN(start) || Number.isNaN(end)) return undefined;
  const diff = end - start;
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

export function getWaveCadence(wave: Wave): WaveCadence {
  const name = wave.name.toLowerCase();

  if (wave.quarter || QUARTER_PATTERN.test(name)) return 'quarterly';
  if (WEEK_PATTERN.test(name)) return 'weekly';
  if (MONTH_NAME_PATTERN.test(name)) return 'monthly';

  const spanDays = getWaveSpanInDays(wave);
  if (spanDays != null) {
    if (spanDays <= 14) return 'weekly';
    if (spanDays <= 62) return 'monthly';
  }

  return 'quarterly';
}

export function sortWavesNewestFirst(waves: Wave[]): Wave[] {
  return [...waves].sort((a, b) => {
    const endA = Date.parse(a.end_date);
    const endB = Date.parse(b.end_date);
    if (!Number.isNaN(endA) && !Number.isNaN(endB) && endA !== endB) {
      return endB - endA;
    }
    const startA = Date.parse(a.start_date);
    const startB = Date.parse(b.start_date);
    if (!Number.isNaN(startA) && !Number.isNaN(startB) && startA !== startB) {
      return startB - startA;
    }
    return b.year - a.year;
  });
}

export function getWavesForCadence(waves: Wave[], cadence: WaveCadence): Wave[] {
  const sorted = sortWavesNewestFirst(waves);
  const filtered = sorted.filter((wave) => getWaveCadence(wave) === cadence);
  // Fallback to all waves so switchers remain functional even when a cadence has sparse mock data.
  return filtered.length > 0 ? filtered : sorted;
}

export function getWaveCadenceLabel(cadence: WaveCadence): string {
  switch (cadence) {
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    default:
      return 'Quarterly';
  }
}
