import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WaveId, Location } from '@/api/types'

interface CanvasWorkflowState {
  currentStep: number
  completedSteps: number[]
  objectives: string[]
  selectedMarkets: string[]
  selectedTimePeriod: string | null
}

interface RecentItem {
  id: string
  type: 'chart' | 'crosstab' | 'audience' | 'dashboard' | 'report' | 'canvas' | 'tv_study' | 'print_rf'
  name: string
  timestamp: string
}

interface FavoriteItem {
  id: string
  type: string
  name: string
}

interface WorkspaceState {
  selectedWaveIds: WaveId[]
  selectedLocationIds: string[]
  selectedLocations: Location[]
  projectId: string | null
  canvasGoals: string[]

  // Canvas workflow
  canvasWorkflow: CanvasWorkflowState

  // Recent items
  recentItems: RecentItem[]

  // Favorites
  favorites: FavoriteItem[]

  // Active context for Agent Spark
  activeContext: {
    type: 'chart' | 'crosstab' | 'audience' | 'dashboard' | 'report' | 'canvas' | null
    id: string | null
    name: string | null
  }

  // Default settings
  defaultMetric: string
  defaultDataset: string
  defaultWave: string | null

  // Clipboard for cross-tool operations
  clipboard: {
    type: 'questions' | 'audiences' | 'datapoints' | null
    items: string[]
  }

  // Actions
  setWaveIds: (waveIds: WaveId[]) => void
  setLocationIds: (locationIds: string[]) => void
  setSelectedLocations: (locations: Location[]) => void
  setProjectId: (projectId: string | null) => void
  setCanvasGoals: (goals: string[]) => void
  setCanvasStep: (step: number) => void
  completeCanvasStep: (step: number) => void
  setCanvasObjectives: (objectives: string[]) => void
  setCanvasMarkets: (markets: string[]) => void
  setCanvasTimePeriod: (period: string | null) => void
  resetCanvasWorkflow: () => void
  addRecentItem: (item: RecentItem) => void
  clearRecentItems: () => void
  toggleFavorite: (item: FavoriteItem) => void
  setActiveContext: (type: WorkspaceState['activeContext']['type'], id: string | null, name: string | null) => void
  clearActiveContext: () => void
  setDefaultMetric: (metric: string) => void
  setDefaultDataset: (dataset: string) => void
  setDefaultWave: (wave: string | null) => void
  setClipboard: (type: WorkspaceState['clipboard']['type'], items: string[]) => void
  clearClipboard: () => void
}

const defaultCanvasWorkflow: CanvasWorkflowState = {
  currentStep: 0,
  completedSteps: [],
  objectives: [],
  selectedMarkets: [],
  selectedTimePeriod: null,
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      selectedWaveIds: [],
      selectedLocationIds: [],
      selectedLocations: [],
      projectId: null,
      canvasGoals: [],
      canvasWorkflow: { ...defaultCanvasWorkflow },
      recentItems: [],
      favorites: [],
      activeContext: { type: null, id: null, name: null },
      defaultMetric: 'audience_percentage',
      defaultDataset: 'gwi-core',
      defaultWave: null,
      clipboard: { type: null, items: [] },

      setWaveIds: (selectedWaveIds) => set({ selectedWaveIds }),
      setLocationIds: (selectedLocationIds) => set({ selectedLocationIds }),
      setSelectedLocations: (selectedLocations) => set({ selectedLocations }),
      setProjectId: (projectId) => set({ projectId }),
      setCanvasGoals: (canvasGoals) => set({ canvasGoals }),

      setCanvasStep: (step) =>
        set((state) => ({
          canvasWorkflow: { ...state.canvasWorkflow, currentStep: step },
        })),

      completeCanvasStep: (step) =>
        set((state) => ({
          canvasWorkflow: {
            ...state.canvasWorkflow,
            completedSteps: state.canvasWorkflow.completedSteps.includes(step)
              ? state.canvasWorkflow.completedSteps
              : [...state.canvasWorkflow.completedSteps, step],
          },
        })),

      setCanvasObjectives: (objectives) =>
        set((state) => ({
          canvasWorkflow: { ...state.canvasWorkflow, objectives },
        })),

      setCanvasMarkets: (markets) =>
        set((state) => ({
          canvasWorkflow: { ...state.canvasWorkflow, selectedMarkets: markets },
        })),

      setCanvasTimePeriod: (period) =>
        set((state) => ({
          canvasWorkflow: { ...state.canvasWorkflow, selectedTimePeriod: period },
        })),

      resetCanvasWorkflow: () =>
        set({ canvasWorkflow: { ...defaultCanvasWorkflow } }),

      addRecentItem: (item) =>
        set((state) => ({
          recentItems: [
            item,
            ...state.recentItems.filter((r) => r.id !== item.id),
          ].slice(0, 20),
        })),

      clearRecentItems: () => set({ recentItems: [] }),

      toggleFavorite: (item) =>
        set((state) => ({
          favorites: state.favorites.some((f) => f.id === item.id)
            ? state.favorites.filter((f) => f.id !== item.id)
            : [...state.favorites, item],
        })),

      setActiveContext: (type, id, name) =>
        set({ activeContext: { type, id, name } }),

      clearActiveContext: () =>
        set({ activeContext: { type: null, id: null, name: null } }),

      setDefaultMetric: (defaultMetric) => set({ defaultMetric }),
      setDefaultDataset: (defaultDataset) => set({ defaultDataset }),
      setDefaultWave: (defaultWave) => set({ defaultWave }),

      setClipboard: (type, items) => set({ clipboard: { type, items } }),
      clearClipboard: () => set({ clipboard: { type: null, items: [] } }),
    }),
    {
      name: 'gwi-workspace',
      partialize: (state) => ({
        selectedWaveIds: state.selectedWaveIds,
        selectedLocationIds: state.selectedLocationIds,
        projectId: state.projectId,
        canvasGoals: state.canvasGoals,
        recentItems: state.recentItems,
        favorites: state.favorites,
        defaultMetric: state.defaultMetric,
        defaultDataset: state.defaultDataset,
        defaultWave: state.defaultWave,
      }),
    }
  )
)
