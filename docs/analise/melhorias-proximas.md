# Próximas melhorias — para revisar

Anotações das rodadas de "localização + animações + revisão geral" (set/2026).
Ordenado por **impacto ÷ esforço**. Nada aqui é obrigatório para o trabalho
acadêmico — é o mapa para transformar em produto.

---

## Como a distância é calculada (a dúvida do "5 km de mim")

Antes: a distância era medida do seu GPS até o **centro da cidade**. Por isso,
mesmo estando em Jaraguá do Sul, aparecia "~5 km de Jaraguá do Sul" — 5 km era a
distância até o marco central, não até o evento.

Agora: **cada evento tem a coordenada do próprio local** (a rua/venue). A
distância é `haversine(sua posição do GPS, local do evento)`. Dois eventos na
mesma cidade mostram números diferentes; duas pessoas em bairros diferentes veem
números diferentes para o mesmo evento — que era o que faltava.

- Os 27 eventos de exemplo têm coordenadas em `scripts/coordenadas-eventos.json`.
- Eventos **novos** (formulário) são geocodificados no navegador de quem cadastra,
  via Nominatim/OpenStreetMap (`src/lib/geocode.js`). Se falhar, o evento entra
  sem coordenada e a distância cai no centro da cidade (com "~" e aviso).
- O GPS agora usa `enableHighAccuracy` e a posição é arredondada para ~110 m
  (antes ~1 km). O popover mostra a precisão informada pelo aparelho.

## "As cidades são cadastradas na mão?"

Sim — as 16 cidades ficam em `scripts/dados.mjs` (é curadoria: cada uma tem
página cultural própria, imagem, região). Adicionar uma são ~4 linhas + rodar
`npm run gerar-dados`. **Mas** a distância não depende mais desse cadastro estar
"centrado" certo — ele virou só um atalho de navegação/filtro. Ideias para não
depender de manutenção manual:
- Derivar a lista de cidades dos **eventos aprovados** (uma cidade "aparece"
  quando tem evento), mantendo as 16 curadas como destaque.
- Cadastro de cidade no painel da equipe (formulário), em vez de editar código.
- Buscar a cidade por CEP/autocomplete no formulário de evento.

---

## O que já entrou

**Localização ("perto de mim") no nível de app de comida/eventos**
- Convite discreto ("Ver o que está rolando perto de você") na home e na página
  de eventos — some sozinho depois de usar ou dispensar (`ChamadaLocalizacao`).
- Estado da permissão tratado de verdade (`usePermissaoGeo`): se estiver
  **bloqueada**, o site não fica pedindo — explica como reativar no cadeado.
- Erros com mensagem humana (negado / indisponível / demorou demais).
- Detecção da cidade pelo GPS + **raio de busca** (30 / 60 / 150 / 500 km /
  qualquer), salvo junto da posição.
- Distância em **todo card** (chip com pin), ordenação "Mais perto de você" e,
  quando não há cidade fixa, ela vira o padrão.
- Fora da área de cobertura (120 km): não força cidade nenhuma, mostra tudo do
  mais perto para o mais longe.
- Correção: com o Supabase ligado a ordenação por distância e o raio **não
  estavam sendo aplicados** (o `origem` não era repassado). Agora são.

**Animações**
- Curva única do site (`--mola`), variações de "revelar" (esquerda / direita /
  escala), transição suave a cada troca de página.
- Carrossel: troca automática a cada 5 s, **barra de progresso** do slide,
  Ken Burns no fundo, entrada escalonada do texto, **arrastar no celular**,
  botão de **pausar** (exigência de acessibilidade), alvo de toque maior nos
  pontos. Tudo desligado em `prefers-reduced-motion`.
- Popover de cidade, menu do celular e banner de cookies agora entram animados.
- Botões primários com leve elevação no hover; rodinha de carregamento.

**Mobile**
- Seletor de cidade saiu de dentro do menu e foi para a barra do topo (padrão
  dos apps de localização); o nome "Eventos Região" recolhe em telas bem
  estreitas para caber tudo.

**Rodada 2 — precisão, mapa e visual**
- Distância **por local do evento** (ver seção acima). Colunas `lat`/`lng` na
  tabela `eventos` + geocodificação no envio.
- **Mapa** (Leaflet + OpenStreetMap, sem chave) na página de eventos: aba
  "Lista / Mapa", pino da pessoa + pinos dos eventos, popup com distância e link.
  Só é baixado ao abrir a aba (chunk separado).
- Paleta com mais profundidade: fundo creme mais quente, sombras em camadas
  (`shadow-suave/media/alta`), foco com anel, botão primário com gradiente.
- Barra de progresso de rolagem no topo; título de seção com traço que "cresce";
  aurora suave no herói; chips do herói entram escalonados; cartões com brilho
  âmbar no hover.
- `React Router` future flags ligadas (some o warning do console).

---

## Alto impacto, baixo esforço (horas)

1. **Reverse geocode do bairro.** Hoje o rótulo é "Perto de mim" / nome da cidade.
   Um serviço grátis e sem chave (ex.: BigDataCloud client-side, ou o próprio
   Nominatim `reverse`) daria "Você está em **Vila Nova, Jaraguá do Sul**". Cair
   no nome da cidade se falhar. Documentar no LGPD (já há a seção "Serviços
   externos").
2. **Chips de filtro ativo removíveis** (categoria, entrada, período, raio) acima
   da lista — hoje não dá pra ver num relance o que está filtrando.
3. **"Vistos recentemente"** na home (localStorage, ~30 linhas).
4. **Distância na página do evento** e na página da cidade, reaproveitando
   `distanciaAteEvento`.
5. **Rever as coordenadas dos 27 eventos** — foram colocadas à mão com boa
   aproximação; algumas (eventos "em vários locais") apontam pro centro. Passar o
   `scripts/geocode` uma vez para refinar.
6. **Aba "Mapa" abrir já com um raio aplicado** quando a pessoa tem localização,
   pra não mostrar o Brasil inteiro.
7. **Ícone de "perto de mim" no topo do celular** abrindo o GPS direto.

## Impacto médio (dias)

8. **Página pública do organizador** (`/organizador/:slug`) com os eventos
   aprovados dele + botão "seguir" (localStorage no começo). Está no comparativo
   do Sympla e reaproveita `organizador_nome`.
9. **Coleções temáticas** ("Festas típicas de SC", "Agenda de inverno",
   "Cultura afro-brasileira") — casa com o eixo de identidade cultural da
   proposta. Um JSON de curadoria + uma rota `/colecoes/:slug`.
10. **Lembrete de evento** ("me avise 2 dias antes") — começa com
    "adicionar ao calendário" (já existe) + e-mail quando o SMTP entrar.
11. **Mapa com os eventos próximos** (Leaflet + OpenStreetMap, sem chave) na
    página de eventos quando a localização está ativa — pino do usuário + pinos
    dos eventos. É o que fecha a comparação com os apps de localização.
12. **Skeleton específico por página** (evento, cidade) — hoje só a lista tem.
13. **Animação de entrada dos números** já existe; falta o mesmo carinho nos
    gráficos do painel (barras subindo).
14. **`v7_startTransition` / `v7_relativeSplatPath`** do React Router — dois
    warnings no console. Ativar as flags agora evita dor no upgrade.

## Decisão de produto (semanas)

15. **Eventos recorrentes de verdade** (a Schützenfest, Parintins etc. são
    "toda edição"). Modelo de "série" + "próxima data". Hoje é texto na descrição.
16. **Notificações push** (o PWA já permite) para "novo evento na sua cidade".
17. **Analytics primeira-parte** (Plausible self-host / Umami) — sem cookie de
    terceiro, respeitando o banner de LGPD que já existe.
18. **Bilheteria**: continuar levando ao site oficial. Se um dia precisar,
    **integrar** Mercado Pago / Pagar.me — nunca construir. É decisão de negócio.

## Revisão fina (polimento)

- **Contraste do chip de distância** no tema claro sobre card branco — conferir
  no Lighthouse (usa `bg-destaque/15`).
- **`prefers-reduced-motion`**: testar de fato com a opção ligada no SO — o
  carrossel deve ficar 100 % estático e navegável só pelos botões (implementado,
  falta um olhar humano).
- **Foco visível** dentro do popover de cidade ao abrir (mandar o foco para o
  campo de busca).
- **`aria-live`** na contagem de resultados de `/eventos` (muda sem recarregar).
- **Imagens**: os banners SVG têm o título "queimado" na arte — por isso o fundo
  do carrossel entra borrado. Se um dia entrarem fotos reais, dá para mostrar a
  arte nítida e a home fica bem mais bonita.
- **Teste em 320 px** (iPhone SE) — o formulário de filtros e o carrossel.
- **`touch-action`** no carrossel: hoje é `touch-pan-y`; conferir se não
  atrapalha o scroll vertical em celulares Android.
