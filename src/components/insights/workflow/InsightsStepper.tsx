import { CheckCircle2, Circle } from 'lucide-react'
import type { InsightStudioStep } from '@/api/types'
import { INSIGHT_STUDIO_STEPS } from '@/features/insights/defaults'
import type { InsightStepValidationMap } from '@/features/insights/validation'

const STEP_LABELS: Record<InsightStudioStep, string> = {
  define: 'Define',
  query: 'Query',
  compare: 'Compare',
  publish: 'Publish',
}

interface InsightsStepperProps {
  currentStep: InsightStudioStep
  validations: InsightStepValidationMap
  onStepClick: (step: InsightStudioStep) => void
}

export default function InsightsStepper({ currentStep, validations, onStepClick }: InsightsStepperProps): React.JSX.Element {
  return (
    <nav className="ins-stepper" aria-label="Insights workflow">
      {INSIGHT_STUDIO_STEPS.map((step) => {
        const isActive = step === currentStep
        const isValid = validations[step].valid

        return (
          <button
            key={step}
            type="button"
            className={`ins-stepper__step ${isActive ? 'active' : ''}`}
            onClick={() => onStepClick(step)}
          >
            <span className="ins-stepper__icon">
              {isValid ? <CheckCircle2 size={14} /> : <Circle size={14} />}
            </span>
            <span>{STEP_LABELS[step]}</span>
          </button>
        )
      })}
    </nav>
  )
}
