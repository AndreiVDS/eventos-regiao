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

Uma aplicação web que **centraliza a divulgação de eventos** culturais, esportivos e comunitários de diferentes regiões do Brasil, com três experiências:

| Público | O que faz | Onde |
|---|---|---|
| **Visitante** (turista / morador) | Descobre eventos com busca e filtros por cidade, categoria, data e entrada; explora cidades e sua identidade cultural | `/`, `/eventos`, `/cidades` |
| **Organizador** | Cria conta, cadastra eventos (gratuito, passam por revisão) e acompanha o status em "Meus eventos", com indicadores | `/entrar`, `/organizador` |
| **Equipe** | Modera os eventos enviados e acompanha as métricas da plataforma (por cidade, categoria, estado e mês) | `/painel` |

A plataforma é um **PWA** (Progressive Web App): funciona no celular, pode ser instalada como aplicativo e abre mesmo com internet instável. Também expõe uma **API pública** (`/api`) para que outros sites reutilizem a agenda.

## Como isso responde à proposta

| Objetivo da proposta | Onde aparece no sistema |
|---|---|
| Centralizar informações de eventos de várias regiões | **Agenda** com 27 eventos reais em 16 cidades / 9 estados |
| Nova opção de divulgação para organizadores | **Área do organizador** + fila de moderação |
| Estimular turismo e economia local | Páginas de **cidade** com identidade cultural; destaque a eventos gratuitos; métricas por região |
| Interface acessível e intuitiva | Base semântica, navegação por teclado, foco visível, contraste, textos alternativos, `prefers-reduced-motion` |
| Engajar a comunidade no uso da tecnologia | Cadastro simples, API aberta, material em `docs/` |
| Fortalecer pertencimento e identidade cultural | Descrições culturais por cidade; categorias que valorizam o local |

---

## Tecnologias

- **Front-end:** React 18 + Vite 5 + React Router
- **Estilo:** Tailwind CSS 3
- **PWA:** vite-plugin-pwa (Workbox)
- **Back-end / API:** [Supabase](https://supabase.com) (PostgreSQL + API REST automática + Auth)
- **API pública:** funções serverless em `/api` (Vercel)
- **Hospedagem:** Vercel

> A aplicação roda **sem back-end** para demonstração: enquanto as variáveis do Supabase não estão configuradas, os dados vêm de `public/dados/*.json`, o login usa uma sessão local e os envios ficam no navegador.

---

## Rodando localmente

Pré-requisitos: **Node.js 18+**.

```bash
npm install
npm run dev          # http://localhost:5173
```

Outros comandos:

```bash
npm run build        # regenera os dados e gera a versão de produção em dist/
npm run preview      # serve o dist/ localmente
npm run lint         # ESLint
npm run gerar-dados  # regenera public/dados/*.json, supabase/seed.sql,
                     # api/_dados.json e os SVGs de cidades/eventos
```

Os dados de exemplo têm **uma fonte única**: `scripts/dados.mjs`. Edite lá e rode `npm run gerar-dados`.

---

## Conectando o back-end (Supabase)

1. Crie um projeto em <https://supabase.com>.
2. No **SQL Editor**, rode `supabase/schema.sql` (tabelas + políticas de segurança RLS) e, opcionalmente, `supabase/seed.sql` (dados de exemplo).
3. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**.
4. Crie um arquivo `.env` na raiz (baseado em `.env.example`):

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_ADMIN_EMAILS=voce@exemplo.com,colega@exemplo.com
   ```

5. Em **Authentication → Users**, crie os usuários da equipe. Adicione os mesmos e-mails:
   - na tabela `public.equipe` (bloco comentado no fim do `schema.sql`);
   - na variável `VITE_ADMIN_EMAILS`.
   Quem estiver nessa lista entra como **equipe**; qualquer outro e-mail entra como **organizador**.
6. Reinicie o `npm run dev`.

---

## API pública

Endpoints de leitura, com CORS liberado e cache na borda. Úteis para outros sites da região embutirem a agenda.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/eventos` | Eventos aprovados. Filtros: `cidade`, `uf`, `categoria`, `entrada`, `busca`, `de`, `ate`, `limite` |
| `GET` | `/api/eventos/:id` | Um evento pelo slug |
| `GET` | `/api/cidades` | Cidades + contagem de eventos |

```bash
curl "https://SEU-DOMINIO.vercel.app/api/eventos?uf=SC&categoria=cultura&limite=5"
```

As funções leem do Supabase quando configurado; caso contrário, de `api/_dados.json` (gerado no build).

---

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Em <https://vercel.com>, **New Project → Import** o repositório. A Vercel detecta o Vite (build `npm run build`, saída `dist`) e serve `/api` como funções.
3. Em **Settings → Environment Variables**, adicione `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_ADMIN_EMAILS`.
4. Cada `git push` na branch principal gera um deploy; pull requests ganham uma URL de preview.
5. Domínio próprio: **Settings → Domains**.

---

## Estrutura do projeto

```
├── api/                     # funções serverless (API pública) + _dados.json (gerado)
├── public/
│   ├── dados/               # eventos.json / cidades.json (gerados)
│   ├── img/cidades/         # postais SVG das cidades (gerados)
│   ├── img/eventos/         # banners SVG de eventos sem foto (gerados)
│   └── icones/              # ícones do PWA
├── scripts/
│   ├── dados.mjs            # FONTE ÚNICA dos dados de exemplo
│   └── gerar-dados.mjs      # gera JSON, SQL e SVGs
├── src/
│   ├── componentes/         # Cabeçalho, CardEvento, FormularioEvento, gráficos, ...
│   ├── paginas/
│   │   ├── organizador/     # MinhaArea, NovoEvento
│   │   └── painel/          # Painel (métricas), Moderacao
│   ├── lib/
│   │   ├── api.js           # camada de dados (Supabase OU JSON local)
│   │   ├── auth.jsx         # AuthProvider / useAuth
│   │   ├── metricas.js      # agregações do painel
│   │   ├── formatacao.js    # datas, categorias, rótulos
│   │   └── useAsync.js
│   ├── App.jsx              # rotas + guardas de rota
│   └── index.css            # Tailwind + acessibilidade
├── supabase/
│   ├── schema.sql           # tabelas, RLS, função is_equipe()
│   └── seed.sql             # dados de exemplo (gerado)
├── docs/
│   ├── proposta-de-tema.pdf
│   └── analise/             # requisitos, casos de uso, arquitetura
└── legado/                  # primeira versão estática (histórico)
```

---

## Acessibilidade

HTML semântico, um `<h1>` por página, link "pular para o conteúdo", foco visível (`:focus-visible`), menu operável por teclado (`aria-expanded`/`aria-controls`), rótulos associados a todos os campos, erros com `role="alert"`, textos alternativos em imagens informativas e `alt=""` nas decorativas, gráficos com tabela equivalente, respeito a `prefers-reduced-motion`, contraste conferido na paleta.

Como testar: **Lighthouse** (aba Acessibilidade) e a extensão **axe DevTools**. Guarde os relatórios em `docs/analise/`.

## Privacidade (LGPD)

O único dado pessoal coletado é o **contato do organizador**, usado apenas pela equipe para validar o evento e **nunca exibido publicamente** (fora da `view eventos_publicos` e das regras de RLS). O formulário exige consentimento explícito.

## Licença e uso

Projeto acadêmico, sem fins lucrativos. As imagens fotográficas em `public/img/` são placeholders da fase de análise e devem ser substituídas por material com autorização de uso antes de qualquer publicação oficial. As datas de edições ainda não confirmadas estão marcadas como "prevista" nas descrições.
