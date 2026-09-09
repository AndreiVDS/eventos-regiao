import { Link } from 'react-router-dom'
import { useConsentimento } from '../lib/consentimento'

function Bloco({ titulo, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl">{titulo}</h2>
      <div className="mt-2 space-y-2 text-suave">{children}</div>
    </section>
  )
}

export default function Privacidade() {
  const { reabrir } = useConsentimento()

  return (
    <div className="container-pagina py-10">
      <h1 className="text-4xl">Privacidade e dados</h1>
      <p className="mt-2 max-w-3xl text-suave">
        Esta página explica quais dados o <strong>Eventos Região</strong> trata e como, em linha com
        a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). É um projeto acadêmico, sem
        fins lucrativos, da Atividade Extensionista III do curso de Engenharia de Software da UNINTER.
      </p>

      <Bloco titulo="O que fica guardado no seu navegador">
        <p>
          Usamos o armazenamento local (<em>localStorage</em>) somente para o site funcionar:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li><strong>Tema</strong> (claro/escuro/sistema) e <strong>cidade</strong> escolhida no seletor;</li>
          <li>Sua <strong>sessão</strong>, para manter o login entre páginas;</li>
          <li>
            Se você usar <strong>“perto de mim”</strong>, sua posição <strong>aproximada</strong>
            (arredondada para cerca de 1 km, válida por 12 horas) — só para calcular a distância até
            os eventos. Você pode limpar isso no próprio seletor de cidade.
          </li>
          <li>No modo de demonstração (sem banco), rascunhos de eventos, destaques e confirmações ficam só no navegador.</li>
        </ul>
        <p>
          <strong>Não há cookies de publicidade, pixels de redes sociais nem ferramentas de análise
          de terceiros.</strong> Nada disso é enviado para fora do seu dispositivo sem uma ação sua.
        </p>
      </Bloco>

      <Bloco titulo="Dados pessoais que coletamos">
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Cadastro de organizador:</strong> e-mail e senha (a senha é armazenada de forma
            criptografada pelo provedor de autenticação, o Supabase — nunca temos acesso a ela).
          </li>
          <li>
            <strong>Formulário “Divulgue seu evento”:</strong> um e-mail ou telefone de contato do
            organizador. Esse dado é de uso interno da equipe para validar o evento e{' '}
            <strong>não aparece nas páginas públicas</strong>.
          </li>
          <li>
            <strong>“Vou participar”:</strong> registramos que a sua conta confirmou presença em um
            evento (para dar ao organizador uma noção de público). Não expomos seu nome nem seu
            e-mail para outros usuários.
          </li>
        </ul>
      </Bloco>

      <Bloco titulo="Para que usamos">
        <p>
          Exclusivamente para operar a plataforma: autenticar você, publicar e moderar eventos,
          permitir que organizadores acompanhem seus eventos e confirmações, e gerar métricas
          agregadas (sem identificar pessoas) no painel da equipe.
        </p>
        <p>
          <strong>Não vendemos, alugamos nem compartilhamos seus dados</strong> com terceiros para
          fins comerciais.
        </p>
      </Bloco>

      <Bloco titulo="Onde os dados ficam">
        <p>
          Quando o back-end está ativo, os dados ficam em um banco PostgreSQL gerenciado pelo{' '}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">
            Supabase
          </a>
          , com regras de acesso por linha (RLS): a leitura pública só enxerga eventos aprovados e
          nunca o contato do organizador; a moderação exige conta de equipe.
        </p>
      </Bloco>

      <Bloco titulo="Por quanto tempo">
        <p>
          Os dados são mantidos enquanto a conta existir ou enquanto o evento estiver na agenda.
          Você pode pedir a exclusão a qualquer momento (veja abaixo).
        </p>
      </Bloco>

      <Bloco titulo="Seus direitos (LGPD)">
        <p>Você pode solicitar, sem custo:</p>
        <ul className="ml-5 list-disc space-y-1">
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos ou desatualizados;</li>
          <li>exclusão da conta e dos dados associados;</li>
          <li>informação sobre com quem os dados foram compartilhados.</li>
        </ul>
        <p>
          Para exercer qualquer um desses direitos, entre em contato com a equipe pela página{' '}
          <Link to="/sobre" className="underline">Sobre</Link> ou pelo repositório do projeto.
        </p>
      </Bloco>

      <Bloco titulo="Preferências">
        <p>
          Você pode limpar o armazenamento local a qualquer momento nas configurações do navegador.
          Para rever o aviso de privacidade que aparece na primeira visita:
        </p>
        <button className="btn-contorno mt-2 !py-2 text-sm" onClick={reabrir}>
          Mostrar o aviso de novo
        </button>
      </Bloco>

      <p className="mt-10 text-xs text-suave">Última atualização: setembro de 2026.</p>
    </div>
  )
}
