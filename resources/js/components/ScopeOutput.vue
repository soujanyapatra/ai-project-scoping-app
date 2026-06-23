<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  Button,
  Card,
  ProgressSpinner,
  Tag,
} from '@/lib/primevue'
import { useScopeStore } from '@/stores/useScopeStore'

// 4. Composables
const { t } = useI18n()

// 5. Pinia Store
const scopeStore = useScopeStore()

// 6. Reactive State
const isCopied = ref(false)
const activeTab = ref(1)
const viewMode = ref<'steps' | 'full'>('steps')

// 7. Computed
const step1Status = computed(() => {
  const hasStep1 = scopeStore.sections.some(s => s.step === 1)
  const hasStep2 = scopeStore.sections.some(s => s.step === 2)
  if (hasStep2) return 'completed'
  if (hasStep1) {
    if (scopeStore.isStreaming && scopeStore.sections[scopeStore.sections.length - 1]?.step === 1) return 'active'
    return 'completed'
  }
  return 'pending'
})

const step2Status = computed(() => {
  const hasStep2 = scopeStore.sections.some(s => s.step === 2)
  const hasStep3 = scopeStore.sections.some(s => s.step === 3)
  if (hasStep3) return 'completed'
  if (hasStep2) {
    if (scopeStore.isStreaming && scopeStore.sections[scopeStore.sections.length - 1]?.step === 2) return 'active'
    return 'completed'
  }
  return 'pending'
})

const step3Status = computed(() => {
  const hasStep3 = scopeStore.sections.some(s => s.step === 3)
  if (hasStep3) {
    if (scopeStore.isStreaming) return 'active'
    return 'completed'
  }
  return 'pending'
})

const hasDocument = computed(() => {
  return scopeStore.sections.some(s => s.step === 3 && s.content.trim().length > 0)
})

const activeSection = computed(() => {
  return scopeStore.sections.find(s => s.step === activeTab.value)
})

// 8. Methods
function parseInline(text: string): string {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
  // Italic: *text*
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
  return html
}

function parseMarkdown(text: string, step: number): string {
  if (!text) return ''
  const lines = text.split('\n')
  let inList = false
  const result: string[] = []

  for (let line of lines) {
    let trimmed = line.trim()

    // Step 1 special layout: Classification pill
    if (step === 1 && trimmed.startsWith('Classification:')) {
      const value = parseInline(trimmed.replace('Classification:', '').trim())
      let severityClass = 'bg-slate-50 text-slate-700 border-slate-200'
      let icon = 'pi-info-circle'
      if (value.toLowerCase().includes('low')) {
        severityClass = 'bg-emerald-50 text-emerald-700 border-emerald-100'
        icon = 'pi-shield'
      } else if (value.toLowerCase().includes('medium-high') || value.toLowerCase().includes('high')) {
        severityClass = 'bg-rose-50/60 text-rose-700 border-rose-100'
        icon = 'pi-fire'
      } else if (value.toLowerCase().includes('medium')) {
        severityClass = 'bg-amber-50/80 text-amber-700 border-amber-100'
        icon = 'pi-exclamation-triangle'
      }
      result.push(`
        <div class="mb-4 p-4 rounded-xl border flex items-center justify-between gap-3 ${severityClass} shadow-sm">
          <div class="flex items-center gap-2">
            <i class="pi ${icon} text-lg"></i>
            <span class="text-xs font-bold uppercase tracking-wider opacity-90">Complexity Classification</span>
          </div>
          <span class="text-xs font-extrabold px-3.5 py-1 rounded-lg border bg-white shadow-sm tracking-wide">${value}</span>
        </div>
      `)
      continue
    }

    // Step 1 special layout: Rationale block
    if (step === 1 && trimmed.startsWith('Rationale:')) {
      const val = trimmed.replace('Rationale:', '').trim()
      result.push(`
        <div class="p-4 bg-slate-50/60 border border-slate-100/80 rounded-xl mt-3 relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-slate-400"></div>
          <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Architecture Rationale</span>
          <p class="text-slate-600 text-sm leading-relaxed">${parseInline(val)}</p>
        </div>
      `)
      continue
    }

    // Step 2 & 3: Styled Risk Alert Cards
    if (step === 2 && trimmed.startsWith('- ')) {
      const contentWithoutBullet = trimmed.substring(2).trim()
      if (contentWithoutBullet.includes('**Risk**:') || contentWithoutBullet.includes('**Mitigation**:')) {
        let riskText = ''
        let mitigationText = ''
        
        const riskMatch = contentWithoutBullet.match(/\*\*Risk\*\*:\s*(.*?)(?=\s*\*\*Mitigation\*\*:|$)/i)
        const mitMatch = contentWithoutBullet.match(/\*\*Mitigation\*\*:\s*(.*)/i)
        
        if (riskMatch) riskText = riskMatch[1].trim()
        if (mitMatch) mitigationText = mitMatch[1].trim()
        
        if (riskText || mitigationText) {
          result.push(`
            <div class="mb-4 p-4 border border-slate-100 bg-slate-50/40 rounded-xl flex flex-col gap-2.5 shadow-sm">
              <div class="flex items-start gap-2">
                <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1 mt-0.5">
                  <i class="pi pi-exclamation-circle text-[8px]"></i> Risk
                </span>
                <p class="text-xs font-semibold text-slate-800 leading-relaxed">${parseInline(riskText)}</p>
              </div>
              <div class="flex items-start gap-2 border-t border-slate-100/50 pt-2.5">
                <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1 mt-0.5">
                  <i class="pi pi-check-circle text-[8px]"></i> Mitigation
                </span>
                <p class="text-xs text-slate-600 leading-relaxed">${parseInline(mitigationText)}</p>
              </div>
            </div>
          `)
          continue
        }
      }
    }

    // Default lists
    if (trimmed.startsWith('- ')) {
      if (!inList) {
        result.push('<ul class="list-disc pl-5 my-3 space-y-1.5 text-slate-600 text-sm">')
        inList = true
      }
      result.push(`<li class="leading-relaxed">${parseInline(trimmed.substring(2))}</li>`)
      continue
    } else {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      result.push(`<h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mt-6 mb-2">${parseInline(trimmed.substring(4))}</h4>`)
    } else if (trimmed.startsWith('## ')) {
      result.push(`<h3 class="text-base font-extrabold text-slate-900 mt-6 mb-3 pb-1.5 border-b border-slate-100">${parseInline(trimmed.substring(3))}</h3>`)
    } else if (trimmed.startsWith('# ')) {
      result.push(`<h2 class="text-lg font-black text-slate-950 mt-8 mb-4">${parseInline(trimmed.substring(2))}</h2>`)
    } else if (trimmed === '') {
      continue
    } else {
      result.push(`<p class="text-slate-600 text-sm leading-relaxed mb-3.5">${parseInline(trimmed)}</p>`)
    }
  }

  if (inList) {
    result.push('</ul>')
  }

  return result.join('\n')
}

const getFullMarkdown = () => {
  return scopeStore.sections.map(s => {
    return `## Step ${s.step} - ${s.title}\n\n${s.content}`
  }).join('\n\n')
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(getFullMarkdown())
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 2000)
  } catch (err) {
    // fallback
  }
}

const downloadDocument = () => {
  const markdownText = getFullMarkdown()
  const blob = new Blob([markdownText], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `project_scope_${scopeStore.sessionId || 'document'}.md`
  link.click()
  URL.revokeObjectURL(url)
}

// 9. Watchers
watch(() => scopeStore.sections.length, (newLength) => {
  if (newLength > 0 && scopeStore.isStreaming) {
    const latestStep = scopeStore.sections[newLength - 1].step
    activeTab.value = latestStep
  }
})

watch(() => scopeStore.isStreaming, (streaming) => {
  if (streaming && scopeStore.sections.length > 0) {
    activeTab.value = scopeStore.sections[scopeStore.sections.length - 1].step
  }
})
</script>

<template>
  <Card class="shadow-xl border border-slate-100 rounded-2xl bg-white/90 backdrop-blur-md">
    <template #title>
      <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-base font-bold text-slate-900">{{ t('output.title') }}</h2>
          <p class="text-xs text-slate-400">Powered by LLM Assistant Engine</p>
        </div>
        <div class="flex items-center gap-2.5">
          <ProgressSpinner v-if="scopeStore.isInitiating || scopeStore.isStreaming" style="width:20px;height:20px" strokeWidth="6" />
          <Tag v-else :severity="scopeStore.sections.length > 0 ? 'success' : 'secondary'" :value="scopeStore.sections.length > 0 ? t('output.ready') : 'Idle'" class="rounded-md" />
        </div>
      </div>
    </template>
    
    <template #content>
      <section aria-live="polite" class="flex flex-col gap-5 pt-3">
        <!-- Error state -->
        <div v-if="scopeStore.streamError" class="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
          <i class="pi pi-exclamation-circle text-red-500 text-lg"></i>
          <p class="text-sm text-red-600 font-medium">{{ t('output.error') }} {{ scopeStore.streamError }}</p>
        </div>

        <!-- Waiting state -->
        <div v-else-if="scopeStore.sections.length === 0 && !scopeStore.isInitiating" class="py-12 px-4 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50">
          <div class="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <i class="pi pi-file-edit text-xl"></i>
          </div>
          <div class="max-w-xs">
            <h3 class="text-sm font-semibold text-slate-800 mb-1">Awaiting Parameters</h3>
            <p class="text-xs text-slate-500 leading-relaxed">{{ t('output.waiting') }}</p>
          </div>
        </div>

        <!-- Live Content Flow -->
        <div v-else class="flex flex-col gap-5">
          <!-- Stepper Tab Bar -->
          <div class="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1.5">
            <!-- Tab 1 Button -->
            <button 
              type="button"
              class="flex items-center gap-2 text-left p-2 rounded-lg transition-all duration-200 border-none outline-none cursor-pointer"
              :class="{
                'bg-white shadow-sm border border-slate-200/50 text-brand-600': activeTab === 1,
                'bg-transparent text-slate-500 hover:text-slate-800 opacity-70 hover:opacity-100': activeTab !== 1
              }"
              @click="activeTab = 1"
            >
              <div 
                class="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                :class="{
                  'bg-brand-600 text-white shadow-sm ring-4 ring-brand-100 animate-pulse': step1Status === 'active',
                  'bg-emerald-500 text-white': step1Status === 'completed',
                  'bg-slate-200 text-slate-400': step1Status === 'pending'
                }"
              >
                <i v-if="step1Status === 'completed'" class="pi pi-check text-[8px]"></i>
                <span v-else>1</span>
              </div>
              <span class="hidden sm:inline text-[10px] font-bold tracking-tight">Classification</span>
            </button>

            <!-- Tab 2 Button -->
            <button 
              type="button"
              class="flex items-center gap-2 text-left p-2 rounded-lg transition-all duration-200 border-none outline-none cursor-pointer border-l border-slate-200 pl-3"
              :class="{
                'bg-white shadow-sm border border-slate-200/50 text-brand-600': activeTab === 2,
                'bg-transparent text-slate-500 hover:text-slate-800 opacity-70 hover:opacity-100': activeTab !== 2
              }"
              @click="activeTab = 2"
            >
              <div 
                class="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                :class="{
                  'bg-brand-600 text-white shadow-sm ring-4 ring-brand-100 animate-pulse': step2Status === 'active',
                  'bg-emerald-500 text-white': step2Status === 'completed',
                  'bg-slate-200 text-slate-400': step2Status === 'pending'
                }"
              >
                <i v-if="step2Status === 'completed'" class="pi pi-check text-[8px]"></i>
                <span v-else>2</span>
              </div>
              <span class="hidden sm:inline text-[10px] font-bold tracking-tight">Risks & Mitigations</span>
            </button>

            <!-- Tab 3 Button -->
            <button 
              type="button"
              class="flex items-center gap-2 text-left p-2 rounded-lg transition-all duration-200 border-none outline-none cursor-pointer border-l border-slate-200 pl-3"
              :class="{
                'bg-white shadow-sm border border-slate-200/50 text-brand-600': activeTab === 3,
                'bg-transparent text-slate-500 hover:text-slate-800 opacity-70 hover:opacity-100': activeTab !== 3
              }"
              @click="activeTab = 3"
            >
              <div 
                class="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                :class="{
                  'bg-brand-600 text-white shadow-sm ring-4 ring-brand-100 animate-pulse': step3Status === 'active',
                  'bg-emerald-500 text-white': step3Status === 'completed',
                  'bg-slate-200 text-slate-400': step3Status === 'pending'
                }"
              >
                <i v-if="step3Status === 'completed'" class="pi pi-check text-[8px]"></i>
                <span v-else>3</span>
              </div>
              <span class="hidden sm:inline text-[10px] font-bold tracking-tight">Scope Document</span>
            </button>
          </div>

          <!-- Visualization Mode Selector -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">View Layout</span>
            <div class="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button 
                type="button" 
                class="text-[9px] font-bold px-3 py-1 rounded-md transition-all cursor-pointer border-none"
                :class="viewMode === 'steps' ? 'bg-white shadow-sm text-slate-800' : 'bg-transparent text-slate-500 hover:text-slate-800'"
                @click="viewMode = 'steps'"
              >
                Tabs
              </button>
              <button 
                type="button" 
                class="text-[9px] font-bold px-3 py-1 rounded-md transition-all cursor-pointer border-none"
                :class="viewMode === 'full' ? 'bg-white shadow-sm text-slate-800' : 'bg-transparent text-slate-500 hover:text-slate-800'"
                @click="viewMode = 'full'"
              >
                Full Report
              </button>
            </div>
          </div>

          <!-- Active Panel Content (Tabs View) -->
          <div v-if="viewMode === 'steps'" class="min-h-[400px] max-h-[580px] overflow-y-auto pr-1 flex flex-col">
            <article 
              v-if="activeSection" 
              class="rounded-xl border border-slate-100 bg-white p-5 shadow-sm relative overflow-hidden flex-grow"
            >
              <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-500"></div>

              <header class="mb-4 flex items-center justify-between gap-3 border-b border-slate-50 pb-2">
                <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span class="h-4.5 w-4.5 rounded-md bg-slate-100 text-[9px] font-black text-slate-500 flex items-center justify-center border border-slate-200">
                    {{ activeSection.step }}
                  </span>
                  {{ activeSection.title }}
                </h3>
                <Tag 
                  :value="activeSection.step === scopeStore.sections[scopeStore.sections.length - 1]?.step && scopeStore.isStreaming ? 'Streaming...' : 'Complete'" 
                  :severity="activeSection.step === scopeStore.sections[scopeStore.sections.length - 1]?.step && scopeStore.isStreaming ? 'warning' : 'success'"
                  class="rounded-md scale-90"
                />
              </header>

              <div class="prose max-w-none" v-html="parseMarkdown(activeSection.content, activeSection.step) + (scopeStore.isStreaming && scopeStore.sections[scopeStore.sections.length - 1]?.step === activeSection.step ? '<span class=\'inline-block ml-0.5 w-1.5 h-3.5 bg-brand-600 animate-pulse align-middle\'></span>' : '')"></div>
            </article>

            <!-- Locked Step Placeholder -->
            <div v-else class="py-20 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50 flex-grow">
              <div class="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <i class="pi pi-lock text-sm"></i>
              </div>
              <div>
                <h4 class="text-xs font-semibold text-slate-700 mb-0.5">Section Locked</h4>
                <p class="text-[10px] text-slate-400 leading-relaxed max-w-[200px]">This step will unlock once the previous steps are completed.</p>
              </div>
            </div>
          </div>

          <!-- Complete Combined Document (Full Report View) -->
          <div v-else class="max-h-[580px] overflow-y-auto pr-1 flex flex-col gap-4">
            <article 
              v-for="(section, idx) in scopeStore.sections"
              :key="`full-${section.step}-${idx}`"
              class="rounded-xl border border-slate-100 bg-white p-5 shadow-sm relative overflow-hidden"
            >
              <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-500"></div>
              
              <header class="mb-3 flex items-center justify-between gap-3 border-b border-slate-50 pb-2">
                <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <span class="h-4.5 w-4.5 rounded-md bg-slate-100 text-[9px] font-black text-slate-500 flex items-center justify-center border border-slate-200">
                    {{ section.step }}
                  </span>
                  {{ section.title }}
                </h3>
              </header>

              <div class="prose max-w-none" v-html="parseMarkdown(section.content, section.step) + (scopeStore.isStreaming && idx === scopeStore.sections.length - 1 ? '<span class=\'inline-block ml-0.5 w-1.5 h-3.5 bg-brand-600 animate-pulse align-middle\'></span>' : '')"></div>
            </article>
          </div>

          <!-- Export Actions -->
          <div v-if="hasDocument" class="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <Button 
              type="button" 
              icon="pi pi-copy" 
              :label="isCopied ? 'Copied!' : 'Copy Markdown'" 
              :severity="isCopied ? 'success' : 'secondary'" 
              outlined
              class="rounded-xl font-semibold text-xs py-2 px-3.5 transition-all"
              @click="copyToClipboard"
            />
            <Button 
              type="button" 
              icon="pi pi-download" 
              label="Download File" 
              class="rounded-xl bg-brand-600 text-white font-semibold text-xs py-2 px-3.5 shadow-sm hover:shadow-md transition-all border-none"
              @click="downloadDocument"
            />
          </div>
        </div>
      </section>
    </template>
  </Card>
</template>

<style scoped>
/* Robust styling overrides for compiled markdown HTML */
:deep(.prose) ul {
  padding-left: 1.25rem !important;
  margin-top: 0.5rem !important;
  margin-bottom: 0.75rem !important;
}
:deep(.prose) li {
  margin-top: 0.25rem !important;
  margin-bottom: 0.25rem !important;
  line-height: 1.625 !important;
}
:deep(.prose) h2, :deep(.prose) h3, :deep(.prose) h4 {
  font-weight: 800;
  color: var(--color-slate-900) !important;
}
:deep(.prose) p {
  line-height: 1.625;
  margin-bottom: 0.875rem;
}
</style>
