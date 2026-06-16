<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { Card, ProgressSpinner, Tag } from '@/lib/primevue'
import { useScopeStore } from '@/stores/useScopeStore'

const { t } = useI18n()
const scopeStore = useScopeStore()
</script>

<template>
  <Card>
    <template #title>
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-slate-900">{{ t('output.title') }}</h2>
        <ProgressSpinner v-if="scopeStore.isInitiating || scopeStore.isStreaming" style="width:20px;height:20px" />
        <Tag v-else severity="success" :value="t('output.ready')" />
      </div>
    </template>
    <template #content>
      <section aria-live="polite" class="flex flex-col gap-4">
        <p v-if="scopeStore.streamError" class="text-sm text-red-600">{{ t('output.error') }} {{ scopeStore.streamError }}</p>
        <p v-else-if="scopeStore.sections.length === 0" class="text-sm text-slate-600">{{ t('output.waiting') }}</p>
        <div v-else class="flex flex-col gap-4">
          <article
            v-for="(section, idx) in scopeStore.sections"
            :key="`${section.step}-${section.title}-${idx}`"
            class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <header class="mb-2 flex items-center justify-between gap-3">
              <h3 class="text-sm font-semibold text-slate-900">
                {{ t('output.stepPrefix') }} {{ section.step }} - {{ section.title }}
              </h3>
              <Tag :value="`${t('output.stepPrefix')} ${section.step}`" severity="secondary" />
            </header>
            <p class="whitespace-pre-wrap text-sm text-slate-700">{{ section.content }}</p>
          </article>
        </div>
      </section>
    </template>
  </Card>
</template>
