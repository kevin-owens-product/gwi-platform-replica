import type { PaginatedResponse } from '../types'

export function delay(ms: number = 80): Promise<void> {
  const jitter = Math.random() * 70 + 50
  return new Promise((r) => setTimeout(r, ms > 0 ? jitter : 0))
}

export function paginate<T extends { name?: string; title?: string; email?: string }>(
  items: T[],
  params: { page?: number; per_page?: number; search?: string } = {},
): PaginatedResponse<T> {
  const page = params.page ?? 1
  const perPage = params.per_page ?? 20
  let filtered = items

  if (params.search) {
    const q = params.search.toLowerCase()
    filtered = items.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.title && (item.title as string).toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)),
    )
  }

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage)

  return {
    data,
    meta: { total, page, per_page: perPage, total_pages: totalPages },
  }
}

let _counter = 1000
export function newId(prefix = 'mock'): string {
  return `${prefix}_${Date.now().toString(36)}_${(++_counter).toString(36)}`
}

export function now(): string {
  return new Date().toISOString()
}

export function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((i) => i.id === id)
}
