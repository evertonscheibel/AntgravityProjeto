# Backend - Sistema de Gestão de TI

Backend completo desenvolvido com Node.js, Express e MongoDB.

## 🚀 Tecnologias

- **Node.js** + **Express** - Framework web
- **MongoDB** + **Mongoose** - Banco de dados NoSQL
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Node-cron** - Tarefas agendadas
- **Helmet** - Segurança
- **Express Rate Limit** - Proteção contra DDoS

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Popular banco de dados com dados de exemplo
npm run seed

# Iniciar servidor em desenvolvimento
npm run dev

# Iniciar servidor em produção
npm start
```

## 🔧 Configuração

### MongoDB

Você pode usar MongoDB local ou MongoDB Atlas (cloud):

**Local:**
```
MONGODB_URI=mongodb://localhost:27017/gestao_ti
```

**MongoDB Atlas (cloud - gratuito):**
1. Crie uma conta em https://www.mongodb.com/cloud/atlas
2. Crie um cluster gratuito
3. Obtenha a connection string
4. Configure no .env:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gestao_ti
```

## 📚 Documentação da API

### Autenticação

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/password` - Alterar senha

### Usuários (Admin)

- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário
- `PATCH /api/users/:id/toggle-active` - Ativar/Desativar

### Tickets

- `GET /api/tickets` - Listar tickets
- `POST /api/tickets` - Criar ticket
- `GET /api/tickets/:id` - Detalhes do ticket
- `PUT /api/tickets/:id` - Atualizar ticket
- `DELETE /api/tickets/:id` - Deletar ticket
- `POST /api/tickets/:id/comments` - Adicionar comentário
- `GET /api/tickets/stats/summary` - Estatísticas

### Ativos e Patrimônio

- `GET /api/assets` - Listar ativos
- `POST /api/assets` - Criar ativo
- `GET /api/assets/:id` - Detalhes
- `PUT /api/assets/:id` - Atualizar
- `DELETE /api/assets/:id` - Deletar
- `GET /api/asset-timeline/:assetId` - Histórico do ativo

### Manutenções (O.S.)

- `GET /api/maintenances` - Listar manutenções
- `POST /api/maintenances` - Criar O.S.
- `PUT /api/maintenances/:id` - Atualizar O.S.
- `GET /api/maintenances/stats` - Estatísticas de manutenção

### Compras e Suprimentos

- `GET /api/purchase-requests` - Pedidos de compra
- `POST /api/purchase-requests` - Criar pedido
- `GET /api/quotes` - Cotações
- `POST /api/quotes` - Criar cotação
- `GET /api/purchase-orders` - Ordens de compra
- `GET /api/suppliers` - Fornecedores
- `GET /api/budgets` - Orçamentos/Verba

### Gestão de Processos e Projetos

- `GET /api/projects` - Listar projetos
- `POST /api/projects` - Criar projeto
- `GET /api/processos` - Gestão de processos
- `GET /api/problems` - Gestão de problemas/causa raiz

### ATS (Recrutamento)

- `GET /api/ats/vacancies` - Vagas
- `GET /api/ats/candidates` - Candidatos
- `POST /api/ats/vacancies` - Criar vaga

### Almoxarifado

- `GET /api/almoxarifado/products` - Produtos
- `GET /api/almoxarifado/movements` - Movimentações de estoque

### Certificados

- `GET /api/certificates` - Listar certificados
- `POST /api/certificates` - Criar certificado
- `GET /api/certificates/expiring/soon` - Certificados expirando

### Base de Conhecimento

- `GET /api/kb` - Listar artigos
- `POST /api/kb` - Criar artigo
- `GET /api/kb/search/related` - Buscar artigos

### Dashboard e Métricas

- `GET /api/dashboard/kpis` - KPIs principais
- `GET /api/metrics/full` - Métricas detalhadas

## 🔐 Autenticação

Todas as rotas (exceto register e login) requerem autenticação via JWT.

Envie o token no header:
```
Authorization: Bearer SEU_TOKEN_AQUI
```

## 👥 Roles (Permissões)

- **admin** - Acesso total
- **tecnico** - Acesso operacional
- **cliente** - Acesso limitado a seus tickets

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (DB)
│   ├── controllers/     # Lógica de negócio (24 controllers)
│   ├── middleware/      # Auth, Error handling
│   ├── models/          # Schemas Mongoose (24 modelos)
│   ├── routes/          # Definição de rotas (22 arquivos)
│   ├── utils/           # Cron, Seed, Helpers
│   └── server.js        # Entry point
├── .env                 # Configurações sensíveis
└── package.json         # Dependências
```

