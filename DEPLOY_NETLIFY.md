# WineStudy - Deploy no Netlify

## Configuração do Ambiente

### 1. Variáveis de Ambiente no Netlify

No painel do Netlify, vá em **Site settings > Build & deploy > Environment** e adicione:

```
DATABASE_URL=postgresql://neondb_owner:npg_iuFJrUdRbt16@ep-dry-hall-ag84ay26-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=sua-chave-secreta-aqui-mude-em-producao
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_REDIRECT_URI=https://seu-site.netlify.app/auth/callback
```

### 2. Deploy

1. Conecte o repositório ao Netlify
2. Configure:
   - **Build command:** `cd frontend && yarn install && yarn build`
   - **Publish directory:** `frontend/build`
   - **Functions directory:** `netlify/functions`

3. O `netlify.toml` já está configurado para mapear as rotas da API

### 3. Banco de Dados (Neon)

O schema já foi criado e os dados migrados. Se precisar recriar:

```bash
# Executar schema
psql $DATABASE_URL -f netlify/schema.sql

# Migrar dados
python netlify/migrate_data.py
```

## Estrutura do Projeto

```
/app/
├── netlify.toml           # Configuração do Netlify
├── frontend/              # React app
│   ├── src/
│   └── build/             # Build de produção
├── netlify/
│   ├── functions/         # Netlify Functions (Node.js)
│   │   ├── auth-register.js
│   │   ├── auth-login.js
│   │   ├── auth-me.js
│   │   ├── auth-session.js
│   │   ├── countries.js
│   │   ├── regions.js
│   │   ├── grapes.js
│   │   ├── aromas.js
│   │   ├── tastings.js
│   │   ├── study.js
│   │   ├── lessons.js
│   │   ├── quiz.js
│   │   ├── progress.js
│   │   └── seed.js
│   ├── utils/             # Utilitários compartilhados
│   │   ├── db.js          # Conexão PostgreSQL
│   │   ├── auth.js        # JWT helpers
│   │   └── response.js    # Response helpers
│   └── schema.sql         # Schema PostgreSQL
└── backend/               # FastAPI (original - não usado no Netlify)
```

## Endpoints da API

| Endpoint | Função Netlify | Método |
|----------|----------------|--------|
| `/api/auth/register` | `auth-register` | POST |
| `/api/auth/login` | `auth-login` | POST |
| `/api/auth/me` | `auth-me` | GET |
| `/api/auth/session` | `auth-session` | POST |
| `/api/countries` | `countries` | GET |
| `/api/countries/:id` | `countries` | GET |
| `/api/regions` | `regions` | GET |
| `/api/regions/:id` | `regions` | GET |
| `/api/grapes` | `grapes` | GET |
| `/api/grapes/:id` | `grapes` | GET |
| `/api/aromas/:id/grapes` | `aromas` | GET |
| `/api/tastings` | `tastings` | GET, POST |
| `/api/tastings/:id` | `tastings` | GET, DELETE |
| `/api/study/tracks` | `study` | GET |
| `/api/study/tracks/:id/lessons` | `study` | GET |
| `/api/quiz/tracks/:id/questions` | `quiz` | GET |
| `/api/quiz/submit` | `quiz` | POST |
| `/api/progress` | `progress` | GET |

## Google OAuth

Para configurar o Google OAuth no Netlify:

1. No Google Cloud Console, adicione a URL de callback:
   - `https://seu-site.netlify.app/auth/callback`

2. Atualize as variáveis no Netlify:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
