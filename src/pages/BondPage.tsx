import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Stepper from '../components/Stepper'
import WizardLayout from '../components/WizardLayout'
import { useFormContext } from '../context/FormContext'
import { allBonds } from '../bonds/registry'

export default function BondPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { state, dispatch } = useFormContext()

  const bonds = allBonds()
  const canProceed = !!state.bondPattern && bonds.some((b) => b.id === state.bondPattern)

  const length = parseFloat(state.length) || 0
  const height = parseFloat(state.height) || 0

  const form = (
    <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
      <h1 className="text-2xl font-bold text-text mb-2">{t('bond.heading')}</h1>
      <p className="text-text-muted mb-8">{t('bond.description')}</p>

      <div className="space-y-3">
        {bonds.map((bond) => {
          const selected = state.bondPattern === bond.id
          return (
            <button
              key={bond.id}
              type="button"
              onClick={() =>
                dispatch({ type: 'SET_FIELD', field: 'bondPattern', value: bond.id })
              }
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors cursor-pointer text-left ${
                selected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-gray-300 hover:bg-surface-alt'
              }`}
            >
              <div
                className="w-16 h-8 rounded overflow-hidden flex-shrink-0 border border-border/50"
                dangerouslySetInnerHTML={{ __html: bond.iconSvg }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text">{t(bond.nameKey)}</div>
                <div className="text-xs text-text-muted mt-0.5">{t(bond.descKey)}</div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  selected ? 'border-primary' : 'border-gray-300'
                }`}
              >
                {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-text-muted mt-4 italic">{t('bond.comingSoon')}</p>

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
          onClick={() => navigate('/cost')}
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
  )

  return (
    <div className="flex flex-col items-center">
      <Stepper currentStep={2} />
      <WizardLayout
        form={form}
        lengthM={length}
        heightM={height}
        bondPattern={state.bondPattern}
        showDiagram={length > 0 && height > 0}
      />
    </div>
  )
}
