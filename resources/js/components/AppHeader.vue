<script setup lang="ts">
import { useScopeStore } from '@/stores/useScopeStore'

const scopeStore = useScopeStore()
</script>

<template>
  <header class="app-header shrink-0 bg-white border-b border-zinc-200/80 relative z-30">
    <div class="mx-auto max-w-7xl px-6 lg:px-8 h-[52px] flex items-center justify-between gap-6">

      <button
        type="button"
        class="brand-btn flex items-center gap-3 min-w-0 -ml-2 pl-2 pr-3 py-1.5 rounded-lg select-none outline-none transition-colors duration-150 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
        title="Go to home"
        @click="scopeStore.reset"
      >
        <span class="flex items-center justify-center h-7 w-7 rounded-[7px] bg-zinc-950 shrink-0">
          <svg class="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
          </svg>
        </span>
        <span class="flex items-center gap-2 min-w-0">
          <span class="text-[15px] font-semibold tracking-[-0.01em] text-zinc-950 leading-none">ScopeFlow</span>
          <span class="text-[10px] font-semibold uppercase tracking-[0.06em] text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-200 bg-zinc-50 leading-none">AI</span>
        </span>
      </button>

      <div class="flex items-center shrink-0">
        <div class="hidden sm:flex items-center gap-2 h-8 px-3 rounded-full border border-emerald-200/80 bg-emerald-50/80 select-none">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"></span>
          <span class="text-[11px] font-medium text-emerald-800 leading-none">Live</span>
        </div>
      </div>

    </div>
  </header>
</template>

<style scoped>
.app-header {
  box-shadow: 0 1px 0 rgba(9, 9, 11, 0.04);
}
</style>
