# Frontend - Sistema de Gestão de TI

Frontend desenvolvido com React, TypeScript e Vite.

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna e rápida
- **React Router** - Navegação
- **Axios** - Cliente HTTP
- **Context API** - Gerenciamento de estado

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🔧 Configuração

Crie um arquivo `.env` (copie do `.env.example`):

```
VITE_API_URL=http://localhost:3000/api
```

## 📁 Estrutura

```
frontend/
├── src/
│   ├── components/      # Componentes (22 arquivos)
│   │   ├── Sidebar.tsx
│   │   ├── Layout.tsx
│   │   ├── TicketModal.tsx
│   │   ├── PurchaseRequestModal.tsx
│   │   └── ... (modais e componentes UI)
│   ├── context/         # AuthContext
│   ├── pages/           # Páginas (31 arquivos)
│   │   ├── Login.tsx
│   │   ├── DashboardNew.tsx
│   │   ├── Tickets.tsx
│   │   ├── Assets.tsx
│   │   ├── ATS.tsx
│   │   ├── Almoxarifado.tsx
│   │   ├── GestaoProcessos.tsx
│   │   └── ... (módulos do sistema)
│   ├── services/        # Serviços API (10 arquivos)
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── ticketService.ts
│   │   ├── projectService.ts
│   │   └── ...
│   ├── styles/          # CSS Modules e Globais
│   ├── types/           # Definições TypeScript
│   ├── App.tsx          # Roteamento Central
│   └── main.tsx         # Entry Point
├── index.html
├── vite.config.ts
└── package.json
```


## 🎨 Funcionalidades Implementadas

- ✅ Sistema de autenticação com JWT
- ✅ Login e proteção de rotas
- ✅ Dashboard com KPIs em tempo real
- ✅ Integração completa com API
- ✅ Design moderno e responsivo
- ✅ Animações e transições suaves

## 🔐 Autenticação

O sistema usa JWT armazenado no localStorage. Todas as requisições à API incluem automaticamente o token no header `Authorization`.

## 📊 Dashboard

O dashboard exibe:
- Total de tickets
- Tempo médio de resolução
- Total de ativos
- Certificados críticos
- Boletos pendentes
- Artigos na base de conhecimento
- Status e prioridade dos tickets

## 🚀 Próximas Implementações

- [ ] Página de gerenciamento de tickets
- [ ] Página de ativos
- [ ] Página de certificados
- [ ] Página de base de conhecimento
- [ ] Página de boletos
- [ ] Sistema de notificações em tempo real
- [ ] Menu lateral de navegação
- [ ] Filtros e busca avançada
- [ ] Gráficos e relatórios

## 🎨 Design

O frontend utiliza:
- Gradientes modernos
- Animações suaves
- Cards com sombras
- Cores vibrantes
- Layout responsivo
- Tipografia clara

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🔗 Integração com Backend

O frontend se comunica com o backend através da API REST. Todas as chamadas são feitas através do serviço `api.ts` que gerencia:
- Base URL
- Headers
- Autenticação
- Tratamento de erros
- Interceptors

## 🧪 Credenciais de Teste

- **Admin:** admin@gestao.com / admin123
- **Técnico:** joao@gestao.com / tecnico123
- **Cliente:** maria@cliente.com / cliente123

---

**Desenvolvido com ❤️ usando React + TypeScript**
