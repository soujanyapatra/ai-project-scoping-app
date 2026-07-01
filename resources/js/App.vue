<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import DiscoveryForm from '@/components/DiscoveryForm.vue'
import ScopeOutput from '@/components/ScopeOutput.vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Toast } from '@/lib/primevue'
import { useScopeStore } from '@/stores/useScopeStore'

const { t } = useI18n()
const scopeStore = useScopeStore()

const hasStarted = computed(() => {
  return scopeStore.workspaceActive
})

const selectedPreset = ref<string | null>(null)

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
  selectedPreset.value = p.title
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
  <div class="h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans antialiased relative overflow-hidden">

    <AppHeader />

    <!-- ─── Main ────────────────────────────────────────────────── -->
    <main class="flex-grow min-h-0 overflow-hidden relative z-10 flex flex-col">
      <transition name="layout" mode="out-in">

        <!-- ── Landing / Onboarding ── -->
        <div v-if="!hasStarted" key="landing" class="flex-grow min-h-0 overflow-y-auto overscroll-contain flex flex-col items-center justify-start px-5 pt-8 pb-16 sm:pt-10 sm:pb-20">
          <div class="w-full max-w-4xl flex flex-col gap-10 sm:gap-12">

            <!-- Hero -->
            <header class="text-center flex flex-col items-center gap-3.5 sm:gap-4">
              <h1 class="text-[28px] sm:text-[38px] font-extrabold tracking-[-0.02em] text-zinc-950 leading-[1.12] max-w-lg">
                {{ t('app.title') }}
              </h1>
              <p class="text-[14px] sm:text-[15px] text-zinc-500 max-w-md leading-relaxed">
                {{ t('app.subtitle') }}
              </p>
            </header>

            <!-- Templates -->
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">Quick-start templates</span>
                <span class="text-[11px] text-zinc-400">Auto-fills all fields</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  v-for="(p, i) in presets"
                  :key="p.title"
                  type="button"
                  class="preset-card group text-left rounded-xl border bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 p-4 flex flex-col gap-3 overflow-hidden animate-fade-in-up"
                  :class="selectedPreset === p.title
                    ? 'border-zinc-950 shadow-md ring-1 ring-zinc-950/5'
                    : 'border-zinc-200/90 hover:border-zinc-300'"
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
                  <div class="flex items-center gap-1.5 pt-2.5 border-t border-zinc-100/80">
                    <span
                      class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                      :class="{
                        'bg-indigo-50 text-indigo-600': p.color === 'indigo',
                        'bg-violet-50 text-violet-600': p.color === 'violet',
                        'bg-emerald-50 text-emerald-600': p.color === 'emerald',
                      }"
                    >${{ p.budgetUsd / 1000 }}k</span>
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
