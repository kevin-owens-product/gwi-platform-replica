import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WaveId, Location } from '@/api/types'

interface WorkspaceState {
  selectedWaveIds: WaveId[]
  selectedLocationIds: string[]
  selectedLocations: Location[]
  projectId: string | null

  setWaveIds: (waveIds: WaveId[]) => void
  setLocationIds: (locationIds: string[]) => void
  setSelectedLocations: (locations: Location[]) => void
  setProjectId: (projectId: string | null) => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      selectedWaveIds: [],
      selectedLocationIds: [],
      selectedLocations: [],
      projectId: null,

      setWaveIds: (selectedWaveIds) => set({ selectedWaveIds }),
      setLocationIds: (selectedLocationIds) => set({ selectedLocationIds }),
      setSelectedLocations: (selectedLocations) => set({ selectedLocations }),
      setProjectId: (projectId) => set({ projectId }),
    }),
    {
      name: 'gwi-workspace',
    }
  )
)
