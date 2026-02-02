import { useState } from 'react';
import { ChevronDown, Play, X } from 'lucide-react';
import './TvStudy.css';

const channels = [
  'BBC One', 'BBC Two', 'ITV', 'Channel 4', 'Channel 5',
  'Sky One', 'Sky Sports', 'Sky News', 'Dave', 'E4',
];

const audiences = [
  'Adults 16-64', 'Adults 18-34', 'Adults 25-54', 'Adults 35-64', 'All Adults 16+',
];

const countries = [
  'United Kingdom', 'United States', 'Germany', 'France', 'Spain',
  'Italy', 'Netherlands', 'Belgium', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Austria',
  'Switzerland', 'Ireland', 'Portugal', 'Greece', 'Romania',
  'Hungary', 'Turkey', 'Russia', 'Ukraine', 'Brazil',
  'Mexico', 'Argentina', 'Colombia', 'Chile', 'Peru',
  'Japan', 'South Korea', 'China', 'India', 'Australia',
  'New Zealand', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines',
  'Malaysia', 'Singapore', 'Saudi Arabia', 'UAE', 'Egypt',
  'South Africa', 'Nigeria', 'Kenya',
];

const generateWaves = () => {
  const waves = [];
  for (let y = 2025; y >= 2017; y--) {
    for (let q = 4; q >= 1; q--) {
      waves.push(`Q${q} ${y}`);
    }
  }
  return waves;
};
const waves = generateWaves();

const dayparts = [
  { name: 'Early Morning', time: '06:00 - 09:00' },
  { name: 'Daytime', time: '09:00 - 12:00' },
  { name: 'Afternoon', time: '12:00 - 15:00' },
  { name: 'Early Peak', time: '15:00 - 18:00' },
  { name: 'Peak', time: '18:00 - 21:00' },
  { name: 'Late Peak', time: '21:00 - 00:00' },
  { name: 'Nighttime', time: '00:00 - 06:00' },
];

export default function TvStudy() {
  const [selectedChannels, setSelectedChannels] = useState(['BBC One', 'ITV']);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState('Adults 16-64');
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('United Kingdom');
  const [countryOpen, setCountryOpen] = useState(false);
  const [timezone, setTimezone] = useState('local');
  const [selectedWaves, setSelectedWaves] = useState(['Q4 2025', 'Q3 2025', 'Q2 2025', 'Q1 2025']);
  const [wavesOpen, setWavesOpen] = useState(false);
  const [daypartSlots, setDaypartSlots] = useState(
    dayparts.map(() => ({ weekday: 1, weekend: 1 }))
  );
  const [showResults, setShowResults] = useState(false);

  const toggleChannel = (ch) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const toggleWave = (w) => {
    setSelectedWaves((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
    );
  };

  const updateSlot = (idx, field, value) => {
    setDaypartSlots((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: Math.max(0, parseInt(value) || 0) };
      return next;
    });
  };

  const results = [
    { label: 'Universe', value: '52,431,000' },
    { label: 'Sample Size', value: '12,847' },
    { label: 'Reach', value: '34,219,000' },
    { label: 'Avg Frequency', value: '4.7' },
    { label: 'Impacts', value: '160,829,300' },
    { label: 'Reach %', value: '65.3%' },
    { label: 'GRP', value: '306.8' },
  ];

  return (
    <div className="tv-study-page">
      <div className="tv-study-header">
        <h1 className="page-title">TV Reach & Frequency</h1>
      </div>

      <div className="tv-study-content">
        <div className="tv-study-config">
          <div className="tv-study-config-grid">
            {/* Channels */}
            <div className="tv-study-field">
              <label className="tv-study-label">Channels</label>
              <div className="tv-study-multiselect-wrapper">
                <button className="tv-study-select-btn" onClick={() => setChannelsOpen(!channelsOpen)}>
                  <span>{selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected</span>
                  <ChevronDown size={16} />
                </button>
                {channelsOpen && (
                  <div className="tv-study-dropdown">
                    {channels.map((ch) => (
                      <label key={ch} className="tv-study-dropdown-option">
                        <input
                          type="checkbox"
                          checked={selectedChannels.includes(ch)}
                          onChange={() => toggleChannel(ch)}
                        />
                        <span>{ch}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="tv-study-tags">
                {selectedChannels.map((ch) => (
                  <span key={ch} className="tv-study-tag">
                    {ch}
                    <button className="tv-study-tag-remove" onClick={() => toggleChannel(ch)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Audience */}
            <div className="tv-study-field">
              <label className="tv-study-label">Audience</label>
              <div className="tv-study-select-wrapper">
                <button className="tv-study-select-btn" onClick={() => setAudienceOpen(!audienceOpen)}>
                  <span>{selectedAudience}</span>
                  <ChevronDown size={16} />
                </button>
                {audienceOpen && (
                  <div className="tv-study-dropdown">
                    {audiences.map((a) => (
                      <button
                        key={a}
                        className={`tv-study-dropdown-item ${a === selectedAudience ? 'selected' : ''}`}
                        onClick={() => { setSelectedAudience(a); setAudienceOpen(false); }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="tv-study-field">
              <label className="tv-study-label">Location</label>
              <div className="tv-study-select-wrapper">
                <button className="tv-study-select-btn" onClick={() => setCountryOpen(!countryOpen)}>
                  <span>{selectedCountry}</span>
                  <ChevronDown size={16} />
                </button>
                {countryOpen && (
                  <div className="tv-study-dropdown tv-study-dropdown-tall">
                    {countries.map((c) => (
                      <button
                        key={c}
                        className={`tv-study-dropdown-item ${c === selectedCountry ? 'selected' : ''}`}
                        onClick={() => { setSelectedCountry(c); setCountryOpen(false); }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timezone */}
            <div className="tv-study-field">
              <label className="tv-study-label">Timezone</label>
              <div className="tv-study-toggle">
                <button
                  className={`tv-study-toggle-btn ${timezone === 'local' ? 'active' : ''}`}
                  onClick={() => setTimezone('local')}
                >
                  Local
                </button>
                <button
                  className={`tv-study-toggle-btn ${timezone === 'standardized' ? 'active' : ''}`}
                  onClick={() => setTimezone('standardized')}
                >
                  Standardized
                </button>
              </div>
            </div>

            {/* Waves */}
            <div className="tv-study-field tv-study-field-full">
              <label className="tv-study-label">
                Waves
                <span className="tv-study-label-hint">(min 4 required)</span>
              </label>
              <div className="tv-study-multiselect-wrapper">
                <button className="tv-study-select-btn" onClick={() => setWavesOpen(!wavesOpen)}>
                  <span>{selectedWaves.length} wave{selectedWaves.length !== 1 ? 's' : ''} selected</span>
                  <ChevronDown size={16} />
                </button>
                {wavesOpen && (
                  <div className="tv-study-dropdown tv-study-dropdown-tall">
                    {waves.map((w) => (
                      <label key={w} className="tv-study-dropdown-option">
                        <input
                          type="checkbox"
                          checked={selectedWaves.includes(w)}
                          onChange={() => toggleWave(w)}
                        />
                        <span>{w}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="tv-study-tags">
                {selectedWaves.map((w) => (
                  <span key={w} className="tv-study-tag">
                    {w}
                    <button className="tv-study-tag-remove" onClick={() => toggleWave(w)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Daypart Schedule */}
          <div className="tv-study-dayparts">
            <h3 className="tv-study-section-title">Daypart Schedule</h3>
            <table className="tv-study-daypart-table">
              <thead>
                <tr>
                  <th>Daypart</th>
                  <th>Time</th>
                  <th>Weekday Slots</th>
                  <th>Weekend Slots</th>
                </tr>
              </thead>
              <tbody>
                {dayparts.map((dp, idx) => (
                  <tr key={dp.name}>
                    <td className="tv-study-dp-name">{dp.name}</td>
                    <td className="tv-study-dp-time">{dp.time}</td>
                    <td>
                      <input
                        type="number"
                        className="tv-study-slot-input"
                        value={daypartSlots[idx].weekday}
                        onChange={(e) => updateSlot(idx, 'weekday', e.target.value)}
                        min="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="tv-study-slot-input"
                        value={daypartSlots[idx].weekend}
                        onChange={(e) => updateSlot(idx, 'weekend', e.target.value)}
                        min="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tv-study-actions">
            <button
              className="tv-study-run-btn"
              onClick={() => setShowResults(true)}
              disabled={selectedWaves.length < 4 || selectedChannels.length === 0}
            >
              <Play size={16} />
              <span>Run Study</span>
            </button>
          </div>
        </div>

        {showResults && (
          <div className="tv-study-results">
            <h3 className="tv-study-section-title">Results</h3>
            <div className="tv-study-results-grid">
              {results.map((r) => (
                <div key={r.label} className="tv-study-result-card">
                  <div className="tv-study-result-label">{r.label}</div>
                  <div className="tv-study-result-value">{r.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
