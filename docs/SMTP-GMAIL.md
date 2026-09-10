# E-mail com o Gmail

Dois lugares usam e-mail. O Gmail cobre os dois de graça (limite ~500/dia).

---

## Passo 0 — criar a "senha de app" do Gmail

1. A conta precisa de **verificação em duas etapas** ativa
   (myaccount.google.com → Segurança → Verificação em duas etapas).
2. Depois, entre em **myaccount.google.com/apppasswords**.
3. Dê um nome ("Eventos Região") e **Criar**.
4. Copie os **16 caracteres** (sem espaços). É essa a senha usada abaixo — **não**
   é a senha normal do Gmail.

---

## Parte 1 — e-mails de login (confirmação de conta, "esqueci a senha")

Quem envia esses é o **Supabase**. Por padrão ele usa um remetente compartilhado
e limitado. Para usar o seu Gmail:

**Supabase → Project Settings → Authentication → SMTP Settings** (ou
Authentication → Emails → SMTP), ative "Enable Custom SMTP" e preencha:

| Campo | Valor |
|---|---|
| Sender email | seu e-mail do Gmail |
| Sender name | `Eventos Região` |
| Host | `smtp.gmail.com` |
| Port | `465` |
| Username | seu e-mail do Gmail (completo) |
| Password | a senha de app de 16 caracteres |

Salve. Pronto — nada de código.

> Dica: em **Authentication → URL Configuration**, confira que o "Site URL" é
> `https://eventos-regiao.vercel.app` e que `.../redefinir-senha` está na lista
> de "Redirect URLs" (para o link de trocar senha funcionar).

---

## Parte 2 — aviso de "evento aprovado / recusado"

Esse e-mail sai de uma função na **Vercel** (`api/notificar.js`), disparada
quando a equipe modera um evento. Basta adicionar 2 variáveis:

**Vercel → o projeto → Settings → Environment Variables**, adicione (para
Production, Preview e Development):

| Nome | Valor |
|---|---|
| `GMAIL_USER` | seu e-mail do Gmail (completo) |
| `GMAIL_APP_PASSWORD` | a senha de app de 16 caracteres |

Depois **Deployments → Redeploy** (ou faça um push qualquer) para a função pegar
as variáveis.

### Como funciona
- Quando a equipe clica **Aprovar** ou **Recusar** na Moderação, o site chama
  `/api/notificar`.
- A função confere que quem chamou é da equipe, pega o **contato do organizador**
  (campo "Contato" do formulário) e, **se for um e-mail**, manda a mensagem.
- Se o contato for um telefone, ou se as variáveis não estiverem configuradas,
  nada acontece — a moderação funciona igual.

---

## O que ainda NÃO manda e-mail (fica para depois)

- Lembrete "seu evento é daqui a 2 dias".
- "Novo evento na sua cidade".

Esses precisam de um agendador (pg_cron no Supabase) e de um cadastro de quem
quer receber. Dá para adicionar quando fizer sentido.
