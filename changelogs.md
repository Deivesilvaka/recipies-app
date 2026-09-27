## Version 0.0.1 - 07/08/2025

Setup de aplicação com funcionalidades como login, autenticação, JWT, cadastro, esqueci a senha e recuperação de senha, gerenciamento de dados de usuário e recursos de segurança.

## Version 0.1.0 - 27/09/2026

Pivot do projeto para um app de receitas: removidos os módulos de vagas de emprego e tecnologias (fora de escopo). Adicionado o módulo de receitas com CRUD completo (ingredientes, modo de preparo, passo a passo com fotos, informações nutricionais e dicas do chef), autenticação obrigatória em todos os endpoints e edição por upsert (mesmo endpoint de criação, itens identificados por `id`).

## Version 0.2.0 - 27/09/2026

Node.js atualizado para a versão 24 LTS (Docker, `.nvmrc`, `engines` e `@types/node` alinhados). Busca de receitas (`GET /recipes`) tornada pública para permitir navegação sem login. `category` e `nutritionalInfo` passaram a ser opcionais na criação/edição. Passos visuais deixaram de aceitar imagem própria; a imagem principal da receita agora é enviada como arquivo (`POST /recipes/:id/image`, salvo em disco) e lida via `GET /recipes/:id/image` (endpoint público). Adicionado script de seed com receitas de exemplo (`npm run db:seed`).