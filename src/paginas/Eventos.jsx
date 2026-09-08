import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import CardEvento from '../componentes/CardEvento'
import FiltrosEventos from '../componentes/FiltrosEventos'
import Carregando from '../componentes/Carregando'
import EstadoVazio from '../componentes/EstadoVazio'
import { listarEventos, listarCidades } from '../lib/api'
import { useAsync } from '../lib/useAsync'

const PADRAO = { busca: '', cidade: '', categoria: '', entrada: '', quando: 'futuros' }

export default function Eventos() {
  const [params, setParams] = useSearchParams()

  const filtros = useMemo(
    () => ({
      busca: params.get('busca') || '',
      cidade: params.get('cidade') || '',
      categoria: params.get('categoria') || '',
      entrada: params.get('entrada') || '',
      quando: params.get('quando') ?? 'futuros',
    }),
    [params],
  )

  function aplicar(novos) {
    const limpo = {}
    for (const [k, v] of Object.entries(novos)) {
      if (v && !(k === 'quando' && v === 'futuros')) limpo[k] = v
    }
    setParams(limpo, { replace: true })
  }

  const { dados: cidades } = useAsync(() => listarCidades(), [])
  const { dados: eventos, carregando } = useAsync(
    () => listarEventos(filtros),
    [filtros.busca, filtros.cidade, filtros.categoria, filtros.entrada, filtros.quando],
  )

  return (
    <div className="container-pagina py-10">
      <h1 className="text-4xl">Agenda de eventos</h1>
      <p className="mt-1 text-tinta/70">
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
        <Carregando />
      ) : eventos && eventos.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <CardEvento key={evento.id} evento={evento} />
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
