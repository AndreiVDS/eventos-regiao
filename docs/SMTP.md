# E-mail (SMTP)

Dois lugares usam e-mail:

| Onde | O quê | Quem envia |
|---|---|---|
| **Login** | confirmação de conta, "esqueci a senha" | Supabase (config no dashboard) |
| **Moderação** | "seu evento foi aprovado / recusado" | função `api/notificar.js` na Vercel |

Use **um** provedor SMTP para os dois. Duas opções abaixo.

---

## Opção A — Gmail

### Senha de app
1. A conta precisa de **verificação em 2 etapas** ativa **com telefone (SMS) ou
   Google Authenticator** — só passkey não basta.
   `myaccount.google.com/signinoptions/two-step-verification`
2. `myaccount.google.com/apppasswords` → criar → copiar os **16 caracteres**.

> **"A configuração não está disponível para sua conta"** = a 2ª etapa não está
> ativa, ou está só com passkey. Adicione SMS/Authenticator e tente de novo. Se
> ainda assim não aparecer (Proteção Avançada / conta Workspace com política),
> use a **Opção B**.

### Valores
| | |
|---|---|
| Host | `smtp.gmail.com` |
| Port | `465` |
| Usuário | seu e-mail do Gmail (completo) |
| Senha | a senha de app de 16 caracteres |

---

## Opção B — Brevo (grátis, 300 e-mails/dia, sem domínio)

1. Crie conta em **brevo.com** e confirme seu e-mail.
2. Menu do perfil → **SMTP & API** → aba **SMTP**.
3. Anote o **Login** (algo como `xxxx@smtp-brevo.com`) e gere uma **SMTP Key**.

### Valores
| | |
|---|---|
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Usuário | o Login do SMTP do Brevo |
| Senha | a SMTP Key |
| Remetente | um e-mail seu **verificado** no Brevo (Senders) |

---

## Parte 1 — e-mails de login (Supabase → dashboard)

**Supabase → Project Settings → Authentication → SMTP Settings** → ative
"Enable Custom SMTP" e preencha com os valores do provedor escolhido
(Host / Port / Username / Password). Em "Sender name" ponha `Eventos Região`.
Salve. Sem código.

> Em **Authentication → URL Configuration**: "Site URL" =
> `https://eventos-regiao.vercel.app` e `https://eventos-regiao.vercel.app/**`
> nas "Redirect URLs" — **sem isso o link do "esqueci a senha" abre
> `localhost:3000` e não funciona.**

Para traduzir e estilizar esses e-mails (confirmar conta, redefinir senha, link
mágico), veja **`docs/EMAILS-SUPABASE.md`**.

---

## Parte 2 — aviso de aprovação/recusa (Vercel → Environment Variables)

**Vercel → o projeto → Settings → Environment Variables** (Production, Preview e
Development):

| Nome | Valor |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` ou `smtp-relay.brevo.com` |
| `SMTP_PORT` | `465` (Gmail) ou `587` (Brevo) |
| `SMTP_USER` | usuário do SMTP |
| `SMTP_PASS` | senha de app / SMTP key |
| `SMTP_FROM` | (opcional) e-mail remetente exibido |
| `EQUIPE_EMAILS` | e-mails da equipe que recebem os avisos, separados por vírgula (ex.: `voce@gmail.com,fulano@gmail.com,ciclano@gmail.com`). Se não preencher, usa `VITE_ADMIN_EMAILS`. |

Depois **Deployments → Redeploy**.

### O que dispara e-mail

| Momento | Vai para |
|---|---|
| Organizador **envia** um evento | equipe ("novo p/ moderar") + recibo pro organizador |
| Equipe **aprova** | organizador ("publicado") + cópia pra equipe |
| Equipe **recusa** | organizador (com o motivo) + cópia pra equipe |
| Alguém usa o **formulário de contato** | equipe |

Tudo é **melhor esforço**: o site chama `/api/notificar` em segundo plano. Se o
SMTP não estiver configurado, ou o contato do organizador for um telefone em vez
de e-mail, nada é enviado e a ação (enviar / moderar) funciona igual. O HTML dos
e-mails está em `api/_email.js`.

> Os avisos de "evento novo" e "contato" não exigem login (quem dispara é o
> visitante). O conteúdo é escapado e truncado; no limite, alguém consegue forçar
> alguns e-mails de aviso à equipe. Para a escala do projeto tudo bem — se virar
> incômodo, trocar por verificação com a *service-role key* do Supabase.

---

## Ainda sem e-mail (fica para depois)

- Lembrete "seu evento é daqui a 2 dias".
- "Novo evento na sua cidade".

Precisam de agendador (pg_cron no Supabase) + cadastro de quem quer receber.
