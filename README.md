# Eventos Região

**Plataforma Inclusiva para Fortalecimento do Turismo e Cultura — "Promovendo Eventos e Impulsionando a Economia Local"**

Projeto da disciplina **Atividade Extensionista III: Tecnologia Aplicada à Inclusão Digital — Análise**, do curso de **Engenharia de Software** do Centro Universitário Internacional UNINTER.

| | |
|---|---|
| **Setor de aplicação** | Turismo, cultura, lazer e eventos comunitários |
| **ODS** | 8 — Trabalho decente e crescimento econômico · 11 — Cidades e comunidades sustentáveis |
| **Equipe** | Andrei Vinícius da Silveira (RU 4605228) · Gabriel Lenhardt (RU 4739897) · Gabriel Augusto Fernandes Ferreira Martins (RU 4704869) |

---

## O que é

Uma aplicação web que **centraliza a divulgação de eventos** culturais, esportivos e comunitários de diferentes cidades, permitindo que:

- **moradores e turistas** descubram o que acontece perto deles, com busca e filtros por cidade, categoria, data e tipo de entrada;
- **organizadores** — grandes ou pequenos — cadastrem seus eventos gratuitamente, com um fluxo de revisão antes da publicação.

A plataforma é um **PWA** (Progressive Web App): funciona no celular, pode ser instalada como aplicativo e abre mesmo com internet instável.

## Como isso responde à proposta

| Objetivo da proposta | Onde aparece no sistema |
|---|---|
| Centralizar informações de eventos de várias regiões | Página **Agenda de eventos** com dados de várias cidades (SC, PR, MG) |
| Nova opção de divulgação para organizadores | Página **Divulgue seu evento** + painel de moderação |
| Estimular turismo e economia local | Páginas de **cidade** com identidade cultural; destaque para eventos gratuitos |
| Interface acessível e intuitiva | Base semântica, navegação por teclado, foco visível, contraste, textos alternativos, `prefers-reduced-motion` |
| Engajar a comunidade no uso da tecnologia | Cadastro simples, material de apoio em `docs/` |
| Fortalecer pertencimento e identidade cultural | Descrições culturais por cidade, categorias que valorizam o local |

---

## Tecnologias

- **Front-end:** React 18 + Vite 5 + React Router
- **Estilo:** Tailwind CSS 3
- **PWA:** vite-plugin-pwa (Workbox)
- **Back-end / API:** [Supabase](https://supabase.com) (PostgreSQL + API REST automática + Auth)
- **Hospedagem:** Vercel

> A aplicação roda **sem back-end** para demonstração: enquanto as variáveis do Supabase não estão configuradas, os dados vêm dos arquivos em `public/dados/` e os envios de eventos ficam salvos no navegador (`localStorage`).

---

## Rodando localmente

Pré-requisitos: **Node.js 18+**.

```bash
npm install
npm run dev       # http://localhost:5173
```

Outros comandos:

```bash
npm run build     # gera a versão de produção em dist/
npm run preview   # serve o dist/ localmente
npm run lint      # ESLint
```

---

## Conectando o back-end (Supabase)

1. Crie um projeto em <https://supabase.com>.
2. No **SQL Editor**, rode `supabase/schema.sql` (cria tabelas e políticas de segurança) e, opcionalmente, `supabase/seed.sql` (dados de exemplo).
3. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**.
4. Crie um arquivo `.env` na raiz (baseado em `.env.example`):

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

5. Reinicie o `npm run dev`. A aplicação passa a ler e gravar no Supabase automaticamente.
6. Para o **painel de moderação** (`/painel`), crie um usuário em **Authentication → Users**. Só usuários autenticados conseguem aprovar/recusar eventos (regras em `schema.sql`).

---

## Deploy na Vercel

1. Suba este repositório para o GitHub.
2. Em <https://vercel.com>, **New Project → Import** o repositório.
3. A Vercel detecta o Vite automaticamente (build `npm run build`, saída `dist`). O `vercel.json` já cuida do roteamento de SPA.
4. Em **Settings → Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Cada `git push` na branch principal gera um novo deploy. Pull requests ganham uma URL de pré-visualização.
6. Domínio próprio: **Settings → Domains**.

---

## Estrutura do projeto

```
├── public/
│   ├── dados/                 # eventos.json e cidades.json (modo demonstração)
│   ├── img/                   # imagens dos eventos e "postais" das cidades
│   └── icones/                # ícones do PWA
├── src/
│   ├── componentes/           # Cabeçalho, Rodapé, CardEvento, Filtros, ...
│   ├── paginas/               # Home, Eventos, Evento, Cidades, Cidade, Divulgue, Sobre
│   │   └── painel/            # Login e Moderação
│   ├── lib/
│   │   ├── api.js             # camada de dados (Supabase OU JSON local)
│   │   ├── supabase.js        # cliente Supabase
│   │   ├── formatacao.js      # datas, categorias, rótulos
│   │   └── useAsync.js        # hook de carregamento
│   ├── App.jsx                # rotas + layout
│   └── index.css              # Tailwind + estilos base de acessibilidade
├── supabase/
│   ├── schema.sql             # tabelas + RLS
│   └── seed.sql               # dados de exemplo
├── docs/
│   ├── proposta-de-tema.pdf
│   └── analise/               # requisitos, casos de uso, arquitetura
└── legado/                    # primeira versão estática (histórico)
```

---

## Acessibilidade

Práticas já aplicadas: HTML semântico, um `<h1>` por página, link "pular para o conteúdo", foco visível (`:focus-visible`), navegação e menu operáveis por teclado (`aria-expanded`/`aria-controls`), rótulos associados a todos os campos, mensagens de erro com `role="alert"`, textos alternativos em imagens informativas e `alt=""` nas decorativas, respeito a `prefers-reduced-motion`, contraste conferido na paleta.

Como testar: **Lighthouse** (aba Acessibilidade) e a extensão **axe DevTools**. Guardar os relatórios em `docs/analise/`.

---

## Privacidade (LGPD)

O único dado pessoal coletado é o **contato do organizador** no formulário de divulgação, usado apenas pela equipe para validar o evento e **nunca exibido publicamente** (ver política na `view eventos_publicos` e nas regras de RLS). O formulário exige consentimento explícito antes do envio.

---

## Licença e uso

Projeto acadêmico, sem fins lucrativos. As imagens em `public/img/` marcadas como fotografia são placeholders para a fase de análise e devem ser substituídas por material com autorização de uso antes de qualquer publicação oficial. As datas dos eventos de exemplo são ilustrativas.
