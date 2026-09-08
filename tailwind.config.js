/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta da plataforma
        tinta: '#1f1e1f', // fundo escuro / textos fortes
        destaque: '#f4b400', // amarelo de destaque (contraste AA sobre tinta)
        creme: '#faf9f7', // fundo claro da página
      },
      fontFamily: {
        titulo: ['"Bebas Neue"', 'system-ui', 'sans-serif'],
        corpo: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
