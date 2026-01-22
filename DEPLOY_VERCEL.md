# WineStudy - Deploy no Vercel + Supabase

## 1. Criar o banco no Supabase

1. Crie um projeto no Supabase.
2. Copie a **Connection string** do Postgres (Settings > Database > Connection string > URI).
3. Rode o schema:

```bash
psql "$SUPABASE_DB_URL" -f netlify/schema.sql
```

4. (Opcional) Migre os dados iniciais:

```bash
python netlify/migrate_data.py
```

## 2. Variáveis de ambiente no Vercel

No painel do Vercel (Project > Settings > Environment Variables), configure:

```
SUPABASE_DB_URL=postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require
JWT_SECRET=sua-chave-secreta-aqui-mude-em-producao
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_REDIRECT_URI=https://seu-site.vercel.app/auth/callback
```

> Observação: `SUPABASE_DB_URL` pode substituir o antigo `DATABASE_URL`.

## 3. Deploy no Vercel

1. Conecte o repositório ao Vercel.
2. O `vercel.json` já configura:
   - Build do frontend (`frontend/`)
   - Funções serverless em `api/` (adaptador para Netlify Functions)
   - Rewrites para `/api/*`

## 4. Endpoints disponíveis

Os endpoints continuam os mesmos:

| Endpoint | Função | Método |
|----------|--------|--------|
| `/api/auth/register` | `auth-register` | POST |
| `/api/auth/login` | `auth-login` | POST |
| `/api/auth/me` | `auth-me` | GET |
| `/api/auth/session` | `auth-session` | POST |
| `/api/auth/logout` | `auth-logout` | POST |
| `/api/auth/language` | `auth-language` | PUT |
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
