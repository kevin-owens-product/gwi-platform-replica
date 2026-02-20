import type { Audience } from '@/api/types'

interface InsightsSegmentPaneProps {
  segmentName: string
  onSegmentNameChange: (value: string) => void
  selectedAudienceId: string
  onSelectedAudienceChange: (value: string) => void
  availableAudiences: Audience[]
}

export default function InsightsSegmentPane({
  segmentName,
  onSegmentNameChange,
  selectedAudienceId,
  onSelectedAudienceChange,
  availableAudiences,
}: InsightsSegmentPaneProps): React.JSX.Element {
  const selectedAudience = availableAudiences.find((audience) => audience.id === selectedAudienceId)

  return (
    <section className="ins-pane">
      <header className="ins-pane__header">
        <h2>Segment</h2>
        <span>{selectedAudience ? 'Linked to audience' : 'Draft'}</span>
      </header>

      <label className="ins-field">
        <span>Segment name</span>
        <input
          type="text"
          value={segmentName}
          onChange={(event) => onSegmentNameChange(event.target.value)}
          placeholder="Untitled segment"
        />
      </label>

      <label className="ins-field">
        <span>Base audience (optional)</span>
        <select
          value={selectedAudienceId}
          onChange={(event) => onSelectedAudienceChange(event.target.value)}
        >
          <option value="">All adults</option>
          {availableAudiences.map((audience) => (
            <option key={audience.id} value={audience.id}>
              {audience.name}
            </option>
          ))}
        </select>
      </label>

      {selectedAudience && (
        <div className="ins-note">
          <strong>{selectedAudience.name}</strong>
          <p>{selectedAudience.description ?? 'No description available.'}</p>
        </div>
      )}
    </section>
  )
}
