# Jovem Tech Flow — Guia para o Claude Code

## Stack
- React 18 + TypeScript + Vite 5
- Supabase (auth + database + storage)
- Tailwind CSS + shadcn/ui
- React Query instalado mas ainda não utilizado

## Estrutura
```
src/
  components/     # componentes reutilizáveis
  pages/          # páginas (roteadas pelo React Router)
  hooks/          # hooks customizados
  integrations/supabase/  # client e tipos gerados
  types/          # tipos TypeScript manuais
```

## Variáveis de ambiente (obrigatórias)
Criar `.env` na raiz com:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Comandos
```bash
npm run dev      # inicia em localhost:8080
npm run build    # build de produção
npm run lint     # lint
```

## Regras do projeto
- Nunca commitar `.env`
- Manter feedback visual (toast) para toda ação do usuário
- Usar `maybeSingle()` em vez de `single()` nas queries Supabase
- Usar `Promise.allSettled` quando múltiplas queries rodam em paralelo
- Sem `console.log` em produção
- Sem `as any` — regenerar tipos Supabase se necessário

---

## Plano de melhorias — execute com `/task <N>`

### TASK 1 — Error Boundary global ✅ PRÓXIMA
**Objetivo:** Evitar tela branca em caso de erro de runtime em qualquer componente.
**Arquivos:** `src/components/ErrorBoundary.tsx` (criar), `src/App.tsx` (envolver)
**Critério de conclusão:** Um erro em qualquer componente filho exibe mensagem amigável em vez de tela branca.

---

### TASK 2 — Substituir `alert()` e `confirm()` por modais shadcn/ui
**Objetivo:** Remover todas as chamadas nativas `alert()` e `confirm()` do código.
**Arquivos afetados:**
- `src/hooks/useModuleActions.ts` (2x confirm)
- `src/pages/ProjectDetailsPage.tsx` (1x confirm)
- `src/components/FileUploadField.tsx` (2x alert)
- `src/components/ProjectEnrollmentManager.tsx` (1x confirm)
- `src/components/ProjectLibrary.tsx` (1x confirm)
- `src/components/Forum.tsx` (1x confirm)
**Critério de conclusão:** Zero ocorrências de `alert(` ou `confirm(` no código-fonte.

---

### TASK 3 — Regenerar tipos Supabase e remover `as any`
**Objetivo:** Eliminar todos os `as any` nas queries Supabase usando tipos gerados corretamente.
**Passos:**
1. Verificar se `supabase` CLI está disponível; se não, instalar com `npm i -g supabase`
2. Rodar `supabase gen types typescript --project-id eynhmkaxhjnlwbbudhsa > src/integrations/supabase/types.ts`
3. Atualizar todos os arquivos que usam `(supabase as any)` para usar os tipos corretos
**Arquivos afetados:** `src/components/ProjectProgress.tsx`, `src/components/ProjectMembersManager.tsx`, `src/components/EventContentManager.tsx`
**Critério de conclusão:** Zero ocorrências de `as any` relacionadas ao Supabase; build sem erros de tipo.

---

### TASK 4 — Proteção de rotas (Route Guard)
**Objetivo:** Impedir acesso a rotas protegidas sem autenticação.
**Arquivos:** `src/components/ProtectedRoute.tsx` (criar), `src/App.tsx` (aplicar nas rotas)
**Critério de conclusão:** Acessar `/dashboard`, `/projects/:id`, `/admin` sem login redireciona para `/auth`.

---

### TASK 5 — Migrar queries principais para React Query
**Objetivo:** Substituir os padrões `useEffect + useState + supabase` manuais por `useQuery`/`useMutation` do React Query, que já está instalado (`@tanstack/react-query`).
**Prioridade de migração:**
1. `src/components/Dashboard.tsx` — `fetchUserData`
2. `src/pages/ProjectDetailsPage.tsx` — `fetchProjectAndUserData`
3. `src/components/ProjectProgress.tsx` — fetch de contents e progressions
**Critério de conclusão:** Os 3 componentes acima usam `useQuery`; estados de loading/error são derivados automaticamente do hook.

---

### TASK 6 — Estados de loading e erro explícitos
**Objetivo:** Toda página que busca dados deve ter 3 estados visuais: loading, erro e sucesso.
**Padrão a seguir:**
```tsx
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage message={error.message} />
return <ConteudoReal />
```
**Arquivos afetados:** todas as pages em `src/pages/`
**Critério de conclusão:** Nenhuma página trava em "Carregando..." indefinidamente se a query falhar.

---

### TASK 7 — Corrigir `.single()` restantes
**Objetivo:** Substituir todas as ocorrências de `.single()` sem tratamento de erro por `.maybeSingle()`.
**Verificação:** `grep -rn "\.single()" src/`
**Critério de conclusão:** Zero ocorrências de `.single()` no código-fonte.

---

## Como usar este plano

No terminal, dentro da pasta do projeto, inicie o Claude Code:
```bash
claude
```

Então diga:
```
execute a TASK 1 do CLAUDE.md
```

Após cada task concluída e mergeada, volte e diga:
```
execute a TASK 2 do CLAUDE.md
```

Para executar no modo autônomo (sem confirmações):
```
/autopilot execute a TASK 1 do CLAUDE.md
```
