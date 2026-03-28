import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Stepper from '../components/Stepper'
import FenceDiagram from '../components/FenceDiagram'
import { useFormContext } from '../context/FormContext'

const BOND_OPTIONS = ['stretcher', 'english', 'flemish'] as const

const bondIcons: Record<string, React.ReactNode> = {
  stretcher: (
    <svg viewBox="0 0 80 40" className="w-full h-full">
      <rect width="80" height="40" fill="#d4d0c8" />
      <rect x="1" y="1" width="38" height="18" rx="1" fill="#c1440e" />
      <rect x="41" y="1" width="38" height="18" rx="1" fill="#c1440e" />
      <rect x="20" y="21" width="38" height="18" rx="1" fill="#c1440e" />
      <rect x="-18" y="21" width="36" height="18" rx="1" fill="#c1440e" />
      <rect x="60" y="21" width="19" height="18" rx="1" fill="#c1440e" />
    </svg>
  ),
  english: (
    <svg viewBox="0 0 80 40" className="w-full h-full">
      <rect width="80" height="40" fill="#d4d0c8" />
      <rect x="1" y="1" width="38" height="18" rx="1" fill="#c1440e" />
      <rect x="41" y="1" width="38" height="18" rx="1" fill="#c1440e" />
      <rect x="1" y="21" width="18" height="18" rx="1" fill="#c1440e" />
      <rect x="21" y="21" width="18" height="18" rx="1" fill="#c1440e" />
      <rect x="41" y="21" width="18" height="18" rx="1" fill="#c1440e" />
      <rect x="61" y="21" width="18" height="18" rx="1" fill="#c1440e" />
    </svg>
  ),
  flemish: (
    <svg viewBox="0 0 80 40" className="w-full h-full">
      <rect width="80" height="40" fill="#d4d0c8" />
      <rect x="1" y="1" width="36" height="18" rx="1" fill="#c1440e" />
      <rect x="39" y="1" width="18" height="18" rx="1" fill="#c1440e" />
      <rect x="59" y="1" width="20" height="18" rx="1" fill="#c1440e" />
      <rect x="1" y="21" width="18" height="18" rx="1" fill="#c1440e" />
      <rect x="21" y="21" width="36" height="18" rx="1" fill="#c1440e" />
      <rect x="59" y="21" width="18" height="18" rx="1" fill="#c1440e" />
    </svg>
  ),
}

export default function BondPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { state, dispatch } = useFormContext()

  const canProceed = !!state.bondPattern

  const length = parseFloat(state.length) || 0
  const height = parseFloat(state.height) || 0

  return (
    <div className="flex flex-col items-center">
      <Stepper currentStep={2} />

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-border p-8">
        <h1 className="text-2xl font-bold text-text mb-2">
          {t('bond.heading')}
        </h1>
        <p className="text-text-muted mb-8">
          {t('bond.description')}
        </p>

        <div className="space-y-3">
          {BOND_OPTIONS.map((bond) => (
            <button
              key={bond}
              type="button"
              onClick={() =>
                dispatch({ type: 'SET_FIELD', field: 'bondPattern', value: bond })
              }
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors cursor-pointer text-left ${
                state.bondPattern === bond
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-gray-300 hover:bg-surface-alt'
              }`}
            >
              <div className="w-16 h-8 rounded overflow-hidden flex-shrink-0 border border-border/50">
                {bondIcons[bond]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text">{t(`bond.${bond}`)}</div>
                <div className="text-xs text-text-muted mt-0.5">{t(`bond.${bond}Desc`)}</div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  state.bondPattern === bond
                    ? 'border-primary'
                    : 'border-gray-300'
                }`}
              >
                {state.bondPattern === bond && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
            </button>
          ))}
        </div>

        {canProceed && length > 0 && height > 0 && (
          <div className="mt-8">
            <FenceDiagram
              lengthM={length}
              heightM={height}
              bondPattern={state.bondPattern}
            />
          </div>
        )}

        <div className="flex justify-between mt-10">
          <button
            onClick={() => navigate('/dimensions')}
            className="inline-flex items-center gap-2 text-text-muted hover:text-text font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            {t('common.back')}
          </button>
          <button
            onClick={() => navigate('/brick-size')}
            disabled={!canProceed}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            {t('common.next')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
