// Prepara o ambiente local. Uso: npm run setup
import { existsSync, copyFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const [maior] = process.versions.node.split('.').map(Number)
if (maior < 18) {
  console.error(`\n  Node ${process.versions.node} — este projeto precisa do Node 18 ou mais novo.\n`)
  process.exit(1)
}

if (!existsSync('.env')) {
  copyFileSync('.env.example', '.env')
  console.log('  .env criado a partir de .env.example (pode deixar vazio para o modo demonstração).')
} else {
  console.log('  .env já existe — mantido.')
}

console.log('  Gerando dados de exemplo…')
execSync('node scripts/gerar-dados.mjs', { stdio: 'inherit' })

console.log(`
  Pronto. Próximos passos:

    npm run dev          inicia em http://localhost:5173 (modo demonstração, sem contas)

  Para ligar o back-end de verdade:
    1. Crie um projeto em https://supabase.com
    2. SQL Editor → cole e execute  supabase/setup.sql
    3. Preencha VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY e VITE_ADMIN_EMAILS no .env
    4. Authentication → Users → crie os usuários da equipe

  Deploy: botão "Deploy with Vercel" no README, ou importe o repo em vercel.com
`)
