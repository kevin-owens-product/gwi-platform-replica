import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { mediaApi } from '@/api'
import type { TvStudyConfig, PrintRFConfig } from '@/api/types'

// --- TV Study hooks ---

export function useTvStudies() {
  return useQuery({
    queryKey: ['tv-studies'],
    queryFn: () => mediaApi.listTvStudies(),
  })
}

export function useTvStudy(id: string) {
  return useQuery({
    queryKey: ['tv-studies', id],
    queryFn: () => mediaApi.getTvStudy(id),
    enabled: !!id,
  })
}

export function useCreateTvStudy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: TvStudyConfig) => mediaApi.createTvStudy(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tv-studies'] })
    },
  })
}

export function useRunTvStudy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => mediaApi.runTvStudy(id),
    onSuccess: (study) => {
      queryClient.invalidateQueries({ queryKey: ['tv-studies'] })
      queryClient.setQueryData(['tv-studies', study.id], study)
    },
  })
}

export function useTvChannels() {
  return useQuery({
    queryKey: ['tv-channels'],
    queryFn: () => mediaApi.listTvChannels(),
  })
}

// --- Print R&F hooks ---

export function usePrintStudies() {
  return useQuery({
    queryKey: ['print-studies'],
    queryFn: () => mediaApi.listPrintStudies(),
  })
}

export function usePrintStudy(id: string) {
  return useQuery({
    queryKey: ['print-studies', id],
    queryFn: () => mediaApi.getPrintStudy(id),
    enabled: !!id,
  })
}

export function useCreatePrintStudy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: PrintRFConfig) => mediaApi.createPrintStudy(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-studies'] })
    },
  })
}

export function useRunPrintStudy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => mediaApi.runPrintStudy(id),
    onSuccess: (study) => {
      queryClient.invalidateQueries({ queryKey: ['print-studies'] })
      queryClient.setQueryData(['print-studies', study.id], study)
    },
  })
}

export function usePublications() {
  return useQuery({
    queryKey: ['publications'],
    queryFn: () => mediaApi.listPublications(),
  })
}
