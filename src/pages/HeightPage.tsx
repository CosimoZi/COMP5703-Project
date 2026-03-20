import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Stepper from '../components/Stepper'
import { useFormContext } from '../context/FormContext'

const heightOptions = ['1.2', '1.5', '1.8', '2.0']

export default function HeightPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { state, dispatch } = useFormContext()

  const canProceed = !!state.height

  return (
    <div className="flex flex-col items-center">
      <Stepper currentStep={2} />

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-border p-8">
        <h1 className="text-2xl font-bold text-text mb-2">
          {t('height.heading')}
        </h1>
        <p className="text-text-muted mb-8">
          {t('height.description')}
        </p>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            {t('height.label')} ({t('height.unit')})
          </label>
          <select
            value={state.height}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', field: 'height', value: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-text appearance-none cursor-pointer"
          >
            <option value="">{t('height.placeholder')}</option>
            {heightOptions.map((h) => (
              <option key={h} value={h}>
                {h} {t('height.unit')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between mt-10">
          <button
            onClick={() => navigate('/length')}
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
            {t('height.calculate')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
