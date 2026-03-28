import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Stepper from '../components/Stepper'
import FenceDiagram from '../components/FenceDiagram'
import { useFormContext } from '../context/FormContext'

const UNIT_PRICE = 50

interface SavedQuote {
  id: string
  name: string
  date: string
  length: string
  height: string
  bondPattern: string
  brickLength: string
  brickHeight: string
  headerWidth: string
  totalCost: number
}

function upsertQuote(quote: SavedQuote) {
  try {
    const existing: SavedQuote[] = JSON.parse(
      localStorage.getItem('fence-calculator-quotes') || '[]',
    )
    const idx = existing.findIndex(
      (q) => q.name.toLowerCase() === quote.name.toLowerCase(),
    )
    if (idx !== -1) {
      existing[idx] = { ...quote, id: existing[idx].id }
    } else {
      existing.push(quote)
    }
    localStorage.setItem('fence-calculator-quotes', JSON.stringify(existing))
  } catch {
    // ignore
  }
}

export default function CostPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { state, dispatch } = useFormContext()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [quoteName, setQuoteName] = useState('')
  const [savedMessage, setSavedMessage] = useState(false)

  const length = parseFloat(state.length) || 0
  const height = parseFloat(state.height) || 0
  const area = length * height
  const totalCost = area * UNIT_PRICE

  const brickL = parseFloat(state.brickLength) || 23
  const brickH = parseFloat(state.brickHeight) || 7.6
  const headerW = parseFloat(state.headerWidth) || 11
  const needsHeader = state.bondPattern === 'english' || state.bondPattern === 'flemish'

  const openSaveDialog = () => {
    setQuoteName(state.activeQuoteName ?? '')
    setShowSaveDialog(true)
  }

  const handleSave = () => {
    if (!quoteName.trim()) return
    const name = quoteName.trim()
    const quote: SavedQuote = {
      id: Date.now().toString(),
      name,
      date: new Date().toLocaleDateString(),
      length: state.length,
      height: state.height,
      bondPattern: state.bondPattern,
      brickLength: state.brickLength,
      brickHeight: state.brickHeight,
      headerWidth: state.headerWidth,
      totalCost,
    }
    upsertQuote(quote)
    dispatch({ type: 'SET_FIELD', field: 'activeQuoteName', value: name })
    setShowSaveDialog(false)
    setQuoteName('')
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 2000)
  }

  const handleStartOver = () => {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  const missingData = !length || !height || !state.bondPattern

  useEffect(() => {
    if (missingData) navigate('/brick-size', { replace: true })
  }, [missingData, navigate])

  if (missingData) return null

  return (
    <div className="flex flex-col items-center">
      <Stepper currentStep={4} />

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-border p-8">
        <h1 className="text-2xl font-bold text-text mb-2">
          {t('cost.heading')}
        </h1>
        <p className="text-text-muted mb-6">
          {t('cost.description')}
        </p>

        <div className="mb-6 rounded-xl border border-border overflow-hidden">
          <FenceDiagram
            lengthM={length}
            heightM={height}
            bondPattern={state.bondPattern}
            brickLengthCm={brickL}
            brickHeightCm={brickH}
            headerWidthCm={needsHeader ? headerW : undefined}
          />
        </div>

        <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-text">{t('cost.breakdown')}</h2>
          </div>
          <div className="divide-y divide-border">
            <Row label={t('cost.fenceLength')} value={`${length} ${t('cost.meters')}`} />
            <Row label={t('cost.fenceHeight')} value={`${height} ${t('cost.meters')}`} />
            <Row label={t('cost.bondPattern')} value={t(`bond.${state.bondPattern}`)} />
            <Row label={t('cost.area')} value={`${area.toFixed(1)} ${t('cost.sqm')}`} />
            <Row label={t('cost.unitPrice')} value={`$${UNIT_PRICE} ${t('cost.perSqm')}`} />
            <div className="flex justify-between px-6 py-4 bg-primary/5">
              <span className="font-bold text-text">{t('cost.totalCost')}</span>
              <span className="font-bold text-primary text-lg">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted mt-4 leading-relaxed">
          {t('cost.disclaimer')}
        </p>

        {savedMessage && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium text-center">
            {t('quotes.saved')}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={() => navigate('/brick-size')}
            className="inline-flex items-center justify-center gap-2 text-text-muted hover:text-text font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            {t('common.back')}
          </button>
          <button
            onClick={openSaveDialog}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm flex-1 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {t('cost.saveQuote')}
          </button>
          <button
            onClick={handleStartOver}
            className="inline-flex items-center justify-center gap-2 border border-border hover:bg-gray-50 text-text font-medium py-3 px-6 rounded-xl transition-colors cursor-pointer"
          >
            {t('cost.startOver')}
          </button>
        </div>
      </div>

      {showSaveDialog && (
        <SaveDialog
          quoteName={quoteName}
          onNameChange={setQuoteName}
          onSave={handleSave}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between px-6 py-3">
      <span className="text-text-muted">{label}</span>
      <span className="text-text font-medium">{value}</span>
    </div>
  )
}

function nameExistsInStorage(name: string): boolean {
  try {
    const quotes: SavedQuote[] = JSON.parse(
      localStorage.getItem('fence-calculator-quotes') || '[]',
    )
    return quotes.some((q) => q.name.toLowerCase() === name.trim().toLowerCase())
  } catch {
    return false
  }
}

function SaveDialog({
  quoteName,
  onNameChange,
  onSave,
  onCancel,
}: {
  quoteName: string
  onNameChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const nameValue = quoteName ?? ''
  const willOverwrite = nameValue.trim() !== '' && nameExistsInStorage(nameValue)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-text mb-4">{t('quotes.namePrompt')}</h3>
        <input
          type="text"
          value={quoteName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('quotes.namePlaceholder')}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-text"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
        />
        {willOverwrite && (
          <p className="mt-2 text-xs text-amber-600">{t('quotes.willOverwrite')}</p>
        )}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-text-muted font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t('quotes.cancel')}
          </button>
          <button
            onClick={onSave}
            disabled={!quoteName.trim()}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white font-semibold transition-colors cursor-pointer"
          >
            {t('quotes.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
