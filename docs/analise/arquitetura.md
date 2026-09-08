# Arquitetura — Eventos Região

## Visão geral

Aplicação **SPA (Single Page Application)** em React, servida como conteúdo estático pela Vercel, que conversa diretamente com o **Supabase** (banco PostgreSQL com API REST e autenticação gerenciadas). Não há servidor de aplicação próprio a manter.

```mermaid
graph TD
  subgraph Cliente -navegador / PWA-
    UI[React + React Router]
    SW[Service Worker -cache offline-]
    API[lib/api.js<br/>camada de dados]
    UI --> API
    UI --- SW
  end

  subgraph Vercel
    CDN[Arquivos estáticos<br/>HTML/CSS/JS + /dados/*.json]
  end

  subgraph Supabase
    PG[(PostgreSQL<br/>cidades, eventos)]
    REST[API REST automática]
    AUTH[Auth -e-mail/senha-]
    REST --> PG
  end

  UI -->|carrega app| CDN
  API -->|se .env configurado| REST
  API -->|modo demonstração| CDN
  UI -->|login do painel| AUTH
```

## Decisões e justificativas

| Decisão | Por quê |
|---|---|
| **SPA + estático na Vercel** | Deploy simples, gratuito, com preview por PR; nada de servidor para manter numa equipe de estudantes |
| **Supabase como back-end** | Entrega "API de verdade" (REST + Auth + Postgres) sem escrever/hospedar servidor; plano gratuito; regras de acesso declarativas (RLS) |
| **Camada `lib/api.js`** | Isola o resto do código do back-end. Permite rodar 100% offline com `public/dados/*.json` para desenvolvimento e demonstração, e trocar para o Supabase só com variáveis de ambiente |
| **Tailwind CSS** | Padrões de espaçamento/cor consistentes, sem CSS global frágil; classes utilitárias facilitam manter contraste e responsividade |
| **PWA (vite-plugin-pwa)** | Requisito RF13: instalável e utilizável com internet ruim, comum no interior |
| **Filtros na URL** | Links de busca compartilháveis; histórico do navegador funciona |

## Modelo de dados

```mermaid
erDiagram
  CIDADES ||--o{ EVENTOS : "tem"

  CIDADES {
    text slug PK
    text nome
    text uf
    text regiao
    text descricao
    text imagem_url
    text site_prefeitura
  }

  EVENTOS {
    uuid id PK
    text titulo
    text descricao
    text descricao_completa
    text categoria
    text cidade FK
    text cidade_nome
    text uf
    text local
    text endereco
    date data_inicio
    date data_fim
    text horario
    text entrada
    text preco_texto
    text imagem_url
    text link_oficial
    text organizador_nome
    text organizador_contato
    text status
    timestamptz criado_em
  }
```

- `categoria` ∈ {cultura, esporte, comunitario, educacao, negocios, gastronomia}
- `entrada` ∈ {gratuito, pago, misto}
- `status` ∈ {pendente, aprovado, recusado}

## Segurança (RLS no Supabase)

| Operação | Quem pode | Regra |
|---|---|---|
| Ler cidades | qualquer um | `select` liberado |
| Ler eventos | qualquer um | apenas `status = 'aprovado'` |
| Inserir evento | qualquer um | somente com `status = 'pendente'` |
| Ler todos os eventos / atualizar | equipe autenticada | `to authenticated` |
| Gerenciar cidades | equipe autenticada | `to authenticated` |

O contato do organizador fica fora da `view eventos_publicos`, usada para leitura pública.

## Fluxo de deploy

```mermaid
sequenceDiagram
  participant Dev as Integrante
  participant GH as GitHub
  participant VC as Vercel
  participant U as Usuário

  Dev->>GH: git push (branch principal)
  GH->>VC: webhook
  VC->>VC: npm install && npm run build
  VC->>VC: publica dist/ na CDN
  VC-->>U: nova versão no ar (mesma URL)
  Note over Dev,VC: Pull request gera URL de preview isolada
```

## Evoluções previstas (pós-análise)

- Substituir imagens placeholder por material autorizado.
- Área do organizador (login) para acompanhar o status do evento.
- Favoritos e lembretes (exigiria conta de usuário).
- Painel com métricas (eventos por cidade, por mês).
- Internacionalização de datas por fuso configurável.
