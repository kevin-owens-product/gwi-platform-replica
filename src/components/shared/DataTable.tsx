import { type ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import './DataTable.css'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (key: string) => void
  onRowClick?: (item: T) => void
  emptyMessage?: string
  loading?: boolean
}

export default function DataTable<T>({
  columns,
  data,
  keyField,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  emptyMessage = 'No data found',
  loading,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="data-table__loading">
        <div className="data-table__spinner" />
      </div>
    )
  }

  return (
    <div className="data-table__wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={col.sortable ? 'data-table__th--sortable' : ''}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              >
                <span className="data-table__th-content">
                  {col.header}
                  {col.sortable && sortBy === col.key && (
                    <span className="data-table__sort-icon">
                      {sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={String(item[keyField])}
                className={onRowClick ? 'data-table__row--clickable' : ''}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
