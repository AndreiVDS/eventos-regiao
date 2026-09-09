import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import CardEvento from '../componentes/CardEvento'
import FiltrosEventos from '../componentes/FiltrosEventos'
import EsqueletoCards from '../componentes/EsqueletoCards'
import EstadoVazio from '../componentes/EstadoVazio'
import { listarEventos, listarCidades } from '../lib/api'
import { useAsync } from '../lib/useAsync'
import { useCidadeAtual } from '../lib/cidade'

const PADRAO = { busca: '', cidade: '', categoria: '', entrada: '', quando: 'futuros' }

export default function Eventos() {
  const [params, setParams] = useSearchParams()
  const [cidadeSlug, definirCidade] = useCidadeAtual()

  // Um link compartilhado com ?cidade=... passa a valer também no seletor do topo.
  useEffect(() => {
    const daUrl = params.get('cidade')
    if (daUrl != null && daUrl !== cidadeSlug) definirCidade(daUrl)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtros = useMemo(
    () => ({
      busca: params.get('busca') || '',
      // sem parâmetro na URL → usa a cidade escolhida no cabeçalho
      cidade: params.has('cidade') ? params.get('cidade') : cidadeSlug,
      categoria: params.get('categoria') || '',
      entrada: params.get('entrada') || '',
      quando: params.get('quando') ?? 'futuros',
    }),
    [params, cidadeSlug],
  )

  function aplicar(novos) {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(novos)) {
      if (k === 'quando' && (!v || v === 'futuros')) continue
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
    () => listarEventos(filtros),
    [filtros.busca, filtros.cidade, filtros.categoria, filtros.entrada, filtros.quando],
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
      </p>

      <div className="mt-6">
        <FiltrosEventos valores={filtros} aoMudar={aplicar} cidades={cidades || []} />
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
