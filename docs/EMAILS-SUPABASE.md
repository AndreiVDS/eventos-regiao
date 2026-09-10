# E-mails de login (Supabase) — corrigir e deixar bonitos

Estes são os e-mails que o **Supabase** envia sozinho: confirmar conta, "esqueci a
senha", link mágico. O texto e o visual são editados **no painel do Supabase**
(nenhum código). Os e-mails de evento (novo / aprovado / recusado / contato) são
outros — esses saem da função `api/notificar.js` e já vêm prontos.

---

## 1. Corrigir o link quebrado do "esqueci a senha"

O link do e-mail está abrindo `localhost:3000` (**"Não é possível acessar esse
site"**). Isso é porque o Supabase ainda está com o endereço padrão de teste.

**Supabase → Authentication → URL Configuration:**

| Campo | Valor |
|---|---|
| **Site URL** | `https://eventos-regiao.vercel.app` |
| **Redirect URLs** | adicione `https://eventos-regiao.vercel.app/**` (com os dois asteriscos) |

Clique em **Save**. Peça um novo e-mail de redefinição e teste — agora o link
abre o site publicado e a troca de senha funciona.

> Enquanto estiver testando no seu PC, dá pra adicionar também
> `http://localhost:5173/**` na lista de Redirect URLs. Não atrapalha.

---

## 2. Traduzir e deixar os e-mails na identidade do site

**Supabase → Authentication → Emails** (ou **Email Templates**). Há uma aba por
tipo. Em cada uma, troque o **Subject** e cole o HTML abaixo no campo do corpo
(**Message body**). Salve cada aba.

O visual é o mesmo do site: cabeçalho preto, botão amarelo, rodapé creme. Cada
template já usa a variável certa do Supabase (`{{ .ConfirmationURL }}` etc.) —
**não apague as chaves entre `{{ }}`**.

### 2.1 Confirm signup — "confirmar cadastro"

**Subject:** `Confirme seu cadastro — Eventos Região`

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f7;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e6e3df;border-radius:14px;overflow:hidden;">
<tr><td style="background:#1f1e1f;padding:18px 28px;">
<span style="font-size:19px;font-weight:700;letter-spacing:.14em;color:#faf9f7;text-transform:uppercase;">Eventos&nbsp;Região</span>
</td></tr>
<tr><td style="padding:28px;color:#2b2a2b;font-size:15px;line-height:1.6;">
<h1 style="margin:0 0 12px;font-size:20px;color:#1f1e1f;">Falta só confirmar</h1>
<p style="margin:0 0 8px;">Obrigado por criar uma conta na Eventos Região. Clique no botão abaixo para confirmar o seu e-mail e ativar a conta.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr>
<td style="border-radius:10px;background:#f4b400;">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 26px;font-size:14px;font-weight:700;color:#1f1e1f;text-decoration:none;">Confirmar e-mail</a>
</td></tr></table>
<p style="margin:0;color:#6b6a6b;font-size:13px;">Se não foi você que se cadastrou, pode ignorar este e-mail com segurança.</p>
<p style="margin:12px 0 0;color:#6b6a6b;font-size:12px;word-break:break-all;">Ou copie e cole no navegador:<br>{{ .ConfirmationURL }}</p>
</td></tr>
<tr><td style="padding:16px 28px;background:#faf9f7;border-top:1px solid #e6e3df;color:#6b6a6b;font-size:12px;line-height:1.5;">
Eventos Região · Atividade Extensionista III · Engenharia de Software · UNINTER.
</td></tr>
</table></td></tr></table>
```

### 2.2 Reset password — "redefinir senha"

**Subject:** `Redefinir a sua senha — Eventos Região`

Pegue o bloco de cima e troque só o miolo (o `<td>` do meio):

```html
<td style="padding:28px;color:#2b2a2b;font-size:15px;line-height:1.6;">
<h1 style="margin:0 0 12px;font-size:20px;color:#1f1e1f;">Redefinir a sua senha</h1>
<p style="margin:0 0 8px;">Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para escolher uma nova. O link vale por 1 hora.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr>
<td style="border-radius:10px;background:#f4b400;">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 26px;font-size:14px;font-weight:700;color:#1f1e1f;text-decoration:none;">Criar nova senha</a>
</td></tr></table>
<p style="margin:0;color:#6b6a6b;font-size:13px;">Se você não pediu isso, ignore este e-mail — a sua senha continua a mesma.</p>
<p style="margin:12px 0 0;color:#6b6a6b;font-size:12px;word-break:break-all;">Ou copie e cole no navegador:<br>{{ .ConfirmationURL }}</p>
</td>
```

### 2.3 Magic Link — "entrar por link"

**Subject:** `Seu link de acesso — Eventos Região`

Miolo:

```html
<td style="padding:28px;color:#2b2a2b;font-size:15px;line-height:1.6;">
<h1 style="margin:0 0 12px;font-size:20px;color:#1f1e1f;">Entrar na Eventos Região</h1>
<p style="margin:0 0 8px;">Use o botão abaixo para entrar. O link vale por 1 hora e só pode ser usado uma vez.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr>
<td style="border-radius:10px;background:#f4b400;">
<a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 26px;font-size:14px;font-weight:700;color:#1f1e1f;text-decoration:none;">Entrar agora</a>
</td></tr></table>
<p style="margin:0;color:#6b6a6b;font-size:13px;">Se não foi você que pediu, ignore este e-mail.</p>
<p style="margin:12px 0 0;color:#6b6a6b;font-size:12px;word-break:break-all;">Ou copie e cole no navegador:<br>{{ .ConfirmationURL }}</p>
</td>
```

### 2.4 Change Email Address / Invite user (opcionais)

Mesmo bloco. Só ajuste a frase:

- **Change Email Address** — título `Confirmar o novo e-mail`, texto
  `Confirme que "{{ .NewEmail }}" passa a ser o e-mail da sua conta.`, botão
  `Confirmar novo e-mail`.
- **Invite user** — título `Você foi convidado`, texto
  `A equipe da Eventos Região convidou você para participar. Clique para criar a sua senha.`,
  botão `Aceitar convite`.

---

## 3. Ajustes finos (opcional)

- **Authentication → Emails → SMTP Settings → "Sender name"**: `Eventos Região`
  (é o nome que aparece na caixa de entrada).
- Mesma tela, **"Rate limits"**: o padrão do Supabase é baixo (poucos e-mails por
  hora). Com o SMTP do Gmail configurado dá pra aumentar um pouco, mas o Gmail
  tem teto de ~500/dia — suficiente para o projeto.
