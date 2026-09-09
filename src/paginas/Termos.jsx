import { Link } from 'react-router-dom'
import { useMeta } from '../lib/meta'

function Bloco({ titulo, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl">{titulo}</h2>
      <div className="mt-2 space-y-2 text-suave">{children}</div>
    </section>
  )
}

export default function Termos() {
  useMeta({
    titulo: 'Termos de uso',
    descricao: 'Regras de uso da plataforma Eventos Região.',
    caminho: '/termos',
  })

  return (
    <div className="container-pagina py-10">
      <h1 className="text-4xl">Termos de uso</h1>
      <p className="mt-2 max-w-3xl text-suave">
        Ao usar o <strong>Eventos Região</strong> você concorda com as condições abaixo. É um
        projeto acadêmico, sem fins lucrativos, da Atividade Extensionista de Engenharia de Software
        da UNINTER.
      </p>

      <Bloco titulo="1. O que a plataforma faz">
        <p>
          O Eventos Região é uma <strong>vitrine gratuita</strong> de eventos culturais, esportivos
          e comunitários. Não vende ingressos nem intermedia pagamentos — quando há bilheteria, o
          link leva ao site oficial do evento.
        </p>
      </Bloco>

      <Bloco titulo="2. Contas">
        <p>
          Organizadores criam conta com e-mail e senha para cadastrar e acompanhar seus eventos.
          Você é responsável por manter a senha em segredo e pelas ações feitas na sua conta.
        </p>
      </Bloco>

      <Bloco titulo="3. Conteúdo enviado por organizadores">
        <ul className="ml-5 list-disc space-y-1">
          <li>As informações do evento devem ser <strong>verdadeiras e atualizadas</strong>.</li>
          <li>
            Você declara ter <strong>direito de uso</strong> das imagens e textos que enviar, e
            autoriza a plataforma a exibi-los nas páginas do evento e no compartilhamento.
          </li>
          <li>
            É proibido enviar conteúdo ilegal, ofensivo, enganoso, que viole direitos de terceiros
            ou que não seja um evento real.
          </li>
        </ul>
      </Bloco>

      <Bloco titulo="4. Moderação">
        <p>
          Todo evento passa por revisão antes de aparecer no site. A equipe pode{' '}
          <strong>aprovar, recusar, editar ou remover</strong> qualquer conteúdo, a qualquer
          momento, sem aviso prévio, especialmente se descumprir estes termos.
        </p>
      </Bloco>

      <Bloco titulo="5. Uso da plataforma pelo visitante">
        <p>
          A consulta à agenda é livre e não exige conta. É proibido tentar sobrecarregar,
          invadir ou raspar o site de forma automatizada fora da{' '}
          <Link to="/sobre" className="underline">API pública</Link> documentada.
        </p>
      </Bloco>

      <Bloco titulo="6. Sem garantias">
        <p>
          O serviço é oferecido “no estado em que se encontra”. Não garantimos que as informações
          dos eventos estejam sempre corretas (elas vêm dos organizadores) nem que o site fique
          sempre disponível. Confirme sempre no canal oficial do evento antes de se deslocar.
        </p>
      </Bloco>

      <Bloco titulo="7. Limitação de responsabilidade">
        <p>
          O Eventos Região não se responsabiliza por prejuízos decorrentes do uso das informações
          publicadas, do cancelamento de eventos ou da conduta de organizadores e terceiros.
        </p>
      </Bloco>

      <Bloco titulo="8. Dados pessoais">
        <p>
          O tratamento de dados segue a{' '}
          <Link to="/privacidade" className="underline">Política de Privacidade</Link>, em linha
          com a LGPD (Lei nº 13.709/2018).
        </p>
      </Bloco>

      <Bloco titulo="9. Alterações e contato">
        <p>
          Estes termos podem mudar; a versão vigente é sempre a desta página. Dúvidas? Fale com a
          equipe pela página <Link to="/contato" className="underline">Contato</Link>.
        </p>
      </Bloco>

      <p className="mt-10 text-xs text-suave">
        Foro: comarca de Jaraguá do Sul/SC. Última atualização: setembro de 2026.
      </p>
    </div>
  )
}
