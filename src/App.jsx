import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Cabecalho from './componentes/Cabecalho'
import Rodape from './componentes/Rodape'
import Home from './paginas/Home'
import Eventos from './paginas/Eventos'
import Evento from './paginas/Evento'
import Cidades from './paginas/Cidades'
import Cidade from './paginas/Cidade'
import DivulgueSeuEvento from './paginas/DivulgueSeuEvento'
import Sobre from './paginas/Sobre'
import NaoEncontrado from './paginas/NaoEncontrado'
import Login from './paginas/painel/Login'
import Moderacao from './paginas/painel/Moderacao'

function RolarAoTopo() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo" className="link-pular">
        Pular para o conteúdo
      </a>
      <RolarAoTopo />
      <Cabecalho />

      <main id="conteudo" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/eventos/:id" element={<Evento />} />
          <Route path="/cidades" element={<Cidades />} />
          <Route path="/cidades/:slug" element={<Cidade />} />
          <Route path="/divulgue" element={<DivulgueSeuEvento />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/painel" element={<Login />} />
          <Route path="/painel/moderacao" element={<Moderacao />} />
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </main>

      <Rodape />
    </div>
  )
}
