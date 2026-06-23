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
    successCriteria: 'Provide less than 200ms latency for dashboard API endpoints.'
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
    successCriteria: 'Provide offline viewing capabilities for recently visited catalogs.'
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
    successCriteria: 'Under 1.5s round-trip time for automated support responses.'
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
  
  <!-- Premium horizontal progress bar (Linear style) -->
  <div v-if="scopeStore.isInitiating || scopeStore.isStreaming" class="fixed top-0 left-0 right-0 h-[3px] z-[9999] overflow-hidden bg-zinc-100">
    <div class="h-full bg-zinc-950 animate-progress origin-left"></div>
  </div>

  <div class="min-h-screen bg-zinc-50/30 text-zinc-900 font-sans antialiased relative">
    <!-- Radial dot grid background (Linear/Vercel style) -->
    <div class="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.04)_1px,transparent_0)] bg-[size:24px_24px] pointer-events-none z-0"></div>

    <!-- Sticky Navigation header -->
    <nav class="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div class="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="h-7 w-7 rounded-md bg-zinc-950 flex items-center justify-center text-white shadow-sm ring-1 ring-zinc-900/10">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="text-sm font-semibold tracking-tight text-zinc-950">ScopeFlow<span class="text-zinc-400">.ai</span></span>
          <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">v1.0.0</span>
        </div>
        
        <div class="flex items-center gap-4">
          <span class="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Agent Engine Active
          </span>
          <a href="https://github.com" target="_blank" class="text-zinc-400 hover:text-zinc-600 transition-colors">
            <i class="pi pi-github text-sm"></i>
          </a>
        </div>
      </div>
    </nav>

    <main class="relative z-10">
      <transition name="layout" mode="out-in">

        <!-- Onboarding & Landing Screen -->
        <div v-if="!hasStarted" key="landing" class="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] py-12 px-6">
          <div class="w-full max-w-3xl flex flex-col gap-10">
            
            <header class="text-center flex flex-col items-center gap-3">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                <i class="pi pi-sparkles text-[9px] text-zinc-600"></i> Smart Architecture Blueprinting
              </span>
              <h1 class="text-3xl sm:text-4.5xl font-extrabold tracking-tight text-zinc-900 leading-none">
                {{ t('app.title') }}
              </h1>
              <p class="text-sm sm:text-base text-zinc-500 max-w-md leading-relaxed">
                {{ t('app.subtitle') }}
              </p>
            </header>

            <!-- Presets Grid -->
            <div class="flex flex-col gap-3.5">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Select a template to start</h3>
                <span class="text-[11px] text-zinc-400">Pre-fills parameters</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  v-for="p in presets"
                  :key="p.title"
                  type="button"
                  class="group text-left p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-900/80 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                  @click="applyPreset(p)"
                >
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-[13px] font-bold text-zinc-900">{{ p.title }}</span>
                      <svg class="h-3 w-3 text-zinc-400 group-hover:text-zinc-950 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <span class="text-xs text-zinc-500 leading-relaxed block mb-3">{{ p.desc }}</span>
                  </div>
                  
                  <!-- Preset attributes -->
                  <div class="flex items-center gap-1.5 flex-wrap pt-2 border-t border-zinc-100">
                    <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">${{ (p.budgetUsd / 1000) }}k</span>
                    <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 capitalize">{{ p.platforms[0] }}</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Form Container -->
            <div class="bg-white rounded-xl border border-zinc-200/80 shadow-md p-6 sm:p-8">
              <DiscoveryForm />
            </div>

          </div>
        </div>

        <!-- Main Workspace (Form + Output) -->
        <div v-else key="workspace" class="mx-auto max-w-7xl px-6 py-8">
          <div class="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            
            <!-- Sticky Sidebar form configuration -->
            <aside class="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-[76px] max-h-[calc(100vh-110px)] overflow-y-auto pr-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">Parameters</span>
                <button
                  class="rounded-md border border-zinc-200 hover:border-zinc-950 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-semibold py-1.5 px-3 cursor-pointer transition-colors shadow-sm"
                  @click="scopeStore.reset"
                >
                  New Document
                </button>
              </div>
              <DiscoveryForm is-sidebar />
            </aside>

            <!-- Main output report viewer -->
            <div class="lg:col-span-8">
              <ScopeOutput />
            </div>

          </div>
        </div>

      </transition>
    </main>
  </div>
</template>

<style>
@keyframes progress {
  0% { transform: scaleX(0); }
  50% { transform: scaleX(0.7); }
  100% { transform: scaleX(1); }
}
.animate-progress {
  animation: progress 2.5s infinite linear;
}

.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.layout-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.layout-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
