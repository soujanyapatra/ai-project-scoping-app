<script setup lang="ts">
import DiscoveryForm from '@/components/DiscoveryForm.vue'
import ScopeOutput from '@/components/ScopeOutput.vue'
import { useI18n } from 'vue-i18n'
import { Toast } from '@/lib/primevue'

const { t } = useI18n()
</script>

<template>
  <Toast />
  <main class="min-h-screen bg-brand-light bg-soft-blobs relative overflow-hidden font-sans">
    <!-- Decorative background elements for premium depth -->
    <div class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-100/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-100/10 rounded-full blur-[140px] pointer-events-none"></div>
    
    <!-- Top sticky glass navigation bar -->
    <nav class="sticky top-0 z-50 w-full border-b border-slate-200/40 bg-white/75 backdrop-blur-md">
      <div class="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <!-- Brand Logo -->
        <div class="flex items-center gap-2.5">
          <div class="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-coral flex items-center justify-center text-white shadow-md shadow-brand-500/15">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-lg font-black tracking-tight text-slate-900">
            ScopeFlow<span class="bg-gradient-to-r from-brand-600 to-accent-coral bg-clip-text text-transparent">.ai</span>
          </span>
        </div>

        <!-- Status & version details -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-100 bg-white/80 shadow-sm">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Engine Online</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content Workspace -->
    <section class="mx-auto max-w-6xl px-4 py-8 relative z-10">
      <!-- Title header -->
      <header class="mb-8 flex flex-col gap-1.5 max-w-xl">
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {{ t('app.title') }}
        </h1>
        <p class="text-sm text-slate-500 font-medium leading-relaxed">
          {{ t('app.subtitle') }}
        </p>
      </header>

      <!-- App grid split -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
        <DiscoveryForm />
        <ScopeOutput />
      </div>
    </section>
  </main>
</template>
