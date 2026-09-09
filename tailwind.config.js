/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cores fixas da marca (não mudam entre temas)
        tinta: '#1f1e1f', // seções sempre escuras (cabeçalho, rodapé, herói)
        destaque: '#f4b400', // amarelo de destaque
        creme: '#faf9f7', // claro fixo (texto sobre seções escuras)

        // Tokens adaptativos — valores vêm de variáveis CSS e trocam no tema escuro
        fundo: 'rgb(var(--cor-fundo) / <alpha-value>)',
        superficie: 'rgb(var(--cor-superficie) / <alpha-value>)',
        'superficie-2': 'rgb(var(--cor-superficie-2) / <alpha-value>)',
        texto: 'rgb(var(--cor-texto) / <alpha-value>)',
        suave: 'rgb(var(--cor-suave) / <alpha-value>)',
        borda: 'rgb(var(--cor-borda) / <alpha-value>)',
      },
      fontFamily: {
        titulo: ['"Bebas Neue"', 'system-ui', 'sans-serif'],
        corpo: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        suave: 'var(--sombra-1)',
        media: 'var(--sombra-2)',
        alta: 'var(--sombra-3)',
      },
    },
  },
  plugins: [],
}
