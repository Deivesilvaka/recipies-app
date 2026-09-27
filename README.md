# Recipes App

API REST para um app de receitas: cadastro/login de usuários e CRUD de receitas (ingredientes, modo de preparo, passo a passo com fotos, informações nutricionais, dicas do chef etc.).

Stack: NestJS + TypeORM + PostgreSQL, autenticação via JWT.

---

## Pré-requisitos

- Node.js 24 (LTS "Krypton") — veja o `.nvmrc` (`nvm use`)
- Docker e Docker Compose

---

## 1. Instalação

```bash
npm install
```

---

## 2. Configurar o `.env`

```bash
cp .env.example .env
```

Preencha pelo menos:

- `JWT_SECRET` — gere um segredo forte e aleatório (nunca reutilize o valor de exemplo).
- `MAIL_*` — credenciais de um serviço de teste de e-mail, ex: [Mailtrap](https://mailtrap.io), usadas para enviar o OTP de verificação de conta e o e-mail de recuperação de senha.

---

## 3. Subir o banco de dados

```bash
docker compose up -d db
```

Aguarde o container ficar saudável e rode as migrations:

```bash
npm run migration:run
```

---

## 4. Rodar a aplicação (API)

```bash
npm run start:dev
```

A API sobe em `http://localhost:3000`. Documentação Swagger (ambiente não-produção) em:

```
http://localhost:3000/api
```

---

## 5. Popular o banco com receitas de exemplo (recomendado)

Sem isso o catálogo fica vazio. Recria o schema do zero e popula com as receitas de exemplo (mantidas em `src/shared/database/seeds/data/recipes.seed-data.json`):

```bash
npm run db:seed
```

Cria um usuário dono das receitas, já com e-mail verificado e pronto pra logar (na API ou no site):

```
email: seed@recipes.app
senha: Seed@123
```

---

## 6. Rodar o site (front-end)

A pasta `web/` é um site em HTML/CSS/JS puro (sem build, sem framework, sem instalar nada) que consome todos os endpoints da API: cadastro, verificação de e-mail, login, esqueci minha senha, perfil, busca/detalhe de receitas (públicos, não precisa logar), criação/edição de receita (com reordenação por arrastar-e-soltar de ingredientes/instruções/passos/dicas) e upload da imagem principal. É responsivo (celular e desktop).

Sirva a pasta com **qualquer servidor estático** — não dá pra abrir o `index.html` direto em `file://`, porque o site usa ES modules e o navegador bloqueia isso por segurança:

```bash
npx serve web
# ou, se preferir sem instalar nada:
python3 -m http.server 8080 --directory web
```

Abra o endereço que o comando mostrar (ex: `http://localhost:8080`) com a API do passo 4 rodando. Por padrão o site chama a API em `http://localhost:3000`; se a sua API estiver em outra porta/host, clique no ícone ⚙ no topo da página para trocar a URL antes de usar.

Para testar rápido: faça login no site com o usuário do seed (`seed@recipes.app` / `Seed@123`) e navegue pelas receitas já populadas.

---

## Autenticação

Os endpoints exigem um usuário logado por padrão, exceto os marcados como públicos no Swagger: criação de conta, login, verificação de e-mail, fluxo de "esqueci minha senha", busca de receitas (`GET /recipes`) e leitura da imagem da receita (`GET /recipes/:id/image`) — para permitir navegar pelo catálogo sem estar logado.

### Criar conta

```http
POST /user
Content-Type: application/json

{
  "name": "Maria",
  "email": "maria@teste.com",
  "password": "Senha@123",
  "confirmPassword": "Senha@123",
  "birthdate": "01/01/1990",
  "phoneNumber": "(11) 99999-9999",
  "isTermsAccepted": "true"
}
```

### Verificar e-mail (OTP)

O código chega por e-mail (Mailtrap no ambiente local):

```http
POST /auth/verify/{otp}/userId/{userId}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "maria@teste.com",
  "password": "Senha@123"
}
```

Guarde o `access_token` retornado e envie em toda chamada como `Authorization: Bearer {access_token}`.

---

## Receitas

Criação e edição usam o **mesmo endpoint** (`POST /recipes`):

- Sem `id` no corpo → cria uma receita nova.
- Com `id` → edita a receita existente (só o autor da receita pode editá-la; qualquer usuário logado pode visualizar/buscar).
- O mesmo padrão vale para os itens dentro de `ingredients`, `instructions`, `visualSteps` e `chefTips`: item com `id` atualiza o registro salvo, item sem `id` cria um novo, e um item salvo que não for enviado na lista é removido.

### Criar receita

```http
POST /recipes
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Estrogonofe Cremoso de Frango com Arroz Branco",
  "subtitle": "Um clássico de almoço caseiro em versão equilibrada...",
  "category": "FRANGO QUE NÃO ENJOA",
  "prepTimeMinutes": 35,
  "servings": 4,
  "portionReference": "1 prato (aprox. 350g)",
  "badges": ["PROTEICO", "CONGELÁVEL"],
  "ingredients": [
    { "description": "500 g de peito de frango em cubos" },
    { "description": "1 colher (sopa) de azeite" }
  ],
  "nutritionalInfo": {
    "caloriesKcal": 428,
    "proteinsGrams": 32,
    "carbohydratesGrams": 34,
    "fatsGrams": 17,
    "fibersGrams": 2,
    "sodiumMg": 498
  },
  "visualSteps": [
    { "stepNumber": 1, "description": "Tempere o frango com sal e pimenta." }
  ],
  "instructions": [
    { "description": "Tempere o frango com sal e pimenta." },
    { "description": "Doure o frango na panela com azeite." }
  ],
  "chefTips": [
    { "tip": "Pode ser congelado por até 3 meses." }
  ]
}
```

### Editar receita (mesmo endpoint)

Envie o `id` da receita e o `id` de cada item que deve ser atualizado; itens sem `id` são criados e itens salvos que não forem enviados são removidos.

```http
POST /recipes
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "id": "3f0b6f0e-8b9b-4c9a-9f9a-8b6c1a2f9e11",
  "title": "Estrogonofe Cremoso de Frango com Arroz Branco",
  "category": "FRANGO QUE NÃO ENJOA",
  "prepTimeMinutes": 30,
  "servings": 4,
  "badges": ["PROTEICO", "CONGELÁVEL"],
  "ingredients": [
    { "id": "c1a2b3d4-...", "description": "500 g de peito de frango em cubos" },
    { "description": "1 colher (sopa) de creme de leite" }
  ],
  "nutritionalInfo": {
    "caloriesKcal": 420,
    "proteinsGrams": 32,
    "carbohydratesGrams": 34,
    "fatsGrams": 16,
    "fibersGrams": 2,
    "sodiumMg": 490
  },
  "instructions": [
    { "id": "d4e5f6a7-...", "description": "Tempere o frango com sal e pimenta." }
  ]
}
```

### Buscar receitas

```http
GET /recipes?q=frango&category=FRANGO%20QUE%20N%C3%83O%20ENJOA&page=1&limit=20
Authorization: Bearer {access_token}
```

### Buscar receita por id

```http
GET /recipes/{id}
Authorization: Bearer {access_token}
```

### Imagem principal da receita

A imagem não é um campo de texto (URL) no corpo da receita — ela é enviada como arquivo e fica salva no servidor. Só o autor da receita pode enviar/substituir a imagem; a leitura é pública (para poder ser usada direto em uma tag `<img>` na web, sem precisar de token).

Enviar (ou substituir) a imagem — aceita JPEG, PNG ou WEBP, até 5MB:

```http
POST /recipes/{id}/image
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

image: (arquivo)
```

A resposta traz `mainImageUrl` apontando para o endpoint de leitura:

```http
GET /recipes/{id}/image
```

Use esse valor direto no `src` de uma tag `<img>` no front-end.

---

## Documentação da API

Com a aplicação rodando (fora de produção):

```
http://localhost:3000/api
```

---

## Migrations

```bash
npm run migration:generate --name=NomeDaMigration
npm run migration:run
npm run migration:revert
```

---

## Testes

```bash
npm run test
npm run test:e2e
```
