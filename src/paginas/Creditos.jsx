import { Link } from 'react-router-dom'
import { useMeta } from '../lib/meta'
import { CREDITOS_IMAGENS } from '../lib/creditos'

export default function Creditos() {
  useMeta({
    titulo: 'Créditos das imagens',
    descricao: 'Autoria e licença das fotos usadas na plataforma.',
    caminho: '/creditos',
  })

  return (
    <div className="container-pagina py-10">
      <h1 className="text-4xl">Créditos das imagens</h1>
      <p className="mt-2 max-w-2xl text-suave">
        Alguns eventos de curadoria que ainda não têm foto própria usam fotos temáticas do{' '}
        <a
          href="https://commons.wikimedia.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Wikimedia Commons
        </a>
        , sob licença Creative Commons. Fotos enviadas por organizadores são de responsabilidade de
        quem as envia (ver <Link to="/termos" className="underline">Termos de uso</Link>).
      </p>

      <ul className="mt-8 divide-y divide-borda/10 overflow-hidden rounded-xl bg-superficie ring-1 ring-borda/10">
        {CREDITOS_IMAGENS.map((c) => (
          <li key={c.tema} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-4">
            <span className="font-semibold">{c.tema}</span>
            <span className="text-sm text-suave">
              {c.autor} ·{' '}
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline">
                {c.licenca}
              </a>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-suave">
        Os mapas são © colaboradores do{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          OpenStreetMap
        </a>
        . Ícones e ilustrações da própria plataforma.
      </p>
    </div>
  )
}
