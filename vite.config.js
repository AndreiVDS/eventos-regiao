import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icones/icone-192.png', 'icones/icone-512.png'],
      manifest: {
        name: 'Eventos Região — Turismo e Cultura Local',
        short_name: 'Eventos Região',
        description:
          'Plataforma inclusiva para descobrir e divulgar eventos culturais, esportivos e comunitários da sua região.',
        theme_color: '#1f1e1f',
        background_color: '#faf9f7',
        display: 'standalone',
        start_url: '/',
        lang: 'pt-BR',
        icons: [
          { src: 'icones/icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icones/icone-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icones/icone-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/dados/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'dados-locais' },
          },
        ],
      },
    }),
  ],
})
