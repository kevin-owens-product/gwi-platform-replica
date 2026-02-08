import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeMode = 'light' | 'dark' | 'system'
type ColorScheme = 'default' | 'colorblind_safe' | 'high_contrast' | 'monochrome'

interface NotificationPrefs {
  enabled: boolean
  sound: boolean
  desktop: boolean
  email_digest: 'none' | 'daily' | 'weekly'
}

interface UIState {
  sidebarCollapsed: boolean
  searchOpen: boolean
  theme: 'light' | 'dark'
  themeMode: ThemeMode
  colorScheme: ColorScheme
  reduceMotion: boolean
  compactMode: boolean
  showBreadcrumbs: boolean
  recentSearches: string[]
  notifications: NotificationPrefs
  commandPaletteOpen: boolean
  activePanel: string | null
  pinnedTools: string[]

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSearchOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setThemeMode: (mode: ThemeMode) => void
  setColorScheme: (scheme: ColorScheme) => void
  setReduceMotion: (reduce: boolean) => void
  setCompactMode: (compact: boolean) => void
  setShowBreadcrumbs: (show: boolean) => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  setNotifications: (prefs: Partial<NotificationPrefs>) => void
  setCommandPaletteOpen: (open: boolean) => void
  setActivePanel: (panel: string | null) => void
  togglePinnedTool: (toolId: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      searchOpen: false,
      theme: 'light',
      themeMode: 'system',
      colorScheme: 'default',
      reduceMotion: false,
      compactMode: false,
      showBreadcrumbs: true,
      recentSearches: [],
      notifications: {
        enabled: true,
        sound: false,
        desktop: false,
        email_digest: 'none',
      },
      commandPaletteOpen: false,
      activePanel: null,
      pinnedTools: [],

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      setSearchOpen: (open) =>
        set({ searchOpen: open }),

      setTheme: (theme) =>
        set({ theme }),

      setThemeMode: (mode) =>
        set({
          themeMode: mode,
          theme: mode === 'system'
            ? (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : mode,
        }),

      setColorScheme: (colorScheme) =>
        set({ colorScheme }),

      setReduceMotion: (reduceMotion) =>
        set({ reduceMotion }),

      setCompactMode: (compactMode) =>
        set({ compactMode }),

      setShowBreadcrumbs: (showBreadcrumbs) =>
        set({ showBreadcrumbs }),

      addRecentSearch: (query) =>
        set((state) => ({
          recentSearches: [
            query,
            ...state.recentSearches.filter((s) => s !== query),
          ].slice(0, 10),
        })),

      clearRecentSearches: () =>
        set({ recentSearches: [] }),

      setNotifications: (prefs) =>
        set((state) => ({
          notifications: { ...state.notifications, ...prefs },
        })),

      setCommandPaletteOpen: (open) =>
        set({ commandPaletteOpen: open }),

      setActivePanel: (panel) =>
        set({ activePanel: panel }),

      togglePinnedTool: (toolId) =>
        set((state) => ({
          pinnedTools: state.pinnedTools.includes(toolId)
            ? state.pinnedTools.filter((t) => t !== toolId)
            : [...state.pinnedTools, toolId],
        })),
    }),
    {
      name: 'gwi-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        themeMode: state.themeMode,
        colorScheme: state.colorScheme,
        reduceMotion: state.reduceMotion,
        compactMode: state.compactMode,
        showBreadcrumbs: state.showBreadcrumbs,
        recentSearches: state.recentSearches,
        notifications: state.notifications,
        pinnedTools: state.pinnedTools,
      }),
    }
  )
)
