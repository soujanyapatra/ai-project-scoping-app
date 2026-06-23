# Developer & Agent Rules: Scoping App (Laravel & Vue 3)

This guide documents the design standards and implementation rules for the `scoping-app` frontend application.

---

## 1. Vue: `<script setup>` order

Use this order inside `<script setup>` (flexible where a step does not apply):

1. **Imports** — external first, then `@/…` (groups alphabetically when practical).
2. **Types** — only tiny, component-local types if needed; shared types live under `src/interfaces/` or `src/types/`.
3. **`defineProps` / `defineEmits`** — typed; defaults with `withDefaults` when needed.
4. **`useI18n`**, **`useAppToast`**, **router** — and other one-liner composables that have no store dependency.
5. **Pinia (and other heavy setup)** — call stores, then destructure.
6. **Constants** then **template refs** then **reactive state** (`ref` / `reactive` with explicit types).
7. **Computed**
8. **Methods** — prefer `const fn = () => {}` or `async` where appropriate.
9. **Watch** / `watchEffect`
10. **Lifecycle** — `onMounted`, `onBeforeUnmount`, etc.

**SFC file order:** `<script setup>` → `<template>` → `<style scoped>` (styles scoped unless a strong reason not to).

---

## 2. API calls, errors, and toasts

**Principle:** User-visible **success and error** feedback for a given HTTP request should come from **one place**, usually the **module that performs the call** (often a **Pinia store** action), so a failure never shows a success toast and you do not get double messages.

- Use **`@/composables/useAppToast`** and **`@/utils/axios.getApiErrorMessage`** for user-facing error text from thrown API errors.
- In **store** actions: on success, toast success when appropriate; on error, toast error, then rethrow (or return a result) so callers can still react (e.g. keep a dialog open).
- In **components / composables**: for calls whose store already toasts, **do not** add another success/error toast for the same request. Reserve local toasts for **client-side validation** or flows where no store handles feedback.
- **Batched** flows (e.g. save many items then one summary toast): store actions may accept options such as `{ silent: true }` to skip per-item toasts; the orchestrator shows a single success/error. Use **`{ suppressSuccess: true }`** only when another layer shows success but errors should still surface from the store.

**Try/catch:** Use it where you need to branch, clean up, or map errors. You do not need a redundant `try/catch` in a component that only re-toasts the same error the store already handled.

---

## 3. Types and interfaces

- Prefer **shared** types in `src/interfaces/` and `src/types/` by **domain** (e.g. scheduler, staff, bookings, scope).
- **Avoid** large, reusable interfaces only inside a single SFC. Small props-only or local union types next to a component are acceptable.
- `src/types/` and `src/interfaces/` may both exist; follow existing file naming in each area.

---

## 4. Styling, design tokens, and UI

### Principles

- **No random hex in components** for brand surfaces — use **`brand.*`**, **`slate`**, and tokens from **`tailwind.config.js`**. For one-off data colors (e.g. calendar), keep them in a named constant or existing pattern in the same feature.
- **Tailwind first:** Use utility classes; use **`scoped` `<style>`** with `:deep()` for styling dynamically generated HTML tags (such as compiled Markdown output) or complex PrimeVue child selectors.
- **Scope:** `scoped` on component style blocks. Shared patterns belong in theme-level config, not copy-paste across SFCs.
- **Units:** **`rem`** for spacing and type; **`px`** is fine for 1px hairlines, borders, or design-spec alignment.
- **Icons:** **PrimeIcons** only (`pi pi-*`) for product UI. Do not add another full icon set for the same surfaces.

**Source of truth for tokens:** `tailwind.config.js` — extended **`fontFamily.sans`**, **`colors.brand` / `accent` / `gradient`**, **`boxShadow`**, and **`backgroundImage`** (e.g. `bg-btn-gradient`, `shadow-input-focus`).

### Typography and font

Use the **Tailwind scale`** (`text-xs` … `text-2xl`). Prefer **`text-sm`** for default body in dense UI, **`text-xs`** for meta, labels, and badges; use **`font-normal` / `font-medium` / `font-semibold` / `font-bold`** consistently in a hierarchy. **Avoid new arbitrary `text-[…]`** in components—prefer scale classes; when editing legacy files that still use arbitrary sizes, migrate toward `text-sm` / `text-xs` where practical.

---

## 5. Streaming State Management (`Pinia`)
All streaming data and application state must reside inside Pinia stores (`@/stores/useScopeStore`).
* **Session Lifecycle**: Manage active state parameters (`isInitiating`, `isStreaming`, `streamError`) in the store to sync with form and output actions.
* **Granular Updates**: Append and update sections on the fly inside the store as SSE messages arrive.

---

## 6. Event-Stream Consumption (`useAgentStream`)
Avoid writing manual `EventSource` wrappers inside UI components.
* Use the unified `useAgentStream` composable.
* Handle SSE connections asynchronously: trigger loading states during initiation and cleanly close connections on error or component unmount to prevent resource memory leaks.
