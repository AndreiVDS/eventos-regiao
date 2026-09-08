# Comparativo: Sympla × Eventos Região

Análise do Sympla (sympla.com.br, out/2026) para servir de **inspiração** — não
de cópia. O Sympla é uma plataforma comercial de bilheteria nacional; o Eventos
Região é uma vitrine curada e gratuita de eventos regionais. Vários itens abaixo
só fazem sentido se o projeto virar produto de verdade.

---

## 1. Localização

**Sympla**
- Seletor de localização **fixo no cabeçalho**, sempre visível, separado da busca.
- "Usar minha localização atual" (geolocalização → eventos perto de você).
- Campo com autocomplete para **qualquer cidade**.
- Lista rápida com ~12 capitais + "Todos os lugares".
- A cidade escolhida **fica salva** e é aplicada à busca e à home.
- Páginas de cidade (`/eventos/sao-paulo-sp`) com texto de SEO e trilhas próprias;
  troca de cidade no próprio título (H1).

**Eventos Região hoje**
- Não tem seletor global — cidade é só um `<select>` na página `/eventos`.
- Tem páginas de cidade (`/cidades/:slug`) com **identidade cultural** (isto é um
  diferencial: o texto do Sympla é genérico), mas fora do fluxo principal.
- Sem geolocalização, sem "perto de mim", sem autocomplete, sem persistência.

**O que dá para fazer**
- Seletor de cidade no cabeçalho, salvo no `localStorage`; home e `/eventos`
  passam a assumir essa cidade.
- "Perto de mim" com a Geolocation API do navegador (precisa de lat/long nas
  cidades; dá para começar só reconhecendo a cidade mais próxima).
- Manter a lista curada (as 16 cidades) + um campo de busca.
- Usar `/cidades/:slug` como página de destino de SEO (o conteúdo cultural já
  existe e é melhor que o do Sympla).

## 2. Busca e filtros

**Sympla** — Categoria, Data (chips "hoje / fim de semana / próxima semana" +
calendário de intervalo), Preço (Grátis/Pago), Tipo (presencial/online); ordenar
por Relevância; contagem de resultados; **3 escopos de busca: Eventos / Locais /
Produtores**; filtros na URL.

**Eventos Região** — busca por texto, cidade, categoria, entrada, período (4
opções fixas); filtros na URL ✓; contagem de resultados ✓. Falta: calendário de
intervalo, online/presencial, ordenação, busca por local/organizador, chips de
filtro ativo.

**O que dá para fazer**
- Seletor de **intervalo de datas** (ou ao menos "neste fim de semana" + escolher
  data). Ganho grande, custo baixo.
- Campo **Online / Presencial** (um enum + filtro) — muitos cursos e lives são online.
- Controle de **ordenação** (data mais próxima / recém-adicionados / nome).
- **Busca por organizador** (o campo `organizador_nome` já existe).
- Filtros ativos como **chips removíveis**.

## 3. Página do evento

**Sympla** — descrição rica, bloco de data/horário, mapa + endereço completo,
**cartão do organizador com "seguir" e outros eventos**, classificação etária,
política de cancelamento/reembolso, **"adicionar ao calendário"**, compartilhar,
eventos relacionados, caixa de ingressos com lotes e janela de venda
("Vendas até…", "Últimos ingressos", "Esgotado").

**Eventos Região** — descrição, data, mapa, horário, entrada, organizador, link
oficial, selo de "Encerrado" ✓. Falta: adicionar ao calendário, compartilhar,
eventos relacionados, classificação etária, página do organizador.

**O que dá para fazer (tudo sem back-end novo)**
- **"Adicionar ao calendário"** — gerar um arquivo `.ics` + link do Google
  Agenda. Pequeno e muito útil.
- **Compartilhar** — Web Share API / copiar link / WhatsApp. É literalmente o
  objetivo do projeto (divulgação).
- **Eventos relacionados** — "Mais em {cidade}" e "Mais de {categoria}".
- **Classificação etária** — um campo (livre / 16+ / 18+).
- **Página pública do organizador** (`/organizador/:slug`) com os eventos
  aprovados dele — reaproveita dados que já existem.

## 4. Compra / ingressos

**Sympla** — bilheteria completa: tipos de ingresso, lotes por data/quantidade,
**taxa de serviço** exibida à parte, cupom, checkout com dados do comprador e de
cada participante, pagamento (cartão/Pix/boleto), "Meus ingressos" com QR Code,
transferência, reembolso, lista de espera, app de check-in.

**Eventos Região** — não tem bilheteria; leva ao site oficial. É uma decisão de
escopo consciente.

**Recomendação honesta**
- Pagamento é um projeto enorme (PCI, gateway, taxas, reembolso, chargeback,
  fiscal, suporte). Não vale para o trabalho acadêmico e provavelmente não é o
  diferencial da plataforma.
- **Meio-termo com valor real, sem pagamento:**
  - **"Vou participar" (RSVP)** — botão gratuito de confirmação (com login). Dá
    número de presença para o organizador, gera engajamento e prova social
    ("32 pessoas confirmadas"). Baixo esforço, alto impacto, combina com evento
    comunitário.
  - **Lembrete** — "me avise 2 dias antes" (e-mail/push).
  - **Contagem regressiva** na página do evento.
  - Para eventos que vendem ingresso, manter o link externo, mas com CTA claro
    ("Ingressos no site oficial") e registrar o clique.
  - Se um dia quiser bilheteria de verdade: **integrar** um gateway existente
    (Mercado Pago / Pagar.me / Stripe), nunca construir do zero — e isso é
    decisão de negócio, não de código.

## 5. Expiração / ciclo de vida

**Sympla** — evento passado vira "Encerrado" (não vende, continua visível);
janela de venda por ingresso; some das listas de "próximos".

**Eventos Região** — já: filtro padrão esconde encerrados (`quando: 'futuros'`),
selo de "Encerrado", helper `eventoJaPassou()`. **Aqui o projeto está bem.**
Falta: uma visão de "Encerrados" e, para eventos recorrentes, o conceito de
"próxima edição".

**O que dá para fazer**
- Expor uma aba/seção **"Encerrados"** (a lógica já existe).
- Flag de **evento recorrente** + "próxima data prevista" (já insinuado nas
  descrições da Schützenfest, Parintins, etc.).

## 6. Home / descoberta

**Sympla** — trilhas curadas e personalizadas: "mais comprados nas últimas 24h",
"o que fazer no fim de semana", "vistos recentemente", "coleções" (pacotes
temáticos), carrossel de destaques; apps nativos.

**Eventos Região** — home limpa: herói + números + próximos eventos + cidades +
como funciona + CTA. Falta: trilha de fim de semana, "vistos recentemente",
coleções temáticas, "em destaque" editorial.

**O que dá para fazer**
- Trilha **"Neste fim de semana em {cidade}"** — só uma consulta.
- **"Vistos recentemente"** — `localStorage`, poucas linhas.
- **"Em destaque"** — um booleano que a equipe liga no painel → aparece na home.
  Curadoria editorial é a força de uma plataforma local.
- **Coleções temáticas** ("Festas típicas de SC", "Cultura afro-brasileira",
  "Agenda de inverno") — ótimo para o eixo de identidade cultural da proposta.

## 7. Acessibilidade

**Sympla** — widget flutuante de acessibilidade (tamanho de fonte, contraste,
leitura) + Audima (áudio).

**Eventos Região** — feito acessível desde a base (semântica, teclado, foco,
contraste, `prefers-reduced-motion`, ARIA, modo escuro). A base é mais sólida do
que um widget "por cima". Dá para adicionar um menuzinho visível de
acessibilidade (fonte +/-, alto contraste) como gesto, mas a fundação já é forte.

## 8. Outros

| Item | Sympla | Eventos Região |
|---|---|---|
| Consentimento de cookies (LGPD) | sim | precisa, se adicionar analytics |
| Chat de suporte | sim | não (link "Sobre" / repositório) |
| Apps nativos | iOS + Android | PWA instalável (suficiente) |
| "Meus ingressos" | sim | equivalente seria "favoritos" / "vou participar" |
| API pública | sim | **já tem** (`/api/eventos`) — ponto à frente do escopo |
| Curadoria | volume, automática | moderada, qualidade (combina com "valorizar o local") |

## O que o Eventos Região já faz melhor / diferente

- Conteúdo de **identidade cultural** por cidade (o do Sympla é genérico).
- **Curadoria e moderação** — qualidade acima de volume.
- **Gratuito** para organizadores, sem taxa de serviço.
- **API pública** já disponível.
- **Acessibilidade e modo escuro** de fábrica.
- Papéis (organizador/equipe) + **painel de métricas**.

## Roteiro sugerido (se for lançar de verdade)

**Ganhos rápidos (dias)**
1. Seletor de cidade no cabeçalho + persistência + "perto de mim".
2. "Adicionar ao calendário" + "Compartilhar" na página do evento.
3. "Eventos relacionados" + trilha "Neste fim de semana".
4. Ordenação + filtro de intervalo de datas + online/presencial.
5. Booleano "Em destaque" (curadoria editorial).
6. Visão "Encerrados".

**Médio prazo (semanas)**
7. "Vou participar" (RSVP) + contagem + lembretes (e-mail/push).
8. Páginas públicas de organizador + "seguir".
9. Coleções temáticas.
10. Consentimento de cookies + analytics básico.
11. Suporte a eventos recorrentes.

**Decisão de negócio (grande)**
12. Bilheteria real → **integrar** um gateway de pagamento, não construir. Só se
    houver caso de negócio claro.
