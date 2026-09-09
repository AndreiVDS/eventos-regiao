import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CardEvento from '../componentes/CardEvento'
import FiltrosEventos from '../componentes/FiltrosEventos'
import EsqueletoCards from '../componentes/EsqueletoCards'
import EstadoVazio from '../componentes/EstadoVazio'
import ChamadaLocalizacao from '../componentes/ChamadaLocalizacao'
import { listarEventos, listarCidades } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { useCidadeAtual, useLocalizacao, RAIOS } from '../lib/cidade'
import { useMeta } from '../lib/meta'
import { rotuloCategoria, rotuloEntrada, rotuloFormato } from '../lib/formatacao'

const PERIODO_ROTULO = {
  semana: 'Próximos 7 dias',
  mes: 'Próximos 30 dias',
  encerrados: 'Já encerrados',
  '': 'Qualquer data',
  personalizado: 'Datas escolhidas',
}

// O mapa (Leaflet) só é baixado quando o visitante abre a aba "Mapa".
const MapaEventos = lazy(() => import('../componentes/MapaEventos'))

const PADRAO = {
  busca: '', cidade: '', categoria: '', entrada: '', formato: '',
  quando: 'futuros', de: '', ate: '', ordenar: 'data',
}

export default function Eventos() {
  const [params, setParams] = useSearchParams()
  const [cidadeSlug, definirCidade] = useCidadeAtual()
  const { coords, raioKm } = useLocalizacao()
  const [visao, setVisao] = useState('lista') // 'lista' | 'mapa'

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
    () => listarEventos({ ...filtros, origem: coords, raioKm }),
    [
      filtros.busca, filtros.cidade, filtros.categoria, filtros.entrada, filtros.formato,
      filtros.quando, filtros.de, filtros.ate, filtros.ordenar, chaveCoords, raioKm,
    ],
  )

  const ordenandoPorPerto = filtros.ordenar === 'perto' && coords
  const rotuloRaio = RAIOS.find((r) => r.km === raioKm)?.rotulo

  const cidadeFiltrada = (cidades || []).find((c) => c.slug === filtros.cidade)
  useMeta({
    titulo: cidadeFiltrada
      ? `Eventos em ${cidadeFiltrada.nome}/${cidadeFiltrada.uf}`
      : 'Agenda de eventos',
    descricao:
      'Busque e filtre eventos culturais, esportivos e comunitários por cidade, categoria, data e tipo de entrada.',
    caminho: '/eventos',
  })

  const comCoords = (eventos || []).filter((e) => e.lat != null || e.cidade)

  // chips dos filtros ativos (cada um remove o próprio filtro ao clicar)
  const chips = []
  if (filtros.busca) chips.push({ k: 'busca', txt: `"${filtros.busca}"` })
  if (cidadeFiltrada) chips.push({ k: 'cidade', txt: `${cidadeFiltrada.nome}/${cidadeFiltrada.uf}` })
  if (filtros.categoria) chips.push({ k: 'categoria', txt: rotuloCategoria(filtros.categoria) })
  if (filtros.entrada) chips.push({ k: 'entrada', txt: rotuloEntrada(filtros.entrada) })
  if (filtros.formato) chips.push({ k: 'formato', txt: rotuloFormato(filtros.formato) })
  if (filtros.quando && filtros.quando !== 'futuros')
    chips.push({ k: 'quando', txt: PERIODO_ROTULO[filtros.quando] || filtros.quando })
  if (filtros.de || filtros.ate)
    chips.push({ k: 'datas', txt: `${filtros.de || '…'} → ${filtros.ate || '…'}` })

  function removerChip(k) {
    if (k === 'datas') aplicar({ ...filtros, de: '', ate: '', quando: 'futuros' })
    else if (k === 'quando') aplicar({ ...filtros, quando: 'futuros' })
    else aplicar({ ...filtros, [k]: '' })
  }

  return (
    <div className="container-pagina py-10">
      <h1 className="text-4xl">Agenda de eventos</h1>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-suave">
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

        <div
          className="inline-flex rounded-lg bg-superficie p-0.5 text-sm font-semibold ring-1 ring-borda/15"
          role="tablist"
          aria-label="Ver como lista ou mapa"
        >
          {[
            ['lista', 'Lista'],
            ['mapa', 'Mapa'],
          ].map(([v, r]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={visao === v}
              onClick={() => setVisao(v)}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                visao === v ? 'bg-tinta text-creme' : 'text-suave hover:text-texto'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {ordenandoPorPerto && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-suave">
          <span className="ponto-vivo inline-block h-2 w-2 rounded-full bg-destaque text-destaque" />
          Do mais perto para o mais longe
          {rotuloRaio && rotuloRaio !== 'qualquer distância' ? ` · ${rotuloRaio}` : ''}
        </p>
      )}

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button
              key={c.k}
              type="button"
              onClick={() => removerChip(c.k)}
              className="inline-flex items-center gap-1.5 rounded-full bg-texto/10 px-3 py-1 text-sm hover:bg-texto/15"
            >
              {c.txt}
              <span aria-hidden="true" className="text-suave">✕</span>
              <span className="sr-only">remover filtro</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => aplicar(PADRAO)}
            className="text-sm text-suave underline hover:text-texto"
          >
            limpar tudo
          </button>
        </div>
      )}

      {!coords && (
        <div className="mt-5">
          <ChamadaLocalizacao />
        </div>
      )}

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
        visao === 'mapa' ? (
          <div className="mt-8">
            <Suspense
              fallback={<div className="esqueleto h-[380px] w-full rounded-xl" aria-hidden="true" />}
            >
              <MapaEventos eventos={comCoords} origem={coords} />
            </Suspense>
            <p className="mt-2 text-xs text-suave">
              Toque num pino para ver o evento. Mapa © colaboradores do OpenStreetMap.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento, i) => (
              <CardEvento key={evento.id} evento={evento} indice={i} />
            ))}
          </div>
        )
      ) : (
        <div className="mt-8">
          <EstadoVazio
            titulo={
              raioKm != null && coords
                ? `Nenhum evento num raio de ${rotuloRaio?.replace('até ', '')} de você`
                : 'Nenhum evento com esses filtros'
            }
            descricao={
              raioKm != null && coords
                ? 'Aumente a distância no seletor de localização (no topo) ou limpe os filtros.'
                : 'Tente ampliar o período, trocar a cidade ou limpar os filtros.'
            }
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
