import { NavLink } from 'react-router-dom'
import Carregando from '../../componentes/Carregando'
import StatTile from '../../componentes/graficos/StatTile'
import GraficoBarras from '../../componentes/graficos/GraficoBarras'
import { listarTodosEventos } from '../../lib/api'
import { useAsync } from '../../lib/useAsync'
import { calcularMetricas } from '../../lib/metricas'
import { useAuth } from '../../lib/auth'

export function AbasPainel() {
  const classe = ({ isActive }) =>
    `rounded-lg px-4 py-2 text-sm font-semibold ${
      isActive ? 'bg-tinta text-creme' : 'bg-superficie ring-1 ring-borda/10 hover:bg-texto/5'
    }`
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Seções do painel">
      <NavLink end to="/painel" className={classe}>Visão geral</NavLink>
      <NavLink to="/painel/moderacao" className={classe}>Moderação</NavLink>
      <NavLink to="/painel/destaques" className={classe}>Destaques</NavLink>
    </nav>
  )
}

export default function Painel() {
  const { sair } = useAuth()
  const { dados: eventos, carregando } = useAsync(() => listarTodosEventos(), [])

  if (carregando) return <Carregando texto="Calculando métricas…" />

  const m = calcularMetricas(eventos || [])

  return (
    <div className="container-pagina py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-suave/80">Painel da equipe</p>
          <h1 className="text-4xl">Visão geral</h1>
        </div>
        <button onClick={sair} className="btn-contorno !py-2 text-sm">Sair</button>
      </div>

      <div className="mt-4">
        <AbasPainel />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile rotulo="Eventos publicados" valor={m.total} tom="escuro" />
        <StatTile rotulo="Aguardando revisão" valor={m.pendentes} tom={m.pendentes ? 'destaque' : 'claro'} />
        <StatTile rotulo="Cidades ativas" valor={m.cidadesAtivas} detalhe={`${m.estadosAtivos} estados`} />
        <StatTile rotulo="Nos próximos 30 dias" valor={m.proximos30} />
        <StatTile rotulo="Gratuitos" valor={m.pctGratuitos} sufixo="%" detalhe="do total publicado" />
        <StatTile rotulo="Recusados" valor={m.recusados} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <GraficoBarras titulo="Eventos por cidade" unidade="eventos" dados={m.porCidade} />
        <GraficoBarras titulo="Eventos por categoria" unidade="eventos" dados={m.porCategoria} />
        <GraficoBarras titulo="Eventos por estado" unidade="eventos" dados={m.porUf} />
        <GraficoBarras
          titulo="Agenda dos próximos 12 meses"
          unidade="eventos"
          dados={m.porMes}
          vazio="Nenhum evento futuro cadastrado."
        />
      </div>
    </div>
  )
}
