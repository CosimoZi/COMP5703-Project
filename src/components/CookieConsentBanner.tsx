import CookieConsent from 'react-cookie-consent'
import { useTranslation } from 'react-i18next'

export default function CookieConsentBanner() {
  const { t } = useTranslation()

  return (
    <CookieConsent
      location="bottom"
      buttonText={t('cookie.accept')}
      declineButtonText={t('cookie.decline')}
      enableDeclineButton
      cookieName="CookieConsent"
      style={{
        background: '#1e293b',
        padding: '1rem 1.5rem',
        alignItems: 'center',
        fontSize: '0.875rem',
      }}
      buttonStyle={{
        background: '#2563eb',
        color: '#fff',
        borderRadius: '0.5rem',
        padding: '0.5rem 1.5rem',
        fontWeight: '600',
        fontSize: '0.875rem',
      }}
      declineButtonStyle={{
        background: 'transparent',
        border: '1px solid #475569',
        color: '#cbd5e1',
        borderRadius: '0.5rem',
        padding: '0.5rem 1.5rem',
        fontWeight: '500',
        fontSize: '0.875rem',
      }}
      expires={365}
    >
      {t('cookie.message')}
    </CookieConsent>
  )
}
