import { useEffect } from 'react'

/** Base pública do site (para URLs absolutas em canonical / OG). */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://eventos-regiao.vercel.app'
).replace(/\/$/, '')

const PADRAO = {
  titulo: 'Eventos Região — Turismo e Cultura Local',
  descricao:
    'Descubra e divulgue eventos culturais, esportivos e comunitários da sua região. Fortalece o turismo e a economia local.',
}

function upsertMeta(attr, chave, valor) {
  let el = document.head.querySelector(`meta[${attr}="${chave}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, chave)
    document.head.appendChild(el)
  }
  el.setAttribute('content', valor)
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(dados) {
  const id = 'jsonld-pagina'
  document.getElementById(id)?.remove()
  if (!dados) return
  const s = document.createElement('script')
  s.type = 'application/ld+json'
  s.id = id
  s.textContent = JSON.stringify(dados)
  document.head.appendChild(s)
}

/**
 * Atualiza título, descrição, canonical e tags Open Graph/Twitter da página
 * atual. Reverte para o padrão do site ao desmontar.
 *
 * @param {{ titulo?, descricao?, caminho?, imagem?, tipo?, jsonLd? }} opts
 */
export function useMeta({ titulo, descricao, caminho = '', imagem, tipo = 'website', jsonLd } = {}) {
  const t = titulo ? `${titulo} · Eventos Região` : PADRAO.titulo
  const d = descricao || PADRAO.descricao
  const url = SITE_URL + caminho
  const img = imagem || `${SITE_URL}/og.png`

  useEffect(() => {
    document.title = t
    upsertMeta('name', 'description', d)
    upsertLink('canonical', url)

    upsertMeta('property', 'og:title', t)
    upsertMeta('property', 'og:description', d)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:type', tipo)
    upsertMeta('property', 'og:image', img)
    upsertMeta('property', 'og:site_name', 'Eventos Região')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', t)
    upsertMeta('name', 'twitter:description', d)
    upsertMeta('name', 'twitter:image', img)

    setJsonLd(jsonLd)

    return () => {
      document.title = PADRAO.titulo
      upsertMeta('name', 'description', PADRAO.descricao)
      setJsonLd(null)
    }
    // jsonLd comparado por conteúdo para não re-rodar à toa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, d, url, img, tipo, JSON.stringify(jsonLd)])
}
