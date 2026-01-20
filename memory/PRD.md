# WineStudy - PRD (Product Requirements Document)

## Descrição do Produto
Aplicativo educacional para estudo de vinhos com foco em conteúdo WSET, incluindo atlas mundial, banco de castas, trilhas de estudo e diário de degustação.

## Stack Tecnológico
- **Backend:** FastAPI (Python)
- **Frontend:** React.js + TailwindCSS
- **Database:** MongoDB
- **Autenticação:** JWT + Google OAuth (Emergent-managed)
- **UI Components:** Shadcn/UI

---

## Status de Implementação

### ✅ Concluído

**MVP Base:**
- [x] Setup completo (Backend, Frontend, MongoDB)
- [x] Autenticação JWT + Google Social Login
- [x] Design premium com paleta bordô/off-white
- [x] Páginas principais: Landing, Atlas, Castas, Estudo, Dashboard

**Banco de Castas (P0):**
- [x] **81 castas de uva** (43 tintas, 38 brancas) de 11 países
- [x] Cada casta com descrição bilíngue, notas aromáticas, estrutura, potencial de guarda

**Trilha de Estudo Avançada (P1):**
- [x] **23 lições totais** (5 básico + 8 intermediário + 10 avançado)
- [x] Conteúdo: Análise Sensorial WSET, Grandes Vinhos, Harmonização, Serviço

**Diário de Degustação (P1):**
- [x] Formulário completo baseado em WSET SAT
- [x] Páginas de listagem e visualização individual

**Tags de Aroma Relacionais (P2):**
- [x] Página `/aromas/:aromaId` mostra castas com o aroma selecionado
- [x] Tags clicáveis na página de castas e detalhe de casta
- [x] Navegação entre aromas relacionados

**Módulo de Métodos de Produção (P2):**
- [x] Página `/production` com 5 categorias:
  - Vinificação (tintos e brancos)
  - Espumantes (Tradicional, Charmat)
  - Fortificados (Porto, Jerez)
  - Vinhos Doces (Botrytis, Icewine)
  - Envelhecimento em Carvalho

**Expansão de Regiões (P2):**
- [x] **78 regiões** de **13 países**
- [x] Descrições bilíngues, clima, uvas principais
- [x] **Página de Detalhe da Região com Terroir Completo** (20/01/2026)
  - Terroir: tipo de solo, altitude, influência marítima
  - Clima: tipo, temperatura, precipitação
  - Traduções PT/EN em todos os campos
  - Castas principais clicáveis

---

### 🟡 Próximas Tarefas (P1)
- [ ] **Expandir Banco de Questões** - Mais perguntas por módulo
- [ ] **Filtros Avançados** - Combinação de múltiplos filtros
- [ ] **Página de Perfil** - Histórico de degustações, progresso

### 🔵 Futuro (P3)
- [ ] Modo Escuro
- [ ] Upload de fotos de rótulos
- [ ] Gráfico de Relações (castas, regiões, aromas)
- [ ] Estatísticas de progresso do usuário

---

## Dados do Sistema

| Entidade | Quantidade |
|----------|------------|
| Castas | 81 |
| Regiões | 78 |
| Países | 13 |
| Lições | 23 |
| Questões Quiz | 30+ |

### Regiões por País
- França: 11 | Itália: 12 | Espanha: 12
- Portugal: 6 | Alemanha: 7 | Áustria: 3
- EUA: 5 | Chile: 5 | Argentina: 3
- Austrália: 7 | Nova Zelândia: 3
- África do Sul: 3 | Uruguai: 1

---

## Endpoints Principais
- `/api/grapes` - Castas (filtro por tipo, aroma, região)
- `/api/regions` - Regiões (filtro por país)
- `/api/aromas` - Lista de aromas
- `/api/aromas/{tag_id}/grapes` - Castas por aroma
- `/api/study/tracks` - Trilhas de estudo
- `/api/tastings` - CRUD de degustações

---

## Arquitetura
```
/app/
├── backend/
│   ├── server.py          # API FastAPI
│   ├── grape_data.py      # Dados das castas
│   └── .env
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── ProductionMethodsPage.js  # Métodos de produção
│       │   ├── AromaDetailPage.js        # Aromas relacionais
│       │   └── ...
│       └── components/
└── memory/
    └── PRD.md
```
