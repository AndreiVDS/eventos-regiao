# Próximas melhorias — para revisar

Anotações depois da rodada de "localização + animações + revisão geral"
(set/2026). Ordenado por **impacto ÷ esforço**. Nada aqui é obrigatório para o
trabalho acadêmico — é o mapa para transformar em produto.

---

## O que entrou nesta rodada

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

---

## Alto impacto, baixo esforço (horas)

1. **Reverse geocode de verdade (bairro/cidade real).** Hoje mostramos "perto de
   {cidade cadastrada}". Um serviço grátis e sem chave (ex.: BigDataCloud
   client-side) daria "Você está em **Vila Nova, Jaraguá do Sul**" — a sensação
   de app de comida vem daí. Cair no nome da cidade mais próxima se a chamada
   falhar. Cuidado: é dependência de rede externa; documentar no LGPD.
2. **Chips de filtro ativo removíveis** (categoria, entrada, período, raio) acima
   da lista de eventos — hoje o usuário não vê num relance o que está filtrando.
3. **"Vistos recentemente"** na home (localStorage, ~30 linhas). Junto com o
   carrossel, deixa a home viva.
4. **Distância também na página do evento** e na página da cidade (`/cidades/:slug`),
   reaproveitando `distanciaAteSlug`.
5. **`lat`/`lng` do próprio evento** (não só da cidade). Hoje a distância é
   sempre da cidade; um evento num município vizinho sem cadastro fica sem chip.
   Adicionar colunas opcionais e usar quando existirem.
6. **Botão "Limpar filtros" sempre visível** quando há qualquer filtro (já existe,
   mas revisar em telas pequenas — hoje fica no fim do formulário).
7. **Ícone de "perto de mim" no card do topo do celular** abrir direto o GPS,
   sem passar pela lista de cidades.

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
