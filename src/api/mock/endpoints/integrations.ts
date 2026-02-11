import type {
  IntegrationActivity,
  IntegrationAudienceSyncRequest,
  IntegrationCatalogItem,
  IntegrationConnection,
  IntegrationDeliveryRequest,
  IntegrationDeliveryResult,
} from '../../types'
import {
  mockIntegrationActivity,
  mockIntegrationCatalog,
  mockIntegrationConnections,
} from '../data/integrations'
import { delay, newId, now } from '../helpers'

const catalog = [...mockIntegrationCatalog]
const CONNECTIONS_STORAGE_KEY = 'gwi_mock_integrations_connections'
const ACTIVITY_STORAGE_KEY = 'gwi_mock_integrations_activity'

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors in mock mode
  }
}

const connections = readStored(CONNECTIONS_STORAGE_KEY, [...mockIntegrationConnections])
const activity = readStored(ACTIVITY_STORAGE_KEY, [...mockIntegrationActivity])

interface IntegrationConnectionFilter {
  capability?: IntegrationConnection['capabilities'][number]
}

export const integrationsApi = {
  async listCatalog(): Promise<IntegrationCatalogItem[]> {
    await delay()
    return catalog.map((item) => ({ ...item }))
  },

  async listConnections(filter?: IntegrationConnectionFilter): Promise<IntegrationConnection[]> {
    await delay()
    let result = [...connections]
    if (filter?.capability) {
      result = result.filter((conn) => conn.capabilities.includes(filter.capability!))
    }
    return result.map((conn) => ({ ...conn }))
  },

  async connect(input: {
    app_id: IntegrationCatalogItem['app_id']
    scope_type: IntegrationConnection['scope_type']
    workspace_id: string
    project_id?: string
    connected_by: string
  }): Promise<IntegrationConnection> {
    await delay(200)
    const app = catalog.find((item) => item.app_id === input.app_id)
    if (!app) throw new Error(`Unknown integration app: ${input.app_id}`)

    const existing = connections.find(
      (conn) =>
        conn.app_id === input.app_id &&
        conn.scope_type === input.scope_type &&
        conn.workspace_id === input.workspace_id &&
        conn.project_id === input.project_id
    )

    if (existing) {
      existing.status = 'connected'
      existing.connected_at = now()
      existing.connected_by = input.connected_by
      existing.last_error = undefined
      existing.last_tested_at = now()
      activity.unshift({
        id: newId('ia'),
        type: 'connect',
        app_id: existing.app_id,
        connection_id: existing.id,
        status: 'success',
        retries: 0,
        actor: input.connected_by,
        created_at: now(),
        details: `Reconnected ${app.name}.`,
      })
      writeStored(CONNECTIONS_STORAGE_KEY, connections)
      writeStored(ACTIVITY_STORAGE_KEY, activity)
      return { ...existing }
    }

    const next: IntegrationConnection = {
      id: newId('conn'),
      app_id: input.app_id,
      account: {
        id: newId('acct'),
        app_id: input.app_id,
        display_name: `${app.name} Account`,
      },
      scope_type: input.scope_type,
      workspace_id: input.workspace_id,
      project_id: input.project_id,
      status: 'connected',
      connected_by: input.connected_by,
      connected_at: now(),
      capabilities: [...app.capabilities],
      last_tested_at: now(),
    }

    connections.unshift(next)
    activity.unshift({
      id: newId('ia'),
      type: 'connect',
      app_id: next.app_id,
      connection_id: next.id,
      status: 'success',
      retries: 0,
      actor: input.connected_by,
      created_at: now(),
      details: `Connected ${app.name}.`,
    })
    writeStored(CONNECTIONS_STORAGE_KEY, connections)
    writeStored(ACTIVITY_STORAGE_KEY, activity)

    return { ...next }
  },

  async disconnect(input: {
    connection_id: string
    actor: string
  }): Promise<void> {
    await delay(120)
    const idx = connections.findIndex((conn) => conn.id === input.connection_id)
    if (idx === -1) return
    const conn = connections[idx]
    connections.splice(idx, 1)
    activity.unshift({
      id: newId('ia'),
      type: 'disconnect',
      app_id: conn.app_id,
      connection_id: conn.id,
      status: 'success',
      retries: 0,
      actor: input.actor,
      created_at: now(),
      details: `Disconnected ${conn.account.display_name}.`,
    })
    writeStored(CONNECTIONS_STORAGE_KEY, connections)
    writeStored(ACTIVITY_STORAGE_KEY, activity)
  },

  async testConnection(connection_id: string): Promise<{
    status: IntegrationConnection['status']
    tested_at: string
    error?: string
  }> {
    await delay(180)
    const conn = connections.find((item) => item.id === connection_id)
    if (!conn) throw new Error(`Connection ${connection_id} not found`)
    conn.last_tested_at = now()

    if (conn.status === 'error') {
      activity.unshift({
        id: newId('ia'),
        type: 'connection_test',
        app_id: conn.app_id,
        connection_id,
        status: 'failed',
        retries: 0,
        actor: 'System',
        created_at: now(),
        details: conn.last_error ?? 'Connection test failed.',
      })
      writeStored(ACTIVITY_STORAGE_KEY, activity)
      return {
        status: 'error',
        tested_at: conn.last_tested_at,
        error: conn.last_error ?? 'Connection test failed.',
      }
    }

    conn.status = 'connected'
    conn.last_error = undefined
    activity.unshift({
      id: newId('ia'),
      type: 'connection_test',
      app_id: conn.app_id,
      connection_id,
      status: 'success',
      retries: 0,
      actor: 'System',
      created_at: now(),
      details: 'Connection healthy.',
    })
    writeStored(CONNECTIONS_STORAGE_KEY, connections)
    writeStored(ACTIVITY_STORAGE_KEY, activity)
    return { status: conn.status, tested_at: conn.last_tested_at }
  },

  async deliver(input: IntegrationDeliveryRequest): Promise<IntegrationDeliveryResult> {
    await delay(220)
    const id = newId('delivery')
    const result: IntegrationDeliveryResult = {
      id,
      status: 'success',
      connection_ids: input.connection_ids,
      created_at: now(),
      completed_at: now(),
    }

    for (const connId of input.connection_ids) {
      const conn = connections.find((item) => item.id === connId)
      if (!conn) continue
      conn.last_synced_at = now()
      activity.unshift({
        id: newId('ia'),
        type: 'delivery',
        app_id: conn.app_id,
        connection_id: conn.id,
        status: 'success',
        retries: 0,
        actor: 'System',
        created_at: now(),
        details: `${input.source_type} delivery: ${input.summary.slice(0, 80)}`,
      })
    }
    writeStored(CONNECTIONS_STORAGE_KEY, connections)
    writeStored(ACTIVITY_STORAGE_KEY, activity)

    return result
  },

  async syncAudience(input: IntegrationAudienceSyncRequest): Promise<IntegrationDeliveryResult> {
    await delay(220)
    const conn = connections.find((item) => item.id === input.connection_id)
    if (!conn) throw new Error(`Connection ${input.connection_id} not found`)
    conn.last_synced_at = now()
    activity.unshift({
      id: newId('ia'),
      type: 'audience_sync',
      app_id: conn.app_id,
      connection_id: conn.id,
      status: 'success',
      retries: 0,
      actor: 'System',
      created_at: now(),
      details: `Audience ${input.audience_id} synced.`,
    })
    writeStored(CONNECTIONS_STORAGE_KEY, connections)
    writeStored(ACTIVITY_STORAGE_KEY, activity)
    return {
      id: newId('sync'),
      status: 'success',
      connection_ids: [conn.id],
      created_at: now(),
      completed_at: now(),
    }
  },

  async getDeliveryHistory(): Promise<IntegrationActivity[]> {
    await delay()
    return activity.map((entry) => ({ ...entry }))
  },
}
