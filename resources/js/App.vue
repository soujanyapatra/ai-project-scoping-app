<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Toast } from '@/lib/primevue'
import DiscoveryForm from '@/components/DiscoveryForm.vue'
import ScopeOutput from '@/components/ScopeOutput.vue'

const { t } = useI18n()
</script>

<template>
  <Toast />
  <main class="min-h-screen bg-brand-light">
    <section class="mx-auto max-w-6xl px-4 py-8">
      <header class="mb-6 flex flex-col gap-2">
        <h1 class="text-2xl font-semibold text-slate-900">{{ t('app.title') }}</h1>
        <p class="text-sm text-slate-600">{{ t('app.subtitle') }}</p>
      </header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DiscoveryForm />
        <ScopeOutput />
      </div>
    </section>
  </main>
</template>
