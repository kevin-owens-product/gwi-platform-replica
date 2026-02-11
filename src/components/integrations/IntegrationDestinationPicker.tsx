import { Loader2, Link2 } from 'lucide-react'
import { Badge } from '@/components/shared'
import { useIntegrationCatalog, useIntegrationConnections } from '@/hooks/useIntegrations'
import type { IntegrationCapability } from '@/api/types'
import './IntegrationDestinationPicker.css'

interface IntegrationDestinationPickerProps {
  capability: IntegrationCapability
  value: string[]
  onChange: (connectionIds: string[]) => void
  multiSelect?: boolean
  showOnlyConnected?: boolean
  title?: string
  emptyMessage?: string
}

export default function IntegrationDestinationPicker({
  capability,
  value,
  onChange,
  multiSelect = false,
  showOnlyConnected = true,
  title = 'Integration destinations',
  emptyMessage = 'No eligible integrations connected yet.',
}: IntegrationDestinationPickerProps) {
  const { data: catalog = [] } = useIntegrationCatalog()
  const { data: connections = [], isLoading } = useIntegrationConnections(capability)

  const filteredConnections = connections.filter((conn) =>
    showOnlyConnected ? conn.status === 'connected' : true
  )

  const toggleConnection = (connectionId: string) => {
    if (multiSelect) {
      const has = value.includes(connectionId)
      onChange(has ? value.filter((id) => id !== connectionId) : [...value, connectionId])
      return
    }
    onChange(value[0] === connectionId ? [] : [connectionId])
  }

  return (
    <div className="integration-destination-picker">
      <div className="integration-destination-picker__title">{title}</div>
      {isLoading ? (
        <div className="integration-destination-picker__loading">
          <Loader2 size={16} className="spin" />
          <span>Loading destinations...</span>
        </div>
      ) : filteredConnections.length === 0 ? (
        <div className="integration-destination-picker__empty">{emptyMessage}</div>
      ) : (
        <div className="integration-destination-picker__list">
          {filteredConnections.map((conn) => {
            const app = catalog.find((item) => item.app_id === conn.app_id)
            const selected = value.includes(conn.id)
            return (
              <button
                key={conn.id}
                className={`integration-destination-picker__item ${selected ? 'selected' : ''}`}
                onClick={() => toggleConnection(conn.id)}
                type="button"
              >
                <div className="integration-destination-picker__item-left">
                  <span className="integration-destination-picker__logo">{app?.logo_text ?? 'I'}</span>
                  <div className="integration-destination-picker__meta">
                    <strong>{app?.name ?? conn.app_id}</strong>
                    <span>{conn.account.display_name}</span>
                  </div>
                </div>
                <div className="integration-destination-picker__item-right">
                  <Badge variant={conn.status === 'connected' ? 'success' : conn.status === 'error' ? 'danger' : 'default'}>
                    {conn.status}
                  </Badge>
                  <span className="integration-destination-picker__scope">
                    <Link2 size={12} />
                    {conn.scope_type}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
