import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Cabecalho from './componentes/Cabecalho'
import BarraRolagem from './componentes/BarraRolagem'
import Rodape from './componentes/Rodape'
import RotaProtegida from './componentes/RotaProtegida'
import LimiteErro from './componentes/LimiteErro'
import Carregando from './componentes/Carregando'
import Home from './paginas/Home'
import Eventos from './paginas/Eventos'
import Evento from './paginas/Evento'
import Cidades from './paginas/Cidades'
import Cidade from './paginas/Cidade'
import Sobre from './paginas/Sobre'
import Privacidade from './paginas/Privacidade'
import NaoEncontrado from './paginas/NaoEncontrado'
import BannerConsentimento from './componentes/BannerConsentimento'

// Fluxos com login carregam sob demanda — visitantes não baixam esse código.
const DivulgueSeuEvento = lazy(() => import('./paginas/DivulgueSeuEvento'))
const Entrar = lazy(() => import('./paginas/Entrar'))
const RedefinirSenha = lazy(() => import('./paginas/RedefinirSenha'))
const MinhaArea = lazy(() => import('./paginas/organizador/MinhaArea'))
const NovoEvento = lazy(() => import('./paginas/organizador/NovoEvento'))
const Painel = lazy(() => import('./paginas/painel/Painel'))
const Moderacao = lazy(() => import('./paginas/painel/Moderacao'))
const Destaques = lazy(() => import('./paginas/painel/Destaques'))
const NovaCidade = lazy(() => import('./paginas/painel/NovaCidade'))
const Mensagens = lazy(() => import('./paginas/painel/Mensagens'))
const Termos = lazy(() => import('./paginas/Termos'))
const Contato = lazy(() => import('./paginas/Contato'))

function RolarAoTopo() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo" className="link-pular">Pular para o conteúdo</a>
      <RolarAoTopo />
      <BarraRolagem />
      <Cabecalho />

      <main id="conteudo" className="flex-1">
        <LimiteErro>
          <Suspense fallback={<Carregando />}>
            <div key={pathname} className="pagina-entra">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/eventos/:id" element={<Evento />} />
              <Route path="/cidades" element={<Cidades />} />
              <Route path="/cidades/:slug" element={<Cidade />} />
              <Route path="/divulgue" element={<DivulgueSeuEvento />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/termos" element={<Termos />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/entrar" element={<Entrar />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />

              <Route
                path="/organizador"
                element={
                  <RotaProtegida>
                    <MinhaArea />
                  </RotaProtegida>
                }
              />
              <Route
                path="/organizador/novo"
                element={
                  <RotaProtegida>
                    <NovoEvento />
                  </RotaProtegida>
                }
              />

              <Route
                path="/painel"
                element={
                  <RotaProtegida exige="equipe">
                    <Painel />
                  </RotaProtegida>
                }
              />
              <Route
                path="/painel/moderacao"
                element={
                  <RotaProtegida exige="equipe">
                    <Moderacao />
                  </RotaProtegida>
                }
              />
              <Route
                path="/painel/destaques"
                element={
                  <RotaProtegida exige="equipe">
                    <Destaques />
                  </RotaProtegida>
                }
              />
              <Route
                path="/painel/cidades"
                element={
                  <RotaProtegida exige="equipe">
                    <NovaCidade />
                  </RotaProtegida>
                }
              />
              <Route
                path="/painel/mensagens"
                element={
                  <RotaProtegida exige="equipe">
                    <Mensagens />
                  </RotaProtegida>
                }
              />

              <Route path="*" element={<NaoEncontrado />} />
            </Routes>
            </div>
          </Suspense>
        </LimiteErro>
      </main>

      <Rodape />
      <BannerConsentimento />
    </div>
  )
}
