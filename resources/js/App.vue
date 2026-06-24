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
  <div class="h-screen flex flex-col bg-zinc-50/30 text-zinc-900 font-sans antialiased relative overflow-hidden">
    <!-- Radial dot grid background (Linear/Vercel style) -->
    <div class="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_0)] bg-[size:24px_24px] pointer-events-none z-0"></div>

    <!-- Sticky Navigation header -->
    <nav class="shrink-0 h-14 bg-white/70 backdrop-blur-md transition-all duration-300 border-b border-transparent shadow-[0_2px_12px_rgba(9,9,11,0.005),0_1px_2px_rgba(9,9,11,0.003)]">
      <div class="mx-auto max-w-7xl px-6 h-full flex items-center justify-between">
        
        <!-- Left Side: Brand & Search -->
        <div class="flex items-center gap-6">
          <!-- Brand Identity -->
          <div class="flex items-center gap-3 select-none cursor-pointer group" @click="scopeStore.reset">
            <div class="relative flex items-center justify-center h-8.5 w-8.5 rounded-lg bg-white shadow-xs border border-zinc-200/80 overflow-hidden group-hover:border-zinc-300 transition-all duration-200">
              <!-- Geometric Isometric Cube SVG Logo -->
              <svg class="h-4.5 w-4.5 text-zinc-950 group-hover:text-indigo-600 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
              </svg>
              <!-- Ambient gradient overlay -->
              <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            
            <div class="flex flex-col">
              <div class="flex items-center gap-1.5 leading-none">
                <span class="text-[13.5px] font-extrabold tracking-tight text-zinc-950">ScopeFlow</span>
                <span class="text-[8.5px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-zinc-950 text-white shadow-xs">AI</span>
              </div>
              <span class="text-[9.5px] text-zinc-450 font-semibold tracking-wider uppercase mt-0.5">Project Architect</span>
            </div>
          </div>

          <!-- Vertical Divider -->
          <div class="hidden sm:block h-4 w-px bg-zinc-200"></div>

          <!-- Mock Command Search Bar -->
          <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200/50 hover:border-zinc-200 active:scale-[0.98] cursor-pointer transition-all duration-150 w-52 justify-between select-none">
            <span class="text-[11px] text-zinc-450 font-medium flex items-center gap-2">
              <svg class="h-3.5 w-3.5 text-zinc-450" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Search or ask...
            </span>
            <kbd class="text-[9px] font-bold text-zinc-400 bg-white border border-zinc-200 rounded px-1.5 py-0.2 shadow-3xs font-mono">⌘K</kbd>
          </div>
        </div>

        <!-- Center / Right: Nav items -->
        <div class="flex items-center gap-6">
          <div class="hidden md:flex items-center gap-1.5 select-none">
            <a href="#" class="text-xs font-semibold px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white transition-all duration-200 shadow-sm border border-transparent active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2">
              Scope Builder
            </a>
            <a href="#" class="text-xs font-medium px-3 py-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 transition-all duration-200 border border-transparent active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2">
              Templates
            </a>
            <a href="#" class="text-xs font-medium px-3 py-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 transition-all duration-200 border border-transparent active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2">
              Saved Blueprints
            </a>
          </div>

          <!-- Vertical Divider -->
          <div class="hidden md:block h-4 w-px bg-zinc-200"></div>

          <!-- Right Navigation Elements -->
          <div class="flex items-center gap-3">
            <!-- Active engine badge -->
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/50 text-emerald-800 border border-emerald-100/80 text-[10px] font-bold tracking-wider uppercase select-none">
              <span class="relative flex h-1.5 w-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Engine Active
            </span>
            
            <!-- User Profile Avatar Mockup -->
            <div class="relative h-7.5 w-7.5 rounded-full overflow-hidden border border-zinc-200/80 shadow-2xs hover:scale-105 transition-all duration-200 cursor-pointer">
              <!-- Dynamic Gradient Avatar -->
              <div class="h-full w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white tracking-wider select-none">
                SF
              </div>
            </div>
          </div>
        </div>

      </div>
    </nav>


    <main class="flex-grow overflow-hidden relative z-10 flex flex-col">
      <transition name="layout" mode="out-in">

        <!-- Onboarding & Landing Screen -->
        <div v-if="!hasStarted" key="landing" class="flex-grow overflow-y-auto flex flex-col items-center justify-start py-12 px-6">
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
                  class="group text-left p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-900/80 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 cursor-pointer transition-all duration-200 shadow-sm flex flex-col justify-between"
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
                    <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-650 border border-zinc-200">${{ (p.budgetUsd / 1000) }}k</span>
                    <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-650 border border-zinc-200 capitalize">{{ p.platforms[0] }}</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Form Container -->
            <DiscoveryForm />

          </div>
        </div>

        <!-- Main Workspace (Form + Output) -->
        <div v-else key="workspace" class="flex-grow overflow-hidden mx-auto w-full max-w-7xl px-6 py-6 flex flex-col">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch overflow-hidden h-full flex-grow">
            
            <!-- Sticky Sidebar form configuration -->
            <aside class="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden">
              <div class="flex items-center justify-between shrink-0">
                <span class="text-xs font-bold uppercase tracking-wider text-zinc-400">Parameters</span>
                <button
                  class="rounded-md border border-zinc-200 hover:border-zinc-950 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-semibold py-1.5 px-3 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 cursor-pointer transition-all duration-150 shadow-sm"
                  @click="scopeStore.reset"
                >
                  New Document
                </button>
              </div>
              <div class="flex-grow overflow-y-auto pr-1">
                <DiscoveryForm is-sidebar />
              </div>
            </aside>

            <!-- Main output report viewer -->
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
