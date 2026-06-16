# Project coding standards (`rules.md`)

**Why some sections looked “thinner” for a while:** An earlier update focused on **API/toast/Pinia** rules and folded the long **visual** spec into a single paragraph. That was too aggressive for day-to-day UI work. The **Styling, design tokens, and UI** section below is the **design system** for this repo: fonts, type ladder, color, cards, buttons, and token references (`tailwind.config.js`, `src/styles/typography-tokens.css`). **All new UI and any update to an existing component should follow it** (and extend this file if you add platform-wide rules—do not add separate ad-hoc typography docs).

---

## Vue: `<script setup>` order

Use this order inside `<script setup>` (flexible where a step does not apply):

1. **Imports** — external first, then `@/…` (groups alphabetically when practical).
2. **Types** — only tiny, component-local types if needed; shared types live under `src/interfaces/` or `src/types/`.
3. `**defineProps` / `defineEmits`** — typed; defaults with `withDefaults` when needed.
4. `**useI18n`**, `**useAppToast`**, **router** — and other one-liner composables that have no store dependency.
5. **Pinia (and other heavy setup)** — call stores, then destructure (see [Pinia](#pinia) below).
6. **Constants** then **template refs** then **reactive state** (`ref` / `reactive` with explicit types).
7. **Computed**
8. **Methods** — prefer `const fn = () => {}` or `async` where appropriate.
9. **Watch** / `watchEffect`
10. **Lifecycle** — `onMounted`, `onBeforeUnmount`, etc.

**SFC file order:** `<script setup>` → `<template>` → `<style scoped>` (styles scoped unless a strong reason not to).

---

## Core

- **Stack:** Vue 3, Composition API, `<script setup>`, TypeScript, Pinia, PrimeVue.
- **Typing:** Type `ref`, `reactive`, props, and store exports. Avoid `any`; use narrow types, generics, or `unknown` in catches.
- **Pinia:** `defineStore('id', () => { ... })` with a clear return object; document non-obvious cross-store behavior in code comments if needed.
- **Imports:** Prefer the `**@/`** path alias. Same-folder imports may use relative paths when it improves clarity.
- **Components:** Self-closing custom components. No inline `style="..."` for layout/theming; use `scoped` CSS and/or **Tailwind classes from the design tokens** in `tailwind.config.js`.
- **Hygiene:** No stray `console.log` or commented dead code in PRs.
- **Quality:** Do not add `@ts-ignore` / `@ts-nocheck` to “make it compile”; fix types or add a contained assertion with a short comment.
- **HTTP:** Use the shared axios instance: `@/utils/axios`.
- **Lint / format:** Follow ESLint (and Stylelint for styles). Run `npm run lint` and `npm run format` before pushing when you touched those areas.
- **Scanability:** Where it helps, keep **imports**, **props**, and **interface / object keys** in **alphabetical** order.

---

## API calls, errors, and toasts

**Principle:** User-visible **success and error** feedback for a given HTTP request should come from **one place**, usually the **module that performs the call** (often a **Pinia store** action), so a failure never shows a success toast and you do not get double messages.

- Use `**@/composables/useAppToast`** and `**@/utils/axios.getApiErrorMessage`** for user-facing error text from thrown API errors.
- In **store** actions: on success, toast success when appropriate; on error, toast error, then rethrow (or return a result) so callers can still react (e.g. keep a dialog open).
- In **components / composables**: for calls whose store already toasts, **do not** add another success/error toast for the same request. Reserve local toasts for **client-side validation** or flows where no store handles feedback.
- **Batched** flows (e.g. save many items then one summary toast): store actions may accept options such as `{ silent: true }` to skip per-item toasts; the orchestrator shows a single success/error. Use `**{ suppressSuccess: true }`** only when another layer shows success but errors should still surface from the store.

**Try/catch:** Use it where you need to branch, clean up, or map errors. You do not need a redundant `try/catch` in a component that only re-toasts the same error the store already handled.

---

## i18n

- **No hardcoded user-facing strings** in templates; use `useI18n` and keys under `src/locales/`.
- **Locale parity:** When you **add, rename, or remove** a key, update **every** shipped locale file so they stay structurally aligned. The supported tags (and thus the `*.json` filenames) are defined in **`SUPPORTED_LOCALE_TAGS`** in `src/utils/i18nLocale.ts` — currently: `en`, `es-ES`, `pt`, `fr`, `de`, `id`, `sw`, `ar-EG`, `pt-BR`, `es-MX` (`src/locales/<tag>.json`). Add or edit the key in **`en.json`** first (source for copy and code review), then mirror the same key path and placeholders in the other locale files. If a proper translation is not ready, use the English string as a temporary value rather than omitting the key.
- **Key shape:** Hierarchical, e.g. `feature.component.element` or `admin.feature.label`.
- **Named interpolation:** `t('key', { name: value })` — avoid string concatenation with translated fragments.
- **English defaults:** When helpful for grep and fallbacks, use the overload `t('key', 'Default English string')` for new keys.
- Pluralization: prefer vue-i18n mechanisms over manual `n === 1` in templates for copy.

---

## Types and interfaces

- Prefer **shared** types in `src/interfaces/` and `src/types/` by **domain** (e.g. scheduler, staff, bookings).
- **Avoid** large, reusable interfaces only inside a single SFC. Small props-only or local union types next to a component are acceptable.
- `src/types/` and `src/interfaces/` may both exist; follow existing file naming in each area.

---

## Styling, design tokens, and UI

### Principles

- **No random hex in components** for brand surfaces — use `**brand.*`**, `**slate`**, and tokens from `**tailwind.config.js**`. For one-off data colors (e.g. calendar), keep them in a named constant or existing pattern in the same feature.
- **Tailwind first:** Use utility classes; use `**scoped` `<style>`** for animations or complex selectors that are awkward in utilities.
- **Scope:** `scoped` on component style blocks. Shared patterns belong in `src/styles/` or theme-level config, not copy-paste across 20 SFCs.
- **Units:** `**rem`** for spacing and type; `**px`** is fine for 1px hairlines, borders, or design-spec alignment.
- **Icons:** **PrimeIcons** only (`pi pi-*`) for product UI. Do not add another full icon set for the same surfaces.

**Source of truth for tokens:** `tailwind.config.js` — extended `**fontFamily.sans`**, `**colors.brand` / `accent` / `gradient`**, `**boxShadow**`, and `**backgroundImage**` (e.g. `bg-login-gradient`, `shadow-login-card`, `shadow-input-focus`).

### Typography and font

Use the **Tailwind scale** (`text-xs` … `text-2xl`). Prefer **`text-sm`** for default body in dense UI, **`text-xs`** for meta, labels, and badges; use **`font-normal` / `font-medium` / `font-semibold` / `font-bold`** consistently in a hierarchy. **Avoid new arbitrary `text-[…]`** in components—prefer scale classes; when editing legacy files that still use arbitrary sizes, migrate toward `text-sm` / `text-xs` where practical.

**Raw CSS:** `src/styles/typography-tokens.css` defines `--typ-*` for places Tailwind cannot reach (e.g. FullCalendar `:deep()`). Do not invent one-off `font-size` values—map to these variables.

| Role | CSS variable | Typical Tailwind in Vue |
|------|----------------|-------------------------|
| Tight timeline / meta | `--typ-micro` … `--typ-compact` | `text-xs` |
| Secondary lines | `--typ-small` | `text-xs` or `text-sm` |
| Default body | `--typ-body` | `text-sm` |
| Emphasized line / small heading | `--typ-subheading` | `text-sm` or `text-base` |
| Paragraph / section title | `--typ-base` | `text-base` |
| Large title / emphasis | `--typ-lg`, `--typ-xl` | `text-lg`, `text-xl` |

**PrimeVue:** `--font-size-base` is **0.875rem** (same as `text-sm` / `--typ-body`) so `.p-component` matches default UI body (`src/styles/primevue/_variables.css`). **Weights:** `--typ-weight-normal` … `--typ-weight-extrabold` in `typography-tokens.css`; mirror with Tailwind `font-*` in Vue.

**Hotspots** (heavy `text-*` usage—keep consistent when editing):

| Area | Notable files |
|------|----------------|
| Booking flow | `ReservationBookingModal.vue` |
| Staff | `AddEditStaffMemberDialog.vue`, `StaffWorkingHoursModal.vue`, `StaffSchedulePage.vue` |
| Scheduler | `ReservationListDrawer.vue`, `TherapistFilterList.vue`, `SchedulerPage.vue` |
| Admin | `AdminDefaultsTab.vue`, `AddEditTreatmentDialog.vue`, admin `*Tab.vue` |

Legacy **`text-[…]`** clusters (migrate when touched): `ReservationBookingModal.vue`, `StaffWeeklyPlannerPage.vue`, `SidebarPermissionNode.vue`, admin dialogs/tabs.

**Large legacy stylesheets** (prefer `--typ-*` when editing raw CSS): `scheduler/main.css`, `bookings-calendar.css`, `scheduler/reservation-modal.css`, `scheduler/past-reservation.css`, `scheduler/admin-drawer.css`, `scheduler/therapist-filter.css`, `primevue/calendar.css`.

**Legacy helpers** in `scheduler/main.css`: `.small` → `--typ-caption` (12px); `.subtle` → `--typ-small` (13px); `.badge` → `--typ-compact` (11px).

**Exception:** FullCalendar DOM in `bookings-calendar.css` uses `:deep()`—keep sizes aligned with **`--typ-*`**, avoid duplicate arbitrary px ladders.

**Other references:** `index.html` loads **Inter** (weights 400–800).

#### Role → classes (quick reference)

| Role                         | Classes (typical)                                                                    | Notes                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| **Base font**                | `font-sans` (default)                                                                | **Inter** stack from Tailwind `theme.extend.fontFamily.sans`.     |
| **Form labels**              | `text-sm font-medium text-slate-900`                                                 | For strong emphasis; `text-slate-700` is OK for secondary labels. |
| **Field value / input text** | `text-sm font-medium text-slate-800` or `text-slate-900`                             | Keeps data readable.                                              |
| **Helper / subtitle**        | `text-sm text-slate-500`                                                             | e.g. dialog body copy, hints under titles.                        |
| **Placeholder**              | Muted via Prime / `placeholder:text-slate-400` (when applicable) or `text-slate-400` | `font-normal` on surrounding control if the input looks too bold. |
| **Modal / panel title**      | `text-lg font-medium text-slate-900`                                                 | Or Prime `Dialog` `header` slot with same intent.                 |
| **Section subheading**       | `text-sm text-slate-500 font-normal`                                                 |                                                                   |
| **Error text (inline)**      | `text-xs font-medium text-red-500`                                                   | Under fields or in compact alerts.                                |
| **Badges / status tags**     | `text-xs font-medium uppercase tracking-wider`                                       | plus semantic color (see below).                                  |

Avoid mixing weights arbitrarily (e.g. not **both** `font-bold` and `font-medium` on the same line hierarchy).

### Color (semantic usage)

- **Neutrals:** `slate-*` for chrome (borders `slate-200`, muted copy `slate-500`–`slate-600`, strong text `slate-800`–`slate-900`).
- **Primary actions / brand moment:** `brand-600` and related `brand.*` (see config). Primary **Button** can rely on default Prime theme; utility accents use `bg-brand-600`, `border-brand-600`, `shadow-brand-200`, etc. when matching existing components.
- **Success / warn / danger:** Prefer Prime `severity` on `Button` and `Tag` (`success`, `warn`, `danger`, `secondary`); for raw Tailwind, `text-red-500`, `border-red-500`, `green-600`, `amber-500` — stay consistent with neighboring UI.
- **Accents (decorative only):** `accent.blue`, `accent.cyan`, etc. from `tailwind.config.js` — not for default body text.

### Cards and panels (content containers)

**Standard content card / admin section block** (align with e.g. admin tabs):

- Wrapper: `flex flex-col gap-6 p-4 border border-slate-200 rounded-xl bg-white shadow-sm`
- Inner grids: `grid grid-cols-1 md:grid-cols-2 gap-3` (or as layout requires) with `gap-4` / `gap-6` for vertical rhythm.
- **Do not** use `style="width:…"` for layout; use `max-w-*`, `w-full`, `minmax`, or Prime `pt` pass-through for dialogs.

Larger surfaces (login, marketing) may use `shadow-login-card` / gradient backgrounds — **only** where the login/auth pattern already does.

### Buttons (PrimeVue `Button`)

- **Import** from the project barrel: `@/lib/primevue` (see existing files).
- **Primary (save / create):** default severity or `severity="primary"`; match height/radius to siblings, e.g. `class="!text-sm !font-medium !h-10 !rounded-xl !px-6 …"` with `!shadow-lg shadow-brand-200` when a primary CTA is already used that way in the same feature.
- **Secondary / cancel:** `severity="secondary"` with `outlined` and border/text tokens, e.g. `!border-slate-200 !text-slate-600 hover:!bg-slate-50` — copy an existing **Cancel** in the same area for consistency.
- **Danger:** `severity="danger"`, `outlined` for non-final step, solid for confirm.
- **Toolbar / small actions:** `size="small"`, `text` for low-emphasis.
- **Footer order:** De-emphasized actions left or right per existing modal; **Cancel** then **Save** in read order is common in this app (see e.g. staff modals). Match nearby dialogs in the same feature.

### Dialogs and modals

- Prefer `**Dialog` + `pt`** to set `rounded-2xl`, `border-b border-slate-200` on header, consistent `px-5 py-4` / `px-5 py-5` content, footer border `border-t border-slate-200`.
- **Header copy:** title typography row above. **Body:** `flex flex-col gap-4` or `gap-3` for dense forms.
- Use `**:style="{ width: 'min(…px, 92vw)' }` only** when a dialog already uses that pattern for responsive width; otherwise prefer `max-w-*` classes on an inner root.

### Form controls (with Prime + Tailwind)

- **Label** above field: `flex flex-col gap-1.5` (or `gap-1` for tight rows).
- **InputNumber / InputText** often use `!rounded-xl` and `!border-slate-200` in `input-class` / `class`; **invalid** state: `!border-red-500` and optional `shadow-input-error` from `tailwind.config.js` if the field already does.
- **Native** `<input type="date">` etc.: `h-9` / `h-10`, `border border-slate-200 rounded-lg`, `px-3`, `text-sm text-slate-800` to align with Prime fields.

### Legacy numbered script order (reference)

If you need the **strict** checklist from the older doc: (1) Imports (2) Interfaces (3) `defineProps` (4) `defineEmits` (5) `useI18n` (6) Composables + stores (7) Constants (8) Template refs (9) `ref`/`reactive` (10) `computed` (11) methods (12) watchers (13) lifecycle. The **Vue: `<script setup>` order** section above is the current, slightly flexible version of that list.

---

## Components and folders

Suggested layout (extend only when a new area is justified):


| Path                        | Purpose                                        |
| --------------------------- | ---------------------------------------------- |
| `src/components/common/`    | Shared small UI (inputs, simple dialogs).      |
| `src/components/modals/`    | Larger, feature modals.                        |
| `src/components/staff/`     | Staff, availability, team member UIs.          |
| `src/components/scheduler/` | Calendar, booking grid, scheduler-specific UI. |
| `src/components/reports/`   | Reports and print-oriented views.              |


- **One main responsibility** per component; if a file grows well past **~400 lines** without a clear reason, consider splitting.
- **Props down, events up** — do not mutate props; emit to the parent.
- **Lists:** `v-for` with a **stable** key (`id`), not the array index when the list is reorderable or filtered.

---

## Composables and utils module boundaries

**Principle:** Prefer **one file per module/domain** and avoid near-duplicate helpers spread across multiple files.

### When to create a composable vs a util

- **Composables (`src/composables/`)**: hold **reactive state**, integrate with **Pinia**, **router**, or other Vue lifecycle concepts. They may call stores and other composables.
- **Utils (`src/utils/`)**: **pure helpers** (no Vue imports). They may be used by stores, composables, and components.

### Rules of thumb (to prevent file sprawl)

- **Do not create a new file for “one helper”** if an existing module already owns that domain. Extend the existing module instead.
- **Avoid duplicates**: if the same concept appears in 2 places (e.g. `isoAddDays`, therapist required-skill splitting), consolidate immediately into a single canonical export.
- **No `src/utils/*` → `src/composables/*` imports**. If a util needs a helper currently inside a composable, move that helper into a shared util module (example: `src/utils/datetime.ts`).

### Current “module homes” (examples)

- **Shared date/time primitives**: `src/utils/datetime.ts`
- **Booking slot + booking list normalization + drawer mapping**: `src/utils/bookings.ts`
- **Staff shifts payload builders**: `src/utils/staffShiftsPayload.ts`
- **API error message extraction**: `src/utils/apiErrors.ts`

## Pinia

### Hotel time zone (scheduler)

- **Canonical IANA zone:** `useHotelsStore().activeHotelTimeZone`, sourced from `POST /spa-scheduler/auth/hotels-list` (`settings.timeZone` on the selected property), with fallback `Australia/Sydney` (`FALLBACK_HOTEL_TIMEZONE` in `useHotelsStore`).
- **Do not pass** the active hotel time zone through component **props** (for example `timezone`, `timeZone`, `:time-zone`). Consume it from Pinia via `storeToRefs(useHotelsStore())` in components, or `useHotelsStore()` inside composables.
- Hotel switch uses full navigation to `/scheduler/:pmsId`; `AppNavbar` keeps `selectedPmsId` aligned with the route so the store matches the page context after load.
- **FullCalendar:** IANA `timeZone` and the “now” indicator require a named-timezone plugin. Register `@fullcalendar/moment-timezone` in the same `plugins` array as the other FullCalendar modules (`BookingsCalendar`). Without it, the grid uses the **browser** local zone for “now” and for interpreting named zones.
- **`storeToRefs(store)`** for **state and getters** you use in the component (keeps reactivity when destructuring).
- **Actions:** destructure at setup: `const { fetchX, updateY } = useSomeStore()` — do not sprinkle `useSomeStore().updateY()` across the file if you can avoid it.
- **Templates:** Prefer using names brought into the script (from `storeToRefs` + actions) over long `myStore.nested.thing` chains, when it improves readability.
- **Fetches:** Stores that load list data should use a **loaded** (and usually **loading**) pattern with optional `**force`** to skip cache after mutations — see existing stores.
- **After save:** Refresh **only the data that changed**; do not add blanket “reload everything” hooks for every local save.
- **Lazy data:** Mount-time fetch in the component (or store action invoked from `onMounted`) for data that is not needed until that view is visible.

## Performance and safety

- Heavy panels: prefer `**v-if`** so they are not in the tree until needed; frequent toggles can use `v-show`.
- **No `window.alert` / `window.confirm`** for product flows — use PrimeVue `**ConfirmDialog**` or an in-app two-step pattern.
- `**v-html`:** Avoid; if required, sanitize first and document why.

---

## PR and local workflow

- **Readable diffs** — one concern per commit when possible.
- **Verify:** `npm run build` (or at least `vue-tsc` / the project’s typecheck) after non-trivial TS/Vue changes.
- PRs that break lint, format, or agreed patterns may be sent back for revision.

---

## Editor (recommended)

- ESLint, Stylelint, **Vue (Official)**, Path Intellisense, EditorConfig, Tailwind CSS IntelliSense — keeps the repo consistent and catches issues early.

---

## What we avoid

- Double toasts (component + store) for the same API call.
- `any` as a long-term stand-in for real types.
- `loadCoreData()`-style full reloads after every small save.
- Native `confirm`/`alert` in user-facing flows.

This document is the project’s current agreement; if something here conflicts with an older habit, follow **this** file and update the code in that direction over time.