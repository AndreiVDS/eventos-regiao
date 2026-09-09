import { useState } from 'react'
import { listarCidades } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import {
  useCidadeAtual,
  useLocalizacao,
  usePermissaoGeo,
  resolverLocalizacao,
  formatarDistancia,
} from '../lib/cidade'

const CHAVE_OCULTO = 'nudge_local_oculto'

function jaOcultou() {
  try {
    return localStorage.getItem(CHAVE_OCULTO) === '1'
  } catch {
    return false
  }
}

/**
 * Convite discreto para usar a localização — no estilo dos apps de comida/eventos.
 * Só aparece quando ainda não há posição, a permissão não foi negada e o
 * visitante não dispensou o aviso.
 */
export default function ChamadaLocalizacao({ className = '' }) {
  const { dados: cidades } = useAsync(() => listarCidades(), [])
  const [, definirCidade] = useCidadeAtual()
  const { coords, definirCoords } = useLocalizacao()
  const permissao = usePermissaoGeo()
  const [oculto, setOculto] = useState(jaOcultou)
  const [estado, setEstado] = useState(null) // null | 'buscando' | { tom, texto }

  if (coords || oculto || permissao === 'negada' || permissao === 'indisponivel') return null

  async function usar() {
    setEstado('buscando')
    try {
      const r = await resolverLocalizacao(cidades || [])
      definirCoords(r.ponto)
      if (r.dentro) {
        definirCidade(r.cidade.slug)
        setEstado({ tom: 'ok', texto: `Pronto! Eventos perto de ${r.cidade.nome}.` })
      } else {
        definirCidade('')
        setEstado({
          tom: 'aviso',
          texto: `A cidade com eventos mais próxima é ${r.cidade.nome}, a ~${formatarDistancia(
            r.distanciaKm,
          )}. Mostrando do mais perto para o mais longe.`,
        })
      }
    } catch (err) {
      setEstado({
        tom: 'erro',
        texto:
          err.codigo === 'permissao'
            ? 'Sem permissão de localização. Você pode escolher a cidade no topo do site.'
            : err.message || 'Não deu para usar a localização.',
      })
    }
  }

  function dispensar() {
    setOculto(true)
    try {
      localStorage.setItem(CHAVE_OCULTO, '1')
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      className={`surgir flex flex-col gap-3 rounded-xl bg-superficie p-4 shadow-sm ring-1 ring-borda/10 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-destaque/15 text-destaque">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 21s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
          </svg>
        </span>
        <div>
          <p className="font-semibold text-texto">Ver o que está rolando perto de você</p>
          {estado && estado !== 'buscando' ? (
            <p
              className={`text-sm ${
                estado.tom === 'erro' ? 'text-red-700 dark:text-red-400' : 'text-suave'
              }`}
            >
              {estado.texto}
            </p>
          ) : (
            <p className="text-sm text-suave">
              Usamos só sua posição aproximada, guardada no seu navegador por 12 h.
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={usar}
          disabled={estado === 'buscando'}
          className="btn-destaque !py-2 text-sm"
        >
          {estado === 'buscando' ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="girando">
                <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              Localizando…
            </>
          ) : (
            'Usar minha localização'
          )}
        </button>
        <button
          type="button"
          onClick={dispensar}
          className="rounded-lg px-3 py-2 text-sm text-suave hover:bg-texto/5"
        >
          Agora não
        </button>
      </div>
    </div>
  )
}
