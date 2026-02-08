import type { ReactNode } from 'react'
import './Tabs.css'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  orientation?: 'horizontal' | 'vertical'
}

export default function Tabs({ tabs, activeTab, onChange, orientation = 'horizontal' }: TabsProps) {
  return (
    <div className={`tabs ${orientation === 'vertical' ? 'tabs--vertical' : ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tabs__tab ${activeTab === tab.id ? 'tabs__tab--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span className="tabs__icon">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className="tabs__count">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
