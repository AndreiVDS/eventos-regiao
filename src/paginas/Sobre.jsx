import { Link } from 'react-router-dom'

const objetivos = [
  'Centralizar informações sobre eventos de diferentes regiões, hoje espalhadas por redes sociais e cartazes.',
  'Dar a organizadores — grandes ou pequenos — um canal gratuito de divulgação.',
  'Estimular o turismo e a economia local, ampliando a visibilidade de eventos culturais, esportivos e comunitários.',
  'Oferecer uma interface acessível e intuitiva para turistas e moradores.',
  'Engajar a comunidade no uso da tecnologia como ferramenta de promoção cultural.',
  'Fortalecer o senso de pertencimento e a identidade cultural das regiões.',
]

const equipe = [
  { nome: 'Andrei Vinícius da Silveira', ru: '4605228' },
  { nome: 'Gabriel Lenhardt', ru: '4739897' },
  { nome: 'Gabriel Augusto Fernandes Ferreira Martins', ru: '4704869' },
]

export default function Sobre() {
  return (
    <div className="container-pagina py-10">
      <h1 className="text-4xl">Sobre o projeto</h1>
      <p className="mt-3 max-w-3xl text-lg text-tinta/80">
        <strong>Eventos Região</strong> é uma plataforma inclusiva para o fortalecimento do turismo
        e da cultura, desenvolvida como Atividade Extensionista do curso de Engenharia de Software da
        UNINTER. A proposta é aproximar pessoas dos eventos que celebram a cultura local e impulsionar
        a economia das comunidades.
      </p>

      <section className="mt-10">
        <h2 className="text-2xl">Objetivos</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {objetivos.map((o) => (
            <li key={o} className="flex gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-tinta/10">
              <span aria-hidden="true">✔️</span>
              <span className="text-sm text-tinta/80">{o}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-tinta p-6 text-creme">
          <h2 className="text-2xl text-destaque">ODS envolvidos</h2>
          <p className="mt-2 text-sm text-creme/80">
            <strong>ODS 8 — Trabalho decente e crescimento econômico:</strong> mais visibilidade para
            eventos significa mais renda para artistas, feirantes, pousadas e pequenos negócios.
          </p>
          <p className="mt-3 text-sm text-creme/80">
            <strong>ODS 11 — Cidades e comunidades sustentáveis:</strong> valorização da cultura
            local, do espaço público e da participação comunitária.
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-tinta/10">
          <h2 className="text-2xl">Compromisso com a acessibilidade</h2>
          <p className="mt-2 text-sm text-tinta/80">
            A plataforma é construída seguindo boas práticas de acessibilidade: navegação por
            teclado, foco visível, contraste adequado, textos alternativos em imagens, estrutura
            semântica e respeito à preferência de menos animações do sistema. É também um
            aplicativo instalável (PWA) que funciona mesmo com internet instável.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Equipe</h2>
        <ul className="mt-4 flex flex-wrap gap-4">
          {equipe.map((p) => (
            <li key={p.ru} className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-tinta/10">
              <p className="font-semibold">{p.nome}</p>
              <p className="text-sm text-tinta/60">RU {p.ru}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-xl bg-destaque p-6 text-tinta">
        <h2 className="text-2xl">Quer colaborar?</h2>
        <p className="mt-1 max-w-2xl">
          Se você organiza eventos ou representa uma associação cultural e quer ver sua cidade na
          plataforma, cadastre um evento ou entre em contato pelo repositório do projeto.
        </p>
        <Link to="/divulgue" className="btn-tinta mt-4">
          Divulgue seu evento
        </Link>
      </section>
    </div>
  )
}
