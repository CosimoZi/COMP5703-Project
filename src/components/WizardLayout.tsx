import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import FenceDiagram from './FenceDiagram'

interface WizardLayoutProps {
  form: ReactNode
  lengthM: number
  heightM: number
  bondPattern?: string
  showDiagram: boolean
}

export default function WizardLayout({
  form,
  lengthM,
  heightM,
  bondPattern,
  showDiagram,
}: WizardLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6 w-full">
      <div className="w-full lg:w-[480px] lg:flex-shrink-0">{form}</div>

      <div className="w-full lg:flex-1 lg:min-w-0">
        <div className="lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              {t('diagram.previewTitle')}
            </h3>
            {showDiagram ? (
              <div className="rounded-xl overflow-hidden border border-border/50">
                <FenceDiagram
                  lengthM={lengthM}
                  heightM={heightM}
                  bondPattern={bondPattern}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border/70 bg-surface-alt h-64 sm:h-80 lg:h-96 text-sm text-text-muted text-center px-4">
                {t('diagram.awaitingDimensions')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
