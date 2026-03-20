import { useState, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FormProvider } from './context/FormContext'
import LanguageSwitcher from './components/LanguageSwitcher'
import CookieConsentBanner from './components/CookieConsentBanner'
import QuoteManager from './components/QuoteManager'
import StartPage from './pages/StartPage'
import LengthPage from './pages/LengthPage'
import HeightPage from './pages/HeightPage'
import CostPage from './pages/CostPage'

function AppContent() {
  const { t } = useTranslation()
  const [quotesOpen, setQuotesOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-text truncate">
            {t('app.title')}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuotesOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">{t('nav.myQuotes')}</span>
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/length" element={<LengthPage />} />
          <Route path="/height" element={<HeightPage />} />
          <Route path="/cost" element={<CostPage />} />
        </Routes>
      </main>

      <footer className="border-t border-border bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 text-center text-xs text-text-muted">
          {t('app.title')}
        </div>
      </footer>

      <QuoteManager isOpen={quotesOpen} onClose={() => setQuotesOpen(false)} />
      <CookieConsentBanner />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HashRouter>
        <FormProvider>
          <AppContent />
        </FormProvider>
      </HashRouter>
    </Suspense>
  )
}
