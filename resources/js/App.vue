<script setup lang="ts">
import DiscoveryForm from '@/components/DiscoveryForm.vue'
import ScopeOutput from '@/components/ScopeOutput.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Toast } from '@/lib/primevue'
import { useScopeStore } from '@/stores/useScopeStore'

const { t } = useI18n()
const scopeStore = useScopeStore()

const hasStarted = computed(() => {
  return scopeStore.sections.length > 0 || scopeStore.isInitiating || scopeStore.isStreaming
})

const presets = [
  {
    title: 'SaaS Platform',
    desc: 'Fintech analytics dashboard with billing',
    projectType: 'web_app',
    industry: 'Fintech & Billing',
    budgetUsd: 45000,
    platforms: ['web'],
    features: ['User Authentication', 'Interactive Analytics Dashboard', 'PDF Statement Exporting', 'Stripe Subscription Billing'],
    integrations: ['Stripe Billing', 'SendGrid API', 'Plaid Open Finance'],
    constraints: 'Must comply with SOC2 data hosting regulations.',
    successCriteria: 'Provide less than 200ms latency for dashboard API endpoints.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
    color: 'indigo'
  },
  {
    title: 'Mobile E-Commerce',
    desc: 'Direct-to-consumer native store app',
    projectType: 'mobile_app',
    industry: 'Retail & Fashion',
    budgetUsd: 30000,
    platforms: ['ios', 'android'],
    features: ['Universal Search & Filtering', 'Native Shopping Cart', 'Local Push Notifications', 'Apple Pay Integration'],
    integrations: ['Shopify headless Storefront API', 'OneSignal Push Service', 'Stripe Checkout'],
    constraints: 'Optimized asset delivery for low-bandwidth cellular connections.',
    successCriteria: 'Provide offline viewing capabilities for recently visited catalogs.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 18h.01"/></svg>`,
    color: 'violet'
  },
  {
    title: 'AI Customer Portal',
    desc: 'Healthcare CRM with NLP chat agent',
    projectType: 'ai_agent',
    industry: 'Healthcare Support',
    budgetUsd: 75000,
    platforms: ['web', 'ios'],
    features: ['Semantic Vector Search', 'Interactive Chat Widget', 'EHR Secure Data Ingestion', 'Doctor Booking Scheduler'],
    integrations: ['OpenAI Assistant API', 'Epic systems EHR', 'Twilio SMS Gateway'],
    constraints: 'Strict HIPAA compliance on health record data transmission.',
    successCriteria: 'Under 1.5s round-trip time for automated support responses.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a7 7 0 017 7c0 4-3 6-4 8H9c-1-2-4-4-4-8a7 7 0 017-7z"/><path d="M9 17h6M10 21h4"/></svg>`,
    color: 'emerald'
  }
]

const applyPreset = (p: typeof presets[0]) => {
  scopeStore.projectType = p.projectType as any
  scopeStore.industry = p.industry
  scopeStore.budgetUsd = p.budgetUsd
  scopeStore.platforms = p.platforms as any
  scopeStore.features = [...p.features]
  scopeStore.integrations = [...p.integrations]
  scopeStore.constraints = p.constraints
  scopeStore.successCriteria = p.successCriteria
  const start = new Date()
  const end = new Date()
  end.setMonth(start.getMonth() + 3)
  scopeStore.timelineStart = start
  scopeStore.timelineEnd = end
}
</script>

<template>
  <Toast />
  <div class="h-screen flex flex-col bg-[#fafafa] text-zinc-900 font-sans antialiased relative overflow-hidden">

    <!-- Subtle grid background -->
    <div class="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.025)_1px,transparent_0)] bg-[size:20px_20px] pointer-events-none z-0 opacity-60"></div>

    <!-- ─── Navigation ──────────────────────────────────────────── -->
    <nav class="shrink-0 h-[54px] bg-white/90 backdrop-blur-xl border-b border-zinc-200/60 relative z-20 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div class="mx-auto max-w-7xl px-5 h-full flex items-center justify-between">

        <!-- Brand -->
        <button
          type="button"
          class="flex items-center gap-2.5 select-none group outline-none"
          @click="scopeStore.reset"
          title="Go to home"
        >
          <!-- Logo mark -->
          <div class="relative flex items-center justify-center h-[30px] w-[30px] rounded-[8px] bg-zinc-950 shadow-sm group-hover:bg-zinc-800 transition-colors duration-150">
            <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
            </svg>
          </div>
          <!-- Name -->
          <div class="flex items-baseline gap-1.5">
            <span class="text-[14px] font-bold tracking-tight text-zinc-950 leading-none">ScopeFlow</span>
            <span class="text-[9px] font-bold uppercase tracking-widest px-1 py-0.5 rounded bg-zinc-950 text-white leading-none">AI</span>
          </div>
        </button>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <!-- Live indicator -->
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 select-none">
            <span class="relative flex h-1.5 w-1.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span class="text-[10px] font-semibold text-emerald-700 tracking-wide">Live</span>
          </div>

          <!-- Divider -->
          <div class="h-4 w-px bg-zinc-200 hidden sm:block"></div>

          <!-- Avatar -->
          <div class="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white select-none ring-1 ring-white ring-offset-1 ring-offset-zinc-100 shadow-sm cursor-default">
            SF
          </div>
        </div>

      </div>
    </nav>

    <!-- ─── Main ────────────────────────────────────────────────── -->
    <main class="flex-grow overflow-hidden relative z-10 flex flex-col">
      <transition name="layout" mode="out-in">

        <!-- ── Landing / Onboarding ── -->
        <div v-if="!hasStarted" key="landing" class="flex-grow overflow-y-auto flex flex-col items-center justify-center px-5 py-16">
          <div class="w-full max-w-2xl flex flex-col gap-12">

            <!-- Hero -->
            <header class="text-center flex flex-col items-center gap-4">
              <!-- Badge -->
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm text-[11px] font-semibold text-zinc-600 select-none">
                <svg class="h-3 w-3 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
                AI-Powered Architecture Scoping
              </div>

              <h1 class="text-[32px] sm:text-[40px] font-extrabold tracking-tight text-zinc-950 leading-[1.1]">
                {{ t('app.title') }}
              </h1>
              <p class="text-[15px] text-zinc-500 max-w-[380px] leading-[1.65]">
                {{ t('app.subtitle') }}
              </p>
            </header>

            <!-- Templates -->
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between mb-0.5">
                <span class="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Quick-start templates</span>
                <span class="text-[11px] text-zinc-400">Auto-fills all fields</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  v-for="(p, i) in presets"
                  :key="p.title"
                  type="button"
                  class="preset-card group text-left rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-zinc-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 p-4 flex flex-col gap-3 overflow-hidden animate-fade-in-up"
                  :style="{ animationDelay: `${i * 60}ms` }"
                  @click="applyPreset(p)"
                >
                  <!-- Icon -->
                  <div
                    class="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    :class="{
                      'bg-indigo-50 text-indigo-600': p.color === 'indigo',
                      'bg-violet-50 text-violet-600': p.color === 'violet',
                      'bg-emerald-50 text-emerald-600': p.color === 'emerald',
                    }"
                    v-html="p.icon"
                  ></div>

                  <!-- Content -->
                  <div class="flex-grow">
                    <div class="flex items-center justify-between">
                      <span class="text-[13px] font-bold text-zinc-900">{{ p.title }}</span>
                      <svg class="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all duration-150 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <p class="text-[12px] text-zinc-400 mt-0.5 leading-snug">{{ p.desc }}</p>
                  </div>

                  <!-- Tags -->
                  <div class="flex items-center gap-1.5 pt-2.5 border-t border-zinc-100">
                    <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-500">${{ p.budgetUsd / 1000 }}k</span>
                    <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-500 capitalize">{{ p.platforms.join(' + ') }}</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Form -->
            <DiscoveryForm />

          </div>
        </div>

        <!-- ── Workspace ── -->
        <div v-else key="workspace" class="flex-grow overflow-hidden w-full max-w-7xl mx-auto px-5 py-5 flex flex-col">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden">

            <!-- Sidebar -->
            <aside class="lg:col-span-4 flex flex-col gap-3 h-full overflow-hidden">
              <div class="flex items-center justify-between shrink-0 px-0.5">
                <span class="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Parameters</span>
                <button
                  class="inline-flex items-center gap-1.5 text-[12px] font-semibold py-1.5 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 cursor-pointer transition-all duration-150 shadow-xs"
                  @click="scopeStore.reset"
                >
                  <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  New
                </button>
              </div>
              <div class="flex-grow overflow-y-auto">
                <DiscoveryForm is-sidebar />
              </div>
            </aside>

            <!-- Output panel -->
            <div class="lg:col-span-8 h-full flex flex-col overflow-hidden">
              <ScopeOutput />
            </div>

          </div>
        </div>

      </transition>
    </main>

  </div>
</template>

<style>
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16,1,0.3,1), transform 0.2s cubic-bezier(0.16,1,0.3,1);
}
.layout-enter-from { opacity: 0; transform: translateY(8px); }
.layout-leave-to   { opacity: 0; transform: translateY(-4px); }

/* Preset card icon inner SVG sizing */
.preset-card [viewBox] {
  width: 1.125rem;
  height: 1.125rem;
}
</style>
