import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import CardEvento from '../componentes/CardEvento'
import FiltrosEventos from '../componentes/FiltrosEventos'
import EsqueletoCards from '../componentes/EsqueletoCards'
import EstadoVazio from '../componentes/EstadoVazio'
import { listarEventos, listarCidades } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { useCidadeAtual, useLocalizacao } from '../lib/cidade'

const PADRAO = {
  busca: '', cidade: '', categoria: '', entrada: '', formato: '',
  quando: 'futuros', de: '', ate: '', ordenar: 'data',
}

export default function Eventos() {
  const [params, setParams] = useSearchParams()
  const [cidadeSlug, definirCidade] = useCidadeAtual()
  const { coords } = useLocalizacao()

  // Um link compartilhado com ?cidade=... passa a valer também no seletor do topo.
  useEffect(() => {
    const daUrl = params.get('cidade')
    if (daUrl != null && daUrl !== cidadeSlug) definirCidade(daUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const chaveCoords = coords ? `${coords.lat},${coords.lng}` : ''

  const filtros = useMemo(
    () => {
      // sem parâmetro na URL → usa a cidade escolhida no cabeçalho
      const cidade = params.has('cidade') ? params.get('cidade') : cidadeSlug
      return {
        busca: params.get('busca') || '',
        cidade,
        categoria: params.get('categoria') || '',
        entrada: params.get('entrada') || '',
        formato: params.get('formato') || '',
        quando: params.get('quando') ?? 'futuros',
        de: params.get('de') || '',
        ate: params.get('ate') || '',
        // com localização e sem cidade fixa, o padrão é "mais perto de você"
        ordenar: params.get('ordenar') || (coords && !cidade ? 'perto' : 'data'),
      }
    },
    [params, cidadeSlug, coords],
  )

  function aplicar(novos) {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(novos)) {
      if (k === 'quando' && (!v || v === 'futuros')) continue
      if (k === 'ordenar') {
        const padrao = coords && !novos.cidade ? 'perto' : 'data'
        if (!v || v === padrao) continue
      }
      if (k === 'cidade') {
        p.set('cidade', v || '') // sempre explícito, para permitir "todas"
        definirCidade(v || '')
        continue
      }
      if (v) p.set(k, v)
    }
    setParams(p, { replace: true })
  }

  const { dados: cidades } = useAsync(() => listarCidades(), [])
  const { dados: eventos, carregando } = useAsync(
    () => listarEventos({ ...filtros, origem: coords }),
    [
      filtros.busca, filtros.cidade, filtros.categoria, filtros.entrada, filtros.formato,
      filtros.quando, filtros.de, filtros.ate, filtros.ordenar, chaveCoords,
    ],
  )

  return (
    <div className="container-pagina py-10">
      <h1 className="text-4xl">Agenda de eventos</h1>
      <p className="mt-1 text-suave">
        {carregando
          ? 'Buscando…'
          : `${eventos?.length || 0} evento${eventos?.length === 1 ? '' : 's'} encontrado${
              eventos?.length === 1 ? '' : 's'
            }`}
        {filtros.quando !== 'encerrados' ? (
          <>
            {' · '}
            <button
              type="button"
              className="underline hover:text-texto"
              onClick={() => aplicar({ ...filtros, quando: 'encerrados', de: '', ate: '' })}
            >
              ver encerrados
            </button>
          </>
        ) : null}
      </p>

      <div className="mt-6">
        <FiltrosEventos
          valores={filtros}
          aoMudar={aplicar}
          cidades={cidades || []}
          temLocalizacao={Boolean(coords)}
        />
      </div>

      {carregando ? (
        <EsqueletoCards />
      ) : eventos && eventos.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento, i) => (
            <CardEvento key={evento.id} evento={evento} indice={i} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EstadoVazio
            titulo="Nenhum evento com esses filtros"
            descricao="Tente ampliar o período, trocar a cidade ou limpar os filtros."
            acao={
              <button className="btn-destaque" onClick={() => aplicar(PADRAO)}>
                Limpar filtros
              </button>
            }
          />
        </div>
      )}
    </div>
  )
}
