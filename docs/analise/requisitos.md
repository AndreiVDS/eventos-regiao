# Requisitos — Eventos Região

Documento da fase de **Análise** (Atividade Extensionista III).

## 1. Problema

Eventos culturais, esportivos e comunitários de cidades do interior são divulgados de forma fragmentada (cartazes, stories, grupos de WhatsApp, sites de prefeitura). Moradores perdem eventos por falta de informação; turistas não encontram uma agenda confiável; e pequenos organizadores não têm um canal gratuito e organizado de divulgação. Isso limita a participação cultural e a renda gerada em torno desses eventos.

## 2. Público-alvo (personas)

| Persona | Descrição | Necessidade principal |
|---|---|---|
| **Moradora — Ana, 34** | Mora em Jaraguá do Sul, sai com a família nos fins de semana | Ver rapidamente o que tem para fazer nos próximos dias, filtrando por gratuito |
| **Turista — Carlos, 45** | Vai passar uma semana em Santa Catarina | Descobrir eventos típicos da região no período da viagem |
| **Organizador pequeno — Marta, 52** | Coordena uma feira de artesanato mensal | Divulgar a feira sem custo e alcançar gente de fora do bairro |
| **Equipe da plataforma — o grupo** | Estudantes que mantêm o projeto | Revisar e publicar os eventos enviados, manter as cidades |

## 3. Requisitos Funcionais (RF)

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | Listar eventos aprovados, ordenados por data | Alta |
| RF02 | Filtrar eventos por texto (nome, local, cidade) | Alta |
| RF03 | Filtrar eventos por cidade, categoria, tipo de entrada e período | Alta |
| RF04 | Exibir a página de detalhe de um evento (descrição, local, mapa, horário, entrada, link oficial) | Alta |
| RF05 | Listar as cidades participantes com sua identidade cultural | Média |
| RF06 | Exibir a agenda de uma cidade específica | Média |
| RF07 | Permitir que qualquer pessoa envie um evento por formulário | Alta |
| RF08 | Validar os dados do formulário antes do envio | Alta |
| RF09 | Registrar o evento enviado com status "pendente" | Alta |
| RF10 | Autenticar a equipe para acesso ao painel | Alta |
| RF11 | Listar, aprovar e recusar eventos pendentes no painel | Alta |
| RF12 | Não exibir publicamente o contato do organizador | Alta |
| RF13 | Funcionar como PWA instalável e com cache offline básico | Média |
| RF14 | Marcar visualmente eventos já encerrados | Baixa |

## 4. Requisitos Não Funcionais (RNF)

| ID | Requisito |
|---|---|
| RNF01 | **Acessibilidade:** navegação por teclado, foco visível, contraste adequado (WCAG 2.1 AA como meta), textos alternativos, estrutura semântica, respeito a `prefers-reduced-motion` |
| RNF02 | **Responsividade:** uso pleno em telas de 320 px a desktop, sem rolagem horizontal |
| RNF03 | **Desempenho:** primeira carga leve; imagens otimizadas; meta Lighthouse ≥ 90 em Performance e Acessibilidade |
| RNF04 | **Portabilidade:** roda em qualquer navegador moderno; instalável no Android/desktop |
| RNF05 | **Privacidade (LGPD):** coleta mínima de dados pessoais, consentimento explícito, dado de contato restrito à equipe |
| RNF06 | **Manutenibilidade:** código em português, camada de dados isolada, sem segredo no repositório |
| RNF07 | **Disponibilidade:** hospedagem com deploy automático e possibilidade de operar em modo somente-leitura com dados locais |
| RNF08 | **Segurança:** regras de acesso no banco (RLS) — leitura pública só de aprovados; moderação só autenticada |
| RNF09 | **SEO / compartilhamento:** título, descrição e Open Graph em cada página |

## 5. Fora de escopo (nesta fase)

- Venda de ingressos e pagamentos.
- Conta e área logada para o organizador acompanhar o evento.
- Aplicativo nativo publicado nas lojas.
- Notificações push e favoritos por usuário.
- Moderação colaborativa / múltiplos papéis de equipe.

## 6. Regras de negócio

- **RN01:** todo evento enviado entra como `pendente`; só aparece na agenda após virar `aprovado`.
- **RN02:** a data final, quando informada, não pode ser anterior à data de início.
- **RN03:** um evento é considerado "encerrado" quando a data final (ou de início, se não houver final) é anterior à data atual.
- **RN04:** o filtro padrão da agenda mostra apenas eventos que ainda não terminaram.
- **RN05:** o contato do organizador nunca é retornado em endpoints públicos.
