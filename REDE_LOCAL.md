# 🌐 CONFIGURAÇÃO PARA ACESSO NA REDE LOCAL

## 📋 Objetivo
Permitir que outros dispositivos na sua rede local acessem o sistema de Gestão de TI.

---

## 🔧 CONFIGURAÇÃO DO BACKEND

### 1. Editar `backend/.env`

```env
# Permitir acesso de qualquer IP na rede local
HOST=0.0.0.0
PORT=3000

# Adicionar URL do frontend na rede local
FRONTEND_URL=http://SEU_IP_LOCAL:5173

# Exemplo:
# FRONTEND_URL=http://192.168.1.100:5173
```

### 2. Atualizar CORS no `backend/src/server.js`

O CORS já está configurado para aceitar o `FRONTEND_URL` do `.env`.

---

## 🎨 CONFIGURAÇÃO DO FRONTEND

### 1. Editar `frontend/.env`

```env
# Usar o IP local do seu computador
VITE_API_URL=http://SEU_IP_LOCAL:3000/api

# Exemplo:
# VITE_API_URL=http://192.168.1.100:3000/api
```

### 2. Atualizar `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Permitir acesso externo
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

---

## 🔍 DESCOBRIR SEU IP LOCAL

### Windows (PowerShell):
```powershell
ipconfig
```

Procure por **"Endereço IPv4"** na seção da sua rede ativa (Wi-Fi ou Ethernet).

Exemplo: `192.168.1.100`

### Linux/Mac:
```bash
ifconfig
# ou
ip addr show
```

---

## 🚀 INICIAR O SISTEMA

### 1. Backend
```powershell
cd backend
npm run dev
```

O backend estará disponível em:
- **Local:** http://localhost:3000
- **Rede:** http://SEU_IP_LOCAL:3000

### 2. Frontend
```powershell
cd frontend
npm run dev
```

O frontend estará disponível em:
- **Local:** http://localhost:5173
- **Rede:** http://SEU_IP_LOCAL:5173

---

## 📱 ACESSAR DE OUTROS DISPOSITIVOS

### No mesmo Wi-Fi:

1. **Smartphone/Tablet:**
   - Abra o navegador
   - Digite: `http://SEU_IP_LOCAL:5173`
   - Exemplo: `http://192.168.1.100:5173`

2. **Outro Computador:**
   - Abra o navegador
   - Digite: `http://SEU_IP_LOCAL:5173`

---

## 🔒 FIREWALL (Windows)

Se não conseguir acessar, pode ser o firewall bloqueando:

### Permitir Node.js no Firewall:

1. Abra **Windows Defender Firewall**
2. Clique em **"Permitir um aplicativo ou recurso"**
3. Clique em **"Alterar configurações"**
4. Procure por **"Node.js"** ou clique em **"Permitir outro aplicativo"**
5. Adicione: `C:\Program Files\nodejs\node.exe`
6. Marque **"Privado"** e **"Público"**
7. Clique em **OK**

### Ou via PowerShell (Admin):

```powershell
# Permitir porta 3000 (Backend)
New-NetFirewallRule -DisplayName "Node Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Permitir porta 5173 (Frontend)
New-NetFirewallRule -DisplayName "Vite Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

---

## ✅ TESTAR A CONEXÃO

### 1. No seu computador:
```
http://localhost:5173
```

### 2. Em outro dispositivo na mesma rede:
```
http://SEU_IP_LOCAL:5173
```

Exemplo: `http://192.168.1.100:5173`

---

## 🌍 ACESSO PELA INTERNET (OPCIONAL)

Se quiser acessar de fora da sua rede local:

### Opção 1: Ngrok (Mais Fácil)
```bash
# Instalar ngrok
npm install -g ngrok

# Expor backend
ngrok http 3000

# Expor frontend (em outro terminal)
ngrok http 5173
```

### Opção 2: Port Forwarding no Roteador
1. Acesse o painel do seu roteador (geralmente `192.168.1.1`)
2. Configure Port Forwarding:
   - Porta Externa: 3000 → IP Local: SEU_IP:3000 (Backend)
   - Porta Externa: 5173 → IP Local: SEU_IP:5173 (Frontend)
3. Use seu IP público para acessar

### Opção 3: Deploy em Nuvem (Recomendado para Produção)
- **Backend:** Heroku, Railway, Render
- **Frontend:** Vercel, Netlify
- **Banco:** MongoDB Atlas

---

## 📝 EXEMPLO COMPLETO

### Seu IP Local: `192.168.1.100`

#### `backend/.env`:
```env
HOST=0.0.0.0
PORT=3000
FRONTEND_URL=http://192.168.1.100:5173
MONGODB_URI=mongodb://localhost:27017/gestao_ti
JWT_SECRET=seu_secret_aqui
```

#### `frontend/.env`:
```env
VITE_API_URL=http://192.168.1.100:3000/api
```

#### Acessar:
- **Do seu PC:** http://localhost:5173
- **De outro dispositivo:** http://192.168.1.100:5173

---

## 🔧 TROUBLESHOOTING

### Erro: "Não consegue conectar"
1. Verifique se ambos os dispositivos estão na mesma rede Wi-Fi
2. Verifique o firewall
3. Confirme que backend e frontend estão rodando
4. Teste com `ping SEU_IP_LOCAL` de outro dispositivo

### Erro: "CORS"
1. Verifique se `FRONTEND_URL` no backend está correto
2. Reinicie o backend após alterar `.env`

### Erro: "Timeout"
1. Desative temporariamente o firewall para testar
2. Verifique se o antivírus não está bloqueando

---

**Pronto! Agora você pode acessar o sistema de qualquer dispositivo na sua rede local!** 🚀
