# Auditoria — Correções Aplicadas

Histórico das correções produzidas a partir da auditoria técnica do
**Jovem Tech Flow**, organizadas em 8 ondas.

---

## ⚠️ Como aplicar

### 1. Variáveis de ambiente
```bash
cp .env.example .env.local
# Obrigatório: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
# Opcionais: VITE_PUBLIC_URL, VITE_SENTRY_DSN, VITE_SENTRY_ENV
```

### 2. Migrations SQL
```bash
supabase db push
```

> A primeira migration assume ≥1 admin em `user_roles`.

### 3. Instalar deps
```bash
npm install
# Husky autoconfigura. @sentry/react vem em optionalDependencies.
```

### 4. Validar
```bash
npm run typecheck && npm run lint && npm run format:check && npm run test:run && npm run build
```

### 5. Rotacionar chave anon do Supabase
A antiga estava em commits públicos.

---

## Visão geral por onda

| Onda | Tema | IDs resolvidos |
|------|------|----------------|
| 1 | Críticas (segurança) | CRIT-01, CRIT-02, CRIT-03, HIGH-01..05 |
| 2 | Bugs altos | BUG-01..14 |
| 3 | Estrutura e DX | H1, H2, H4, H8, H11, M1, M7, M11 |
| 4 | Modularização e testes | M5, M6 |
| 5 | Qualidade automatizada | M8 |
| 6 | Camada services | M2 |
| 7 | Segurança e observabilidade | M10, M13 |
| 8 | Polimentos finais | M9, M14 |

---

## Onda 1 — Críticas (segurança)

| ID | O quê |
|----|-------|
| CRIT-01 | RLS de `user_roles` exige `has_role(admin)`. |
| CRIT-02 | Supabase via env vars. `.gitignore` cobre `.env*`. |
| CRIT-03 | `handleAddAdmin` depende do banco (RAISE EXCEPTION no RPC + RLS no INSERT). |
| HIGH-01 | `get_user_by_email` restrito a admins. |
| HIGH-02 | RLS restrita em enrollments/registrations; contagens via RPC pública. |
| HIGH-03 | Allowlist MIME nos buckets `content-files` (50MB) e `avatars` (5MB). |
| HIGH-04 | `getSafeEmbedUrl` valida domínio + iframe com `sandbox`. |
| HIGH-05 | OAuth/reset redirect via `VITE_PUBLIC_URL` com fallback. |

## Onda 2 — Bugs altos

BUG-01 (`from<any,any>`), BUG-02 (onConflict array→CSV), BUG-03 (Toasters
montados), BUG-04 (Index.tsx duplicado), BUG-05 (Dashboard na landing),
BUG-06 (telas empilhadas), BUG-07 (EventModule fantasma), BUG-09 (evento
inexistente), BUG-10 (`.single`→`.maybeSingle`), BUG-12 (avatar_url não
persistia), BUG-13 (deleteEvent count=0), BUG-14 (catches mudos).

## Onda 3 — Estrutura e DX

| ID | O quê |
|----|-------|
| H1 | `ProtectedRoute` (`requireAdmin?: boolean`). |
| H2 | Rota `*` → NotFound; ErrorBoundary global. |
| H4 | `useConfirm` substitui `confirm()` nativo. |
| H8 | Landing reestruturada. |
| H11 | `project_members` marcada deprecated. |
| M1 | `tsconfig.app.json` com `strict: true`. |
| M7 | ESLint `no-console`. |
| M11 | GitHub Actions CI. |

## Onda 4 — Modularização e Testes (M5 + M6)

**M5** — God Components decompostos em `src/features/<feature>/`:
- `Events.tsx` → containers fino + `features/events/{types,useEventsList,EventCard,EventFilters,EventList}`
- `Forum.tsx` → `features/forum/{types,useForumPosts,ForumPostCard,ForumCategoryFilter,ForumPostCreateDialog,ForumPostList}` (fonte única `FORUM_CATEGORIES` resolve BUG-08)
- `AdminStudentProgress.tsx` → `features/admin-progress/*` + migration `20250519000003` (view + RPC)

**M6** — Vitest + RTL:
- `vitest.config.ts` com jsdom, alias `@/`, coverage v8, thresholds 60%
- `src/test/{setup,utils,mocks/supabase}` reutilizável
- Suítes: urlSafety, ConfirmProvider, ProtectedRoute, AvatarSection, AuthPage

## Onda 5 — Qualidade automatizada (M8)

Husky + lint-staged + commitlint + Prettier:
- `prepare` script autoinstala hooks
- pre-commit: ESLint --fix + Prettier nos staged (`--max-warnings=0`)
- commit-msg: Conventional Commits, types restritos, header ≤100 chars
- CI valida commits do range do PR

`CONTRIBUTING.md` documenta convenções, scopes sugeridos, arquitetura, bypass.

## Onda 6 — Camada `services/` (M2)

9 services + barrel + 4 suítes de teste:
- `errors.ts` (`SupabaseError` + `unwrap`/`unwrapMaybe`/`unwrapList`/`ensureOk`)
- `auth.service.ts`, `events.service.ts`, `forum.service.ts`, `profile.service.ts`, `upload.service.ts`, `enrollment.service.ts`, `project.service.ts`, `admin-progress.service.ts`

Componentes e hooks **nunca** importam `@/integrations/supabase/client`.
`SupabaseError.isPermissionDenied` (42501) e `.isMissingObject` (42P01/42883)
permitem tratamento contextual + deploy incremental.

## Onda 7 — Segurança e Observabilidade (M10 + M13)

**M10 — CSP em `index.html`:**
- `script-src 'self'` (sem inline/eval)
- `frame-src` allowlist alinhada ao `getSafeEmbedUrl`
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`
- `referrer="strict-origin-when-cross-origin"`

**M13 — Sentry abstraído em `src/lib/monitoring.ts`:**
- Lazy import: funciona sem Sentry instalado
- Sem DSN → no-op com `console.error/warn` fallback
- `ErrorBoundary` → `captureException`
- `errors.ts` reporta `SupabaseError` inesperados (filtra os "esperados")
- `authService` identifica/limpa usuário
- `sendDefaultPii: false` + filter de query strings

`SECURITY.md` documenta CSP, telemetria, princípios e roadmap.

`.github/dependabot.yml` mantém deps em dia com PRs semanais agrupados.

## Onda 8 — Polimentos finais (M9 + M14)

**M9 — Lazy loading:**
- Componente `<LazyImg>` aplica `loading="lazy"` + `decoding="async"` por padrão
- ESLint `no-restricted-syntax` bloqueia `<img>` sem prop `loading` explícita (M9 enforcement)
- `eslint-plugin-jsx-a11y` adicionado: `alt-text`, `anchor-has-content`, `aria-*`
- `EventCard` migrado para `LazyImg`; padrão para novas imagens

**M14 — README:**
- Reescrito do zero refletindo arquitetura pós-auditoria
- Seções: Stack, Quick start, Scripts, Estrutura de pastas, Padrões, Recursos, Segurança, CI/CD
- Cross-links para `CONTRIBUTING.md`, `SECURITY.md`, `AUDIT_CHANGELOG.md`

---

## Status final

✅ **TODAS as críticas, altas e médias do roadmap original aplicadas.**

Itens não aplicados intencionalmente:
- **M12 (i18n)** — overengineering sem demanda real. Adicionar quando houver plano de expansão multilíngue.
- **H5 (toaster único)** — toaster duplo intencional por compat; consolidar quando todos os usos forem migrados para Sonner.

---

## Métricas finais

- **8 ondas** entregues
- **~70 arquivos** novos/modificados
- **4 migrations** SQL
- **9 suítes de teste** com factory de mock reutilizável
- **2 documentos novos** (`SECURITY.md`, `CONTRIBUTING.md`) + 1 reescrito (`README.md`)
- **Pipeline CI** com 6 etapas + Dependabot
- **0 chamadas diretas** a `supabase.*` fora de `src/services/` e `src/integrations/`
