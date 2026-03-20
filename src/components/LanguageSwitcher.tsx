import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/80 p-1 shadow-sm border border-border">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            i18n.language === lang.code
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-muted hover:text-text hover:bg-gray-100'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
