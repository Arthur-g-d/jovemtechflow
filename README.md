# 📱 Jovem Tech Flow — Plataforma Digital Educacional

O **Jovem Tech Flow** é uma plataforma web desenvolvida para conectar
jovens talentos da tecnologia a oportunidades de aprendizado,
desenvolvimento profissional e networking, em parceria com empresas
patrocinadoras.

A aplicação oferece **trilhas de aprendizado personalizadas**, uma
**comunidade ativa**, **biblioteca de projetos** e ferramentas de
acompanhamento para estudantes e estagiários em suas jornadas.

---

## 👥 Equipe

| Aluno            | RA           |
|:-----------------|:-------------|
| Arthur Gianesini | 12924110736  |
| Roger Oliveira   | 1292418451   |
| Jeziel Ferreira  | 12924114788  |

---

## 📚 Stack Tecnológica

| Categoria                | Tecnologia                                     |
|:-------------------------|:-----------------------------------------------|
| Linguagem                | TypeScript + React 18                          |
| Build                    | Vite (com SWC)                                 |
| Estilização              | Tailwind CSS + shadcn/UI + Radix UI            |
| Roteamento               | React Router DOM v6                            |
| Estado server            | TanStack Query                                 |
| Formulários              | React Hook Form + Zod                          |
| Notificações             | Sonner                                         |
| Ícones                   | Lucide React                                   |
| Backend                  | Supabase (Auth, Postgres com RLS, Storage)     |
| Testes                   | Vitest + Testing Library                       |
| Qualidade                | ESLint + Prettier + Husky + commitlint         |
| Telemetria (opcional)    | Sentry                                         |

---

## 🎨 Design System

- Gradientes tech (roxo → azul)
- Tipografia **Inter**
- Cards, botões e badges responsivos
- Animações CSS customizadas
- Componentes acessíveis via **Radix UI** (base do shadcn)

---

## ⚙️ Funcionalidades

### 📊 Dashboard do Estudante
- Trilha de aprendizado com progresso visual
- Sistema de badges (Concluído / Em andamento / Bloqueado)
- Calendário de eventos
- Estatísticas de progresso

### 📚 Biblioteca de Projetos
- Grid responsivo
- Filtros por categoria e tags tecnológicas
- Sistema de likes e visualizações
- Inscrição em projetos com matrícula via RLS

### 💬 Fórum da Comunidade
- Categorias: Geral, Projetos, Eventos, Carreira, Ajuda
- Sistema de postagens com respostas
- Filtros por categoria
- Formulário validado com Zod

### 📅 Eventos e Workshops
- Inscrição em workshops, mentorias e hackathons
- Controle de vagas via RPC pública (sem expor inscritos individuais)
- Filtros por status (próximos / anteriores / todos)
- Busca por título

### 👤 Perfil
- Edição de bio e nome de usuário
- Upload de avatar (allowlist MIME, persistência garantida)
- Promoção a administrador (apenas para admins, com validação no banco)

### 🛡️ Painel Admin
- Gerenciamento de eventos (criar, excluir)
- Progresso detalhado dos alunos (view + RPC dedicadas)
- Rota protegida via `has_role(admin)` no banco

---

## 🚀 Diferenciais

- Interface moderna e responsiva
- Experiência gamificada com badges e estatísticas
- Comunidade integrada e participativa
- Design acessível e otimizado
- Arquitetura modular preparada para crescimento e novas integrações
- **Segurança em profundidade** (RLS + CSP + iframe sandbox + allowlist MIME)
- **Pipeline de qualidade automatizado** (hooks locais + CI completo)

---

## 📦 Quick Start

```bash
# 1. Clone e instale
git clone <REPO_URL>
cd jovem-tech-flow
npm install   # também configura os hooks do Husky automaticamente

# 2. Configure ambiente
cp .env.example .env.local
# Edite .env.local — pelo menos VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Aplique as migrations
supabase db push
# Veja AUDIT_CHANGELOG.md "Como aplicar" para detalhes

# 4. Rode em dev
npm run dev
```

> **Atenção:** a primeira migration enrijece a RLS de `user_roles`.
> Garanta que existe **ao menos um admin** antes de aplicar em produção.

---

## 🛠️ Scripts

| Comando              | O que faz                            |
|----------------------|--------------------------------------|
| `npm run dev`        | Vite dev server                      |
| `npm run build`      | Build de produção                    |
| `npm run preview`    | Servir o build local                 |
| `npm run lint`       | ESLint                               |
| `npm run lint:fix`   | ESLint --fix                         |
| `npm run format`     | Prettier --write                     |
| `npm run format:check` | Prettier --check                   |
| `npm run typecheck`  | tsc --noEmit (strict mode)           |
| `npm test`           | Vitest watch                         |
| `npm run test:run`   | Vitest single run                    |
| `npm run test:ui`    | Vitest UI interativa                 |
| `npm run test:coverage` | Vitest com relatório de coverage  |

---

## 🗂️ Estrutura de Pastas

```
src/
  components/              # Componentes globais reutilizáveis
    ui/                    # Componentes shadcn
    ConfirmProvider.tsx    # useConfirm() — substitui confirm() nativo
    ErrorBoundary.tsx      # Captura erros + reporta a Sentry
    LazyImg.tsx            # <img> com loading="lazy" por padrão
    EditProfile/           # Componentes da tela de perfil
  features/                # Decomposição por feature
    events/                #   types, hooks, componentes específicos
    forum/
    admin-progress/
  hooks/                   # Hooks transversais
  integrations/supabase/   # Cliente Supabase + types gerados
  lib/                     # Utilitários puros
    urlSafety.ts           # Allowlist de domínios para iframes
    monitoring.ts          # Wrapper de telemetria (Sentry)
  pages/                   # Páginas roteadas (containers finos)
  routes/                  # Guards de roteamento
    ProtectedRoute.tsx     # Verifica sessão + opcional has_role
  services/                # Repository pattern (encapsula Supabase)
    auth.service.ts
    events.service.ts
    forum.service.ts
    profile.service.ts
    upload.service.ts
    enrollment.service.ts
    project.service.ts
    admin-progress.service.ts
    errors.ts              # SupabaseError + unwrap helpers
  test/                    # Setup, utils e mocks de teste

supabase/
  migrations/              # SQL versionado

.github/workflows/         # CI: lint, format, typecheck, test, build
.husky/                    # Hooks de pre-commit e commit-msg
```

---

## 🏛️ Padrões de Arquitetura

**Containers finos.** Páginas em `pages/*Page.tsx` apenas orquestram
subcomponentes. Lógica de dados vive em hooks; lógica de I/O em services.

**Hooks só com TanStack Query.** Não fazem fetch direto — delegam ao service:

```typescript
export function useEventsList(args) {
  return useQuery({
    queryKey: ["events", args.filter, args.search ?? ""],
    queryFn: () => eventsService.fetchEvents(args),
  });
}
```

**Services encapsulam Supabase.** Componentes e hooks **nunca** importam
`@/integrations/supabase/client` — sempre via `@/services`. Isso isola
mudança de backend e torna trivial trocar Supabase por outro provedor.

```typescript
// ❌ Não faça
const { data, error } = await supabase.from("events").select(...);

// ✅ Faça
const events = await eventsService.fetchEvents({ filter: "upcoming" });
```

**Erros padronizados.** Services lançam `SupabaseError`. Componentes
fazem `try/catch` + `toast.error`. Sentry recebe automaticamente o que
for inesperado (RLS bloqueado / objeto faltante ficam de fora).

---

## 🔒 Segurança

Visão geral em [`SECURITY.md`](./SECURITY.md). Princípios:

1. **Banco é a fonte da verdade de autorização**. RLS sempre, `has_role()`
   SECURITY DEFINER, RPCs com `RAISE EXCEPTION` para acessos privilegiados.
2. **Defesa em profundidade**: validar no cliente e no banco. Allowlist
   de MIME no upload, allowlist de domínios em iframe (`getSafeEmbedUrl`),
   **CSP** em `index.html`, iframe com `sandbox`.
3. **Sem segredos em código**. Credenciais via `.env.local` (no `.gitignore`),
   nunca commitadas.

---

## 🚦 CI/CD

GitHub Actions roda em cada push e PR para `main`:

1. **Lint** — ESLint
2. **Format check** — Prettier
3. **Type check** — tsc --noEmit
4. **Test** — Vitest
5. **Build** — Vite
6. **Commitlint** (em PRs) — valida mensagens de commit

Hooks locais (Husky):
- **pre-commit**: ESLint + Prettier nos arquivos staged
- **commit-msg**: Conventional Commits enforçado

Dependabot abre PRs semanais com bumps agrupados.

---

## 📚 Documentação Relacionada

- [`APPLY_GUIDE.md`](./APPLY_GUIDE.md) — Guia passo-a-passo para aplicar as correções da auditoria no repositório.
- [`AUDIT_CHANGELOG.md`](./AUDIT_CHANGELOG.md) — Histórico completo das 8 ondas da auditoria técnica.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Convenções de commit, padrões de código, fluxo de PR.
- [`SECURITY.md`](./SECURITY.md) — Política de segurança (CSP, telemetria, princípios).

---

## 📈 Dados de Demonstração

- Projetos de exemplo cadastrados
- Trilhas de aprendizado com múltiplas etapas
- 5 categorias de fórum (Geral, Projetos, Eventos, Carreira, Ajuda)
- Eventos ativos + histórico
- **500+ jovens conectados** · **50+ empresas** · **1000+ projetos publicados**

---

## 📄 Licença

Projeto acadêmico — desenvolvido por Arthur Gianesini, Roger Oliveira e
Jeziel Ferreira.
