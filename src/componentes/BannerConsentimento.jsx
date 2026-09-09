import { Link } from 'react-router-dom'
import { useConsentimento } from '../lib/consentimento'

export default function BannerConsentimento() {
  const { respondido, registrar } = useConsentimento()
  if (respondido) return null

  return (
    <div
      role="dialog"
      aria-label="Aviso de privacidade"
      className="animar-subir fixed inset-x-0 bottom-0 z-50 border-t border-borda/15 bg-superficie/95 backdrop-blur"
    >
      <div className="container-pagina flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-suave">
          Este site guarda no seu navegador apenas o necessário para funcionar — tema, cidade
          escolhida e sua sessão. <strong>Não usamos rastreadores de publicidade nem análise de
          terceiros.</strong>{' '}
          <Link to="/privacidade" className="font-semibold text-texto underline">
            Saiba mais
          </Link>
          .
        </p>
        <button
          type="button"
          className="btn-destaque shrink-0 !py-2 text-sm"
          onClick={() => registrar()}
        >
          Entendi
        </button>
      </div>
    </div>
  )
}
