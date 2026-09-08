# Guia de publicação (para quem nunca fez)

Explicação sem pressa de como sair do "rodei no meu PC" para "tem um site no ar".

---

## 1. `npm run dev` roda o site?

Roda — **mas só no seu computador**, no endereço `http://localhost:5173`.

- Serve para **desenvolver e testar**.
- Só funciona enquanto o terminal está aberto.
- Ninguém de fora acessa (`localhost` = "esta máquina").

Para ter um endereço que qualquer pessoa abre a qualquer hora (ex.: `https://eventos-regiao.vercel.app`), é preciso **publicar** (fazer *deploy*) o site num serviço de hospedagem. Usamos a **Vercel**.

A Vercel pega o código do GitHub, monta o site (`npm run build`) e coloca no ar. A cada `git push` no `main`, ela atualiza sozinha.

---

## 2. Os dois modos do site

O site decide sozinho qual usar:

| | **Modo demonstração** (sem Supabase) | **Modo completo** (com Supabase) |
|---|---|---|
| Eventos | 27 exemplos de um arquivo fixo | de um banco de dados real |
| Login | fake, só no navegador (botões "entrar como…") | contas de verdade (e-mail e senha) |
| Enviar evento | salvo só no navegador | salvo no banco, entra na fila de moderação |
| Serve para apresentar o trabalho? | **Sim** — mostra todas as telas | Sim, e ainda é "real" |

**Para a entrega, o modo demonstração publicado na Vercel já basta.** O Supabase é o passo extra.

---

## 3. O que é o Supabase

Pense no site como uma **loja**:

- vitrine, prateleiras, balcão → o **site** (o que a Vercel publica)
- estoque, caixa e cadastro de funcionários → o **Supabase**

O Supabase (site: <https://supabase.com>) dá, de graça e sem instalar nada:

- um **banco de dados** (guarda eventos e cidades)
- um **sistema de login** pronto
- uma **API** automática para o site ler/gravar

Sem ele: eventos vêm de um arquivo, login é de brincadeira. Com ele: organizador cria conta, cadastra evento, e o evento fica guardado até a equipe aprovar.

---

## 4. O que são "variáveis de ambiente"

O código **não** guarda o endereço nem a chave do seu Supabase (seria inseguro — está tudo público no GitHub). O site **lê essas informações de fora**, de configurações chamadas *variáveis de ambiente*.

São 3:

| Variável | O que é | Onde pegar |
|---|---|---|
| `VITE_SUPABASE_URL` | endereço do seu projeto Supabase | Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | chave pública de acesso | Supabase → Settings → API |
| `VITE_ADMIN_EMAILS` | e-mails que entram como **equipe** | você escolhe (os de vocês 3) |

Onde elas ficam:

- **no seu PC:** num arquivo `.env` na pasta do projeto (**não** vai para o GitHub, de propósito — o `npm run setup` cria ele para você)
- **na Vercel:** num painel de configurações do projeto

Sem as variáveis, o site entra em modo demonstração — sem erro.

---

## 5. Passo a passo A — publicar na Vercel (~5 min, sem Supabase)

Faça isto primeiro.

1. Deixe o repositório **público**: GitHub → repo `eventos-regiao` → aba **Settings** → seção **Danger Zone** (fim da página) → **Change visibility** → **Public** → confirmar.
2. Abra <https://vercel.com> → **Sign Up** → **Continue with GitHub**.
3. Painel da Vercel → **Add New… → Project**.
4. Na lista de repositórios, ache **eventos-regiao** → **Import**.
5. A Vercel reconhece que é Vite. **Não mude nada.** Pode ignorar "Environment Variables" agora.
6. **Deploy**. Espere ~1 minuto.
7. Aparece um link tipo `https://eventos-regiao.vercel.app`. **É o site no ar** — abra no celular.

A cada `git push` no `main`, atualiza sozinho. Domínio próprio: projeto → **Settings → Domains**.

---

## 6. Passo a passo B — ligar o Supabase (~10 min, opcional)

Faça depois que a Vercel já estiver no ar.

### B1. Criar o projeto

1. <https://supabase.com> → **Start your project** → entrar com GitHub.
2. **New project**:
   - **Name**: `eventos-regiao`
   - **Database Password**: clique em **Generate a password** e **guarde** num bloco de notas (não dá para recuperar depois).
   - **Region**: **South America (São Paulo)**.
3. **Create new project** → espere ~2 min.

### B2. Criar tabelas e dados

1. Menu lateral → **SQL Editor** → **+ New query**.
2. Abra o arquivo **`supabase/setup.sql`** do projeto, selecione tudo (Ctrl+A), copie.
3. Cole na caixa e clique em **Run** (ou Ctrl+Enter).
4. Deve aparecer **Success**. Criou as tabelas `cidades`, `eventos`, `equipe` e inseriu os 27 eventos de exemplo.

### B3. Criar os usuários da equipe

1. Menu lateral → **Authentication** → **Users** → **Add user** → **Create new user**.
2. E-mail + senha (mínimo 6 caracteres). **Deixe "Auto Confirm User" marcado.**
3. Repita para os 3 integrantes.

### B4. Dizer quem é "equipe"

1. **SQL Editor** → **New query**.
2. Cole, **trocando pelos e-mails reais**:
   ```sql
   insert into public.equipe (email) values
     ('andreivini31@gmail.com'),
     ('gabriel-l@exemplo.com'),
     ('gabriel-a@exemplo.com')
   on conflict do nothing;
   ```
3. **Run**. Esses e-mails entram no `/painel`; qualquer outro entra como organizador.

### B5. Pegar a URL e a chave

1. Menu lateral → **Settings** (engrenagem) → **API**.
2. Copie:
   - **Project URL** → será o `VITE_SUPABASE_URL`
   - Em **Project API keys**, a chave **`anon` `public`** → será o `VITE_SUPABASE_ANON_KEY`

### B6. Colocar as variáveis na Vercel

1. Vercel → projeto **eventos-regiao** → **Settings** → **Environment Variables**.
2. Adicione uma a uma (Key = nome, Value = valor):
   - `VITE_SUPABASE_URL` = a Project URL
   - `VITE_SUPABASE_ANON_KEY` = a chave anon
   - `VITE_ADMIN_EMAILS` = `andreivini31@gmail.com,gabriel-l@exemplo.com,gabriel-a@exemplo.com` (mesmos do B4, vírgula, sem espaço)
3. **Save**.
4. Aba **Deployments** → menu (•••) do deploy mais recente → **Redeploy** (para pegar as variáveis).

### B7. (opcional) Rodar local com Supabase

No PC, edite o arquivo `.env` e ponha os mesmos 3 valores. Reinicie o `npm run dev`.

---

## 7. Ordem recomendada

1. **Agora:** repo público + deploy na Vercel (seção 5). Já dá um link para mostrar.
2. **Se sobrar tempo:** Supabase (seção 6), para ter login e banco de verdade.
3. **Antes de entregar:** trocar as fotos placeholder de `public/img/` e rodar o **Lighthouse** (F12 → aba Lighthouse) no link da Vercel, salvando o resultado em `docs/analise/`.
