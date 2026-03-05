import { useMemo } from 'react';
import type { Wave } from '@/api/types';
import {
  getWaveCadenceLabel,
  getWavesForCadence,
  WAVE_CADENCE_OPTIONS,
  type WaveCadence,
} from '@/utils/waves';
import './WaveCadenceSwitcher.css';

interface WaveCadenceSwitcherProps {
  waves?: Wave[];
  cadence: WaveCadence;
  selectedWaveId: string;
  layout?: 'inline' | 'stacked';
  onCadenceChange: (cadence: WaveCadence) => void;
  onWaveChange: (waveId: string) => void;
}

export default function WaveCadenceSwitcher({
  waves,
  cadence,
  selectedWaveId,
  layout = 'inline',
  onCadenceChange,
  onWaveChange,
}: WaveCadenceSwitcherProps): React.JSX.Element {
  const options = useMemo(() => getWavesForCadence(waves ?? [], cadence), [waves, cadence]);
  const cadenceLabel = getWaveCadenceLabel(cadence);

  return (
    <div className={`wave-switcher ${layout === 'stacked' ? 'wave-switcher--stacked' : ''}`}>
      <div className="wave-switcher__cadence" role="tablist" aria-label="Wave cadence">
        {WAVE_CADENCE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={option.value === cadence}
            className={`wave-switcher__cadence-btn ${option.value === cadence ? 'active' : ''}`}
            onClick={() => onCadenceChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="wave-switcher__select-wrap">
        <span className="wave-switcher__select-label">{cadenceLabel} Wave</span>
        <select
          className="wave-switcher__select"
          value={selectedWaveId}
          onChange={(event) => onWaveChange(event.target.value)}
        >
          <option value="">All {cadenceLabel} waves</option>
          {options.map((wave) => (
            <option key={wave.id} value={wave.id}>
              {wave.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
