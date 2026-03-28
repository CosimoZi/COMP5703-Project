import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Stepper from '../components/Stepper'
import FenceDiagram from '../components/FenceDiagram'
import { useFormContext } from '../context/FormContext'

export default function BrickSizePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { state, dispatch } = useFormContext()

  const needsHeader = state.bondPattern === 'english' || state.bondPattern === 'flemish'

  const brickL = parseFloat(state.brickLength) || 0
  const brickH = parseFloat(state.brickHeight) || 0
  const headerW = parseFloat(state.headerWidth) || 0
  const canProceed = brickL > 0 && brickH > 0 && (!needsHeader || headerW > 0)

  const length = parseFloat(state.length) || 0
  const height = parseFloat(state.height) || 0

  return (
    <div className="flex flex-col items-center">
      <Stepper currentStep={3} />

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-border p-8">
        <h1 className="text-2xl font-bold text-text mb-2">
          {t('brickSize.heading')}
        </h1>
        <p className="text-text-muted mb-8">
          {t('brickSize.description')}
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              {t('brickSize.stretcherLength')} ({t('brickSize.unit')})
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={state.brickLength}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'brickLength', value: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              {t('brickSize.brickHeight')} ({t('brickSize.unit')})
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={state.brickHeight}
              onChange={(e) =>
                dispatch({ type: 'SET_FIELD', field: 'brickHeight', value: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-text"
            />
          </div>

          {needsHeader && (
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                {t('brickSize.headerWidth')} ({t('brickSize.unit')})
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={state.headerWidth}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'headerWidth', value: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-text"
              />
            </div>
          )}
        </div>

        {canProceed && length > 0 && height > 0 && state.bondPattern && (
          <div className="mt-8">
            <FenceDiagram
              lengthM={length}
              heightM={height}
              bondPattern={state.bondPattern}
              brickLengthCm={brickL}
              brickHeightCm={brickH}
              headerWidthCm={needsHeader ? headerW : undefined}
            />
          </div>
        )}

        <div className="flex justify-between mt-10">
          <button
            onClick={() => navigate('/bond')}
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
            {t('brickSize.calculate')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
