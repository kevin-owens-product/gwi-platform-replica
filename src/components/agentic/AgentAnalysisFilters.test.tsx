import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AgentAnalysisFilters from './AgentAnalysisFilters'
import type { AgentAnalysisConfig } from '@/api/types'

function defaultProps(overrides: Partial<{
  config: AgentAnalysisConfig
  hasActiveFilters: boolean
}> = {}) {
  return {
    config: overrides.config ?? {},
    onTimeframeChange: vi.fn(),
    onGranularityChange: vi.fn(),
    onRebaseModeChange: vi.fn(),
    onAddWave: vi.fn(),
    onRemoveWave: vi.fn(),
    onCompareWavesChange: vi.fn(),
    onReset: vi.fn(),
    hasActiveFilters: overrides.hasActiveFilters ?? false,
  }
}

describe('AgentAnalysisFilters', () => {
  it('renders the filters section', () => {
    const props = defaultProps()
    render(<AgentAnalysisFilters {...props} />)
    expect(screen.getByTestId('agent-analysis-filters')).toBeInTheDocument()
    expect(screen.getByText('Analysis Filters')).toBeInTheDocument()
    expect(screen.getByText('Configure timeframe, granularity, and rebasing for your analysis.')).toBeInTheDocument()
  })

  it('renders all filter controls', () => {
    const props = defaultProps()
    render(<AgentAnalysisFilters {...props} />)
    expect(screen.getByTestId('agent-filter-timeframe')).toBeInTheDocument()
    expect(screen.getByTestId('agent-filter-granularity')).toBeInTheDocument()
    expect(screen.getByTestId('agent-filter-rebase')).toBeInTheDocument()
    expect(screen.getByTestId('agent-filter-waves')).toBeInTheDocument()
  })

  it('shows "None" as default for all dropdowns', () => {
    const props = defaultProps()
    render(<AgentAnalysisFilters {...props} />)

    const buttons = screen.getAllByRole('button')
    const noneButtons = buttons.filter((btn) => btn.textContent?.includes('None'))
    // Timeframe, Granularity, and Rebase should all show "None"
    expect(noneButtons.length).toBeGreaterThanOrEqual(3)
  })

  it('displays selected timeframe value', () => {
    const props = defaultProps({ config: { timeframe: 'monthly' } })
    render(<AgentAnalysisFilters {...props} />)
    expect(screen.getByText('Monthly')).toBeInTheDocument()
  })

  it('displays selected granularity value', () => {
    const props = defaultProps({ config: { granularity: 'question' } })
    render(<AgentAnalysisFilters {...props} />)
    expect(screen.getByText('Question level')).toBeInTheDocument()
  })

  it('displays selected rebase value', () => {
    const props = defaultProps({ config: { rebase_mode: 'row' } })
    render(<AgentAnalysisFilters {...props} />)
    expect(screen.getByText('Row %')).toBeInTheDocument()
  })

  it('shows "No waves selected" when no waves', () => {
    const props = defaultProps()
    render(<AgentAnalysisFilters {...props} />)
    expect(screen.getByText('No waves selected')).toBeInTheDocument()
  })

  it('shows wave pills when waves are selected', () => {
    const props = defaultProps({
      config: { wave_ids: ['wave_2024q4', 'wave_2024q3'] },
    })
    render(<AgentAnalysisFilters {...props} />)
    expect(screen.getByText('Q4 2024')).toBeInTheDocument()
    expect(screen.getByText('Q3 2024')).toBeInTheDocument()
    expect(screen.queryByText('No waves selected')).not.toBeInTheDocument()
  })

  it('shows Reset button only when hasActiveFilters is true', () => {
    const { rerender } = render(<AgentAnalysisFilters {...defaultProps({ hasActiveFilters: false })} />)
    expect(screen.queryByTestId('agent-filters-reset')).not.toBeInTheDocument()

    rerender(<AgentAnalysisFilters {...defaultProps({ hasActiveFilters: true })} />)
    expect(screen.getByTestId('agent-filters-reset')).toBeInTheDocument()
  })

  it('calls onReset when Reset button is clicked', async () => {
    const user = userEvent.setup()
    const props = defaultProps({ hasActiveFilters: true })
    render(<AgentAnalysisFilters {...props} />)

    await user.click(screen.getByTestId('agent-filters-reset'))
    expect(props.onReset).toHaveBeenCalledOnce()
  })

  it('calls onTimeframeChange when timeframe dropdown option is selected', async () => {
    const user = userEvent.setup()
    const props = defaultProps()
    render(<AgentAnalysisFilters {...props} />)

    // Click the timeframe dropdown trigger
    const timeframeControl = screen.getByTestId('agent-filter-timeframe')
    const trigger = timeframeControl.querySelector('.agent-filters__control-select')!
    await user.click(trigger)

    // Select "Monthly"
    await user.click(screen.getByText('Monthly'))
    expect(props.onTimeframeChange).toHaveBeenCalledWith('monthly')
  })

  it('calls onTimeframeChange with undefined when "None" is selected', async () => {
    const user = userEvent.setup()
    const props = defaultProps({ config: { timeframe: 'monthly' } })
    render(<AgentAnalysisFilters {...props} />)

    const timeframeControl = screen.getByTestId('agent-filter-timeframe')
    const trigger = timeframeControl.querySelector('.agent-filters__control-select')!
    await user.click(trigger)

    // The "None" option in the dropdown menu
    const noneOptions = screen.getAllByText('None')
    // Click the dropdown menu item (not the trigger label)
    const menuItem = noneOptions.find((el) => el.closest('.dropdown__item'))
    if (menuItem) {
      await user.click(menuItem)
      expect(props.onTimeframeChange).toHaveBeenCalledWith(undefined)
    }
  })

  it('calls onGranularityChange when granularity dropdown option is selected', async () => {
    const user = userEvent.setup()
    const props = defaultProps()
    render(<AgentAnalysisFilters {...props} />)

    const granControl = screen.getByTestId('agent-filter-granularity')
    const trigger = granControl.querySelector('.agent-filters__control-select')!
    await user.click(trigger)

    await user.click(screen.getByText('Datapoint level'))
    expect(props.onGranularityChange).toHaveBeenCalledWith('datapoint')
  })

  it('calls onRebaseModeChange when rebase dropdown option is selected', async () => {
    const user = userEvent.setup()
    const props = defaultProps()
    render(<AgentAnalysisFilters {...props} />)

    const rebaseControl = screen.getByTestId('agent-filter-rebase')
    const trigger = rebaseControl.querySelector('.agent-filters__control-select')!
    await user.click(trigger)

    await user.click(screen.getByText('Total %'))
    expect(props.onRebaseModeChange).toHaveBeenCalledWith('total')
  })

  it('calls onRemoveWave when wave pill remove button is clicked', async () => {
    const user = userEvent.setup()
    const props = defaultProps({
      config: { wave_ids: ['wave_2024q4'] },
    })
    render(<AgentAnalysisFilters {...props} />)

    const removeBtn = screen.getByLabelText('Remove Q4 2024')
    await user.click(removeBtn)
    expect(props.onRemoveWave).toHaveBeenCalledWith('wave_2024q4')
  })

  it('calls onAddWave when a wave is selected from the add dropdown', async () => {
    const user = userEvent.setup()
    const props = defaultProps()
    render(<AgentAnalysisFilters {...props} />)

    await user.click(screen.getByText('+ Add wave'))
    await user.click(screen.getByText('Q4 2024'))
    expect(props.onAddWave).toHaveBeenCalledWith('wave_2024q4')
  })

  it('does not show compare waves toggle with fewer than 2 waves', () => {
    const props = defaultProps({
      config: { wave_ids: ['wave_2024q4'] },
    })
    render(<AgentAnalysisFilters {...props} />)
    expect(screen.queryByTestId('agent-filter-compare-waves')).not.toBeInTheDocument()
  })

  it('shows compare waves toggle when 2+ waves are selected', () => {
    const props = defaultProps({
      config: { wave_ids: ['wave_2024q4', 'wave_2024q3'] },
    })
    render(<AgentAnalysisFilters {...props} />)
    expect(screen.getByTestId('agent-filter-compare-waves')).toBeInTheDocument()
  })

  it('calls onCompareWavesChange when compare waves toggle is clicked', async () => {
    const user = userEvent.setup()
    const props = defaultProps({
      config: { wave_ids: ['wave_2024q4', 'wave_2024q3'], compare_waves: false },
    })
    render(<AgentAnalysisFilters {...props} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    expect(props.onCompareWavesChange).toHaveBeenCalledWith(true)
  })

  it('hides already-selected waves from the add dropdown', async () => {
    const user = userEvent.setup()
    const props = defaultProps({
      config: { wave_ids: ['wave_2024q4'] },
    })
    render(<AgentAnalysisFilters {...props} />)

    await user.click(screen.getByText('+ Add wave'))
    // Q4 2024 should NOT appear in dropdown since it's already selected
    // It will appear as a pill but not as a dropdown menu item
    const dropdownItems = document.querySelectorAll('.dropdown__item')
    const itemTexts = Array.from(dropdownItems).map((el) => el.textContent)
    expect(itemTexts).not.toContain('Q4 2024')
    expect(itemTexts).toContain('Q3 2024')
  })
})
