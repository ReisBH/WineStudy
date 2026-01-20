# WineStudy - PRD (Product Requirements Document)

## Descrição do Produto
Aplicativo educacional para estudo de vinhos com foco em conteúdo WSET, incluindo atlas mundial, banco de castas, trilhas de estudo e diário de degustação.

## Requisitos Originais
1. Atlas Mundial de Vinhos - Conteúdo sobre países e regiões do Velho e Novo Mundo
2. Plataforma de Estudo - Níveis básico, intermediário e avançado
3. Diário de Degustação - Formulário baseado na sistemática WSET (SAT)
4. Sistema de Filtros - Por castas, regiões, países, estilos e notas aromáticas
5. Sistema Relacional de Castas - Notas aromáticas clicáveis
6. Módulo de Métodos de Produção
7. Banco de Questões - Quizzes com feedback
8. UI/UX Premium - Tons off-white e bordô, tipografia serif + sans

## Stack Tecnológico
- **Backend:** FastAPI (Python)
- **Frontend:** React.js + TailwindCSS
- **Database:** MongoDB
- **Autenticação:** JWT + Google OAuth (Emergent-managed)
- **UI Components:** Shadcn/UI

---

## Status de Implementação

### ✅ P0 - Concluído (Janeiro 2025)
- [x] Setup do ambiente (Backend, Frontend, MongoDB)
- [x] Autenticação JWT + Google Social Login
- [x] Design premium com paleta bordô/off-white
- [x] Páginas: Landing, Atlas, Castas, Estudo, Dashboard
- [x] Páginas de detalhes: Países, Regiões, Castas
- [x] **81 castas de uva** (43 tintas, 38 brancas) de 11 países
- [x] Filtros por tipo (tinto/branco) e aromas
- [x] Seed completo de dados

### ✅ P1 - Concluído (Janeiro 2025)
- [x] **Trilha de Estudo Avançada** - 10 lições completas
  - Análise Sensorial Avançada (WSET SAT)
  - Grandes Vinhos da Itália
  - Grandes Vinhos da Espanha
  - Vinhos do Novo Mundo
  - Harmonização Avançada
  - Serviço e Armazenamento
- [x] **Diário de Degustação** - Formulário WSET SAT
  - Informações do vinho
  - Aparência, Nariz, Paladar
  - Conclusão (qualidade, potencial de guarda)
  - Página de listagem e detalhe
- [x] Página de visualização de degustação individual
- [x] Trilhas de estudo com contagem correta de lições

### 🟡 P2 - Próximas Tarefas
- [ ] **Tags de Aroma Relacionais** - Clicar em um aroma mostra castas/vinhos relacionados
- [ ] **Expandir Banco de Questões** - Mais perguntas por módulo
- [ ] **Módulo de Métodos de Produção** - Seção educacional dedicada
- [ ] **Filtros Avançados** - Combinação de múltiplos filtros
- [ ] **Página de Perfil** - Histórico de degustações, progresso nos estudos

### 🔵 P3 - Futuro
- [ ] Modo Escuro
- [ ] Integração Google Drive (backup de imagens)
- [ ] Gráfico de Relações (castas, regiões, aromas)
- [ ] Estatísticas de progresso do usuário
- [ ] Upload de fotos de rótulos

---

## Dados do Sistema

### Castas de Uva (81 total)
| País | Tintas | Brancas |
|------|--------|---------|
| França | 12 | 11 |
| Itália | 11 | 9 |
| Espanha | 6 | 6 |
| Portugal | 7 | 5 |
| Alemanha | 2 | 6 |
| Áustria | 0 | 1 |
| EUA | 2 | 0 |
| Argentina | 0 | 1 |
| Chile | 1 | 0 |
| Uruguai | 1 | 0 |
| África do Sul | 1 | 0 |

### Trilhas de Estudo
| Trilha | Nível | Lições | Duração |
|--------|-------|--------|---------|
| Fundamentos do Vinho | Básico | 5 | ~60 min |
| Terroir e Regiões | Intermediário | 8 | ~96 min |
| Mestria em Vinhos | Avançado | 10 | ~120 min |

### Endpoints Principais
- `/api/grapes` - Lista e filtra castas
- `/api/countries` - Países vinícolas
- `/api/regions` - Regiões por país
- `/api/study/tracks` - Trilhas de estudo
- `/api/study/tracks/{id}/lessons` - Lições por trilha
- `/api/tastings` - CRUD de degustações (autenticado)
- `/api/aromas` - Tags de aroma
- `/api/quiz/tracks/{id}/questions` - Questões por trilha

---

## Arquitetura de Arquivos
```
/app/
├── backend/
│   ├── server.py          # API FastAPI completa
│   ├── grape_data.py      # Dados das 81 castas
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/         # Todas as páginas
│   │   ├── components/    # UI components
│   │   ├── contexts/      # Auth e Language
│   │   └── utils/         # Traduções
│   └── package.json
├── tests/
│   └── test_winestudy_api.py  # 27 testes pytest
└── memory/
    └── PRD.md
```

---

## Testes
- **27 testes pytest** passando
- Cobertura: APIs de castas, estudo, degustações, autenticação
- Arquivo: `/app/tests/test_winestudy_api.py`

---

## Notas de Desenvolvimento
- MongoDB usado em vez de PostgreSQL (decisão baseada no ambiente)
- Dados de seed em `/app/backend/grape_data.py`
- Endpoints de seed: `/api/seed`, `/api/seed/expand`, `/api/seed/grapes-complete`, `/api/seed/expand-advanced`
