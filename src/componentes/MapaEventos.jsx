import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { coordsDoEvento, distanciaAteEvento, formatarDistancia } from '../lib/cidade'

// Pinos desenhados à mão (divIcon) — evita depender das imagens padrão do
// Leaflet, que quebram no empacotador.
const pinoEvento = L.divIcon({
  className: '',
  html: `<span style="display:block;width:26px;height:26px;transform:translate(-13px,-26px)">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#f4b400" stroke="#1f1e1f" stroke-width="1.5">
      <path d="M12 22s7-6.3 7-12A7 7 0 1 0 5 10c0 5.7 7 12 7 12z"/>
      <circle cx="12" cy="10" r="2.6" fill="#1f1e1f"/>
    </svg></span>`,
  iconSize: [0, 0],
})

const pinoVoce = L.divIcon({
  className: '',
  html: `<span style="display:block;width:20px;height:20px;transform:translate(-10px,-10px)">
    <span style="position:absolute;inset:0;border-radius:9999px;background:#2563eb;opacity:.25"></span>
    <span style="position:absolute;inset:5px;border-radius:9999px;background:#2563eb;border:2px solid #fff"></span>
  </span>`,
  iconSize: [0, 0],
})

function escapar(s = '') {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
}

export default function MapaEventos({ eventos = [], origem, altura = 380 }) {
  const elRef = useRef(null)
  const mapaRef = useRef(null)

  useEffect(() => {
    if (!elRef.current || mapaRef.current) return
    const mapa = L.map(elRef.current, { scrollWheelZoom: false, attributionControl: true })
    mapaRef.current = mapa
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; colaboradores do OpenStreetMap',
    }).addTo(mapa)
    return () => {
      mapa.remove()
      mapaRef.current = null
    }
  }, [])

  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa) return

    // limpa marcadores antigos
    mapa.eachLayer((l) => {
      if (l instanceof L.Marker || l instanceof L.Circle) mapa.removeLayer(l)
    })

    const todos = []
    const perto = [] // eventos a até 150 km da pessoa — usados para enquadrar

    if (origem) {
      L.marker([origem.lat, origem.lng], { icon: pinoVoce, keyboard: false })
        .addTo(mapa)
        .bindPopup('Você está aqui')
      todos.push([origem.lat, origem.lng])
      perto.push([origem.lat, origem.lng])
    }

    for (const e of eventos) {
      const co = coordsDoEvento(e)
      if (!co) continue
      const d = origem ? distanciaAteEvento(origem, e) : null
      const linhaDist = d != null ? `<br><strong>${formatarDistancia(d)} de você</strong>` : ''
      L.marker([co.lat, co.lng], { icon: pinoEvento })
        .addTo(mapa)
        .bindPopup(
          `<div style="min-width:160px">
             <strong>${escapar(e.titulo)}</strong><br>
             <span style="color:#5c5c5e">${escapar(e.local)} — ${escapar(e.cidade_nome)}/${escapar(e.uf)}</span>
             ${linhaDist}
             <br><a href="/eventos/${escapar(e.id)}" style="color:#1f6feb">Ver detalhes →</a>
           </div>`,
        )
      todos.push([co.lat, co.lng])
      if (d != null && d <= 150) perto.push([co.lat, co.lng])
    }

    // enquadra na região da pessoa se houver eventos por perto; senão, em tudo
    const alvo = perto.length >= 2 ? perto : todos
    if (alvo.length === 1) mapa.setView(alvo[0], 12)
    else if (alvo.length > 1) mapa.fitBounds(alvo, { padding: [40, 40], maxZoom: 13 })
    else mapa.setView([-15.6, -47.9], 4) // Brasil inteiro, fallback
  }, [eventos, origem])

  return (
    <div
      ref={elRef}
      className="w-full overflow-hidden rounded-xl ring-1 ring-borda/15"
      style={{ height: altura }}
      role="application"
      aria-label="Mapa dos eventos próximos"
    />
  )
}
