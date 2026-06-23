<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useScopeStore } from '@/stores/useScopeStore'
import { useAppToast } from '@/composables/useAppToast'

// 4. Composables
const { t } = useI18n()
const { showSuccess, showError } = useAppToast()

// 5. Pinia Store
const scopeStore = useScopeStore()

// 6. Reactive State
const isCopied = ref(false)
const activeTab = ref(1)
const viewMode = ref<'steps' | 'full' | 'editor'>('steps')
const fullMarkdownText = ref('')

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
const parseInline = (text: string): string => {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;br\s*\/?&gt;/gi, '<br />')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 700; color: #09090b;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #27272a;">$1</em>')
}

const parseMarkdown = (text: string, step: number): string => {
  if (!text) return ''
  const lines = text.split('\n')
  let inList = false
  let inTable = false
  const result: string[] = []

  const closeList = () => {
    if (inList) {
      result.push('</ul>')
      inList = false
    }
  }

  const closeTable = () => {
    if (inTable) {
      result.push('</tbody></table></div>')
      inTable = false
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // Table parser
    if (trimmed.startsWith('|')) {
      closeList()
      if (!inTable) {
        result.push('<div style="overflow-x: auto; margin: 16px 0; border: 1px solid #e4e4e7; border-radius: 8px;"><table style="width: 100%; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 13px; text-align: left;">')
        inTable = true
      }
      
      // Skip separator line (e.g. |---|---|)
      if (trimmed.replace(/[\s|:-]/g, '') === '') {
        continue
      }
      
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim())
      // Check if we already have a tbody started
      const hasTableBody = result.some(r => r.includes('<tbody'))
      
      if (!hasTableBody) {
        result.push('<thead style="background-color: #f8f8f9;"><tr>')
        cells.forEach(cell => {
          result.push(`<th style="padding: 10px 12px; font-weight: bold; color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e4e4e7;">${parseInline(cell)}</th>`)
        })
        result.push('</tr></thead><tbody style="background-color: #ffffff;">')
      } else {
        result.push('<tr>')
        cells.forEach(cell => {
          result.push(`<td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; color: #3f3f46; vertical-align: top; line-height: 1.5;">${parseInline(cell)}</td>`)
        })
        result.push('</tr>')
      }
      continue
    } else {
      closeTable()
    }

    // Horizontal Rule parser
    if (trimmed.match(/^---+$/) || trimmed.match(/^\*\*\*+$/)) {
      closeList()
      result.push('<hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 24px 0;" />')
      continue
    }

    // Step 1 special layout: Classification pill
    if (step === 1 && trimmed.startsWith('Classification:')) {
      const value = parseInline(trimmed.replace('Classification:', '').trim())
      let severityClass = 'background-color: #fafafa; color: #18181b; border-color: #e4e4e7;'
      let icon = 'pi-info-circle'
      if (value.toLowerCase().includes('low')) {
        severityClass = 'background-color: #fafafa; color: #18181b; border-color: #e4e4e7;'
        icon = 'pi-shield'
      } else if (value.toLowerCase().includes('medium-high') || value.toLowerCase().includes('high')) {
        severityClass = 'background-color: #09090b; color: #fafafa; border-color: #09090b;'
        icon = 'pi-fire'
      } else if (value.toLowerCase().includes('medium')) {
        severityClass = 'background-color: #18181b; color: #f4f4f5; border-color: #27272a;'
        icon = 'pi-exclamation-triangle'
      }
      result.push(`
        <div style="margin-bottom: 16px; padding: 16px; border: 1px solid #e4e4e7; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 12px; ${severityClass}">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="pi ${icon}" style="font-size: 14px;"></i>
            <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Complexity Classification</span>
          </div>
          <span style="font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid #e4e4e7; background-color: #ffffff; color: #18181b;">${value}</span>
        </div>
      `)
      continue
    }

    // Step 1 special layout: Rationale block
    if (step === 1 && trimmed.startsWith('Rationale:')) {
      const val = trimmed.replace('Rationale:', '').trim()
      result.push(`
        <div style="padding: 16px; background-color: #fafafa; border: 1px solid #e4e4e7; border-left: 4px solid #09090b; border-radius: 8px; margin-top: 12px;">
          <span style="display: block; font-size: 10px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Architecture Rationale</span>
          <p style="color: #3f3f46; font-size: 14px; line-height: 1.6; margin: 0;">${parseInline(val)}</p>
        </div>
      `)
      continue
    }

    // Step 2 & 3: Styled Risk Alert Cards
    if (step === 2 && (trimmed.startsWith('- ') || trimmed.startsWith('• '))) {
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
            <div style="margin-bottom: 16px; padding: 16px; border: 1px solid #e4e4e7; background-color: #ffffff; border-radius: 8px; display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; align-items: start; gap: 8px;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; background-color: #f4f4f5; color: #18181b; border: 1px solid #e4e4e7; margin-top: 2px;">
                  Risk
                </span>
                <p style="font-size: 13px; font-weight: 600; color: #27272a; line-height: 1.5; margin: 0;">${parseInline(riskText)}</p>
              </div>
              <div style="display: flex; align-items: start; gap: 8px; border-top: 1px solid #f4f4f5; padding-top: 10px;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; background-color: #09090b; color: #ffffff; border: 1px solid #09090b; margin-top: 2px;">
                  Mitigation
                </span>
                <p style="font-size: 13px; color: #52525b; line-height: 1.5; margin: 0;">${parseInline(mitigationText)}</p>
              </div>
            </div>
          `)
          continue
        }
      }
    }

    // Default lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      if (!inList) {
        result.push('<ul style="list-style-type: disc; padding-left: 20px; margin: 12px 0 12px 0;">')
        inList = true
      }
      result.push(`<li style="margin-bottom: 6px; line-height: 1.6; color: #3f3f46; font-size: 13.5px;">${parseInline(trimmed.substring(2))}</li>`)
      continue
    } else {
      closeList()
    }

    // Headers with or without space
    const headerMatch = trimmed.match(/^(#{1,6})\s*(.*)$/)
    if (headerMatch) {
      const level = headerMatch[1].length
      const content = headerMatch[2]
      if (level === 1) {
        result.push(`<h2 style="font-size: 18px; font-weight: 700; color: #09090b; margin-top: 24px; margin-bottom: 12px;">${parseInline(content)}</h2>`)
      } else if (level === 2) {
        result.push(`<h3 style="font-size: 14px; font-weight: 600; color: #18181b; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #f4f4f5; padding-bottom: 6px;">${parseInline(content)}</h3>`)
      } else {
        result.push(`<h4 style="font-size: 11px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 16px; margin-bottom: 8px;">${parseInline(content)}</h4>`)
      }
      continue
    }

    if (trimmed === '') {
      continue
    } else {
      result.push(`<p style="color: #3f3f46; font-size: 13.5px; line-height: 1.6; margin-bottom: 12px;">${parseInline(trimmed)}</p>`)
    }
  }

  closeList()
  closeTable()

  return result.join('\n')
}

const getFullMarkdown = () => {
  return scopeStore.sections.map(s => {
    return `## Step ${s.step} - ${s.title}\n\n${s.content}`
  }).join('\n\n')
}

const copyToClipboard = async () => {
  try {
    const textToCopy = viewMode.value === 'editor' ? fullMarkdownText.value : getFullMarkdown()
    await navigator.clipboard.writeText(textToCopy)
    isCopied.value = true
    setTimeout(() => { isCopied.value = false }, 2000)
  } catch (err) {
    // fallback
  }
}

const copyRichText = async () => {
  try {
    const markdownText = viewMode.value === 'editor' ? fullMarkdownText.value : getFullMarkdown()
    let htmlText = ''
    if (viewMode.value === 'editor') {
      htmlText = parseMarkdown(markdownText, 3)
    } else {
      htmlText = scopeStore.sections.map(s => {
        return `<h2 style="font-size: 18px; font-weight: 700; color: #09090b; margin-top: 28px; margin-bottom: 12px; border-bottom: 1px solid #e4e4e7; padding-bottom: 6px;">Step ${s.step} - ${s.title}</h2>\n\n${parseMarkdown(s.content, s.step)}`
      }).join('\n\n')
    }

    const clipboardHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #18181b; line-height: 1.6; font-size: 14px;">
        ${htmlText}
      </div>
    `

    const htmlBlob = new Blob([clipboardHtml], { type: 'text/html' })
    const textBlob = new Blob([markdownText], { type: 'text/plain' })
    
    const data = [
      new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      })
    ]

    await navigator.clipboard.write(data)
    showSuccess('Rich Text copied to clipboard! You can paste directly into Notion or Confluence.')
  } catch (err) {
    showError('Failed to copy rich text to clipboard.')
  }
}

const exportToGoogleDoc = async () => {
  try {
    const markdownText = viewMode.value === 'editor' ? fullMarkdownText.value : getFullMarkdown()
    let htmlText = ''
    if (viewMode.value === 'editor') {
      htmlText = parseMarkdown(markdownText, 3)
    } else {
      htmlText = scopeStore.sections.map(s => {
        return `<h2 style="font-size: 18px; font-weight: 700; color: #09090b; margin-top: 28px; margin-bottom: 12px; border-bottom: 1px solid #e4e4e7; padding-bottom: 6px;">Step ${s.step} - ${s.title}</h2>\n\n${parseMarkdown(s.content, s.step)}`
      }).join('\n\n')
    }

    const clipboardHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #18181b; line-height: 1.6; font-size: 14px;">
        ${htmlText}
      </div>
    `

    const htmlBlob = new Blob([clipboardHtml], { type: 'text/html' })
    const textBlob = new Blob([markdownText], { type: 'text/plain' })
    
    const data = [
      new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      })
    ]

    await navigator.clipboard.write(data)
    showSuccess('Copied to clipboard! Press Ctrl+V (or ⌘+V) to paste into Google Docs.')
    window.open('https://docs.new', '_blank')
  } catch (err) {
    showError('Failed to copy document to clipboard.')
  }
}

const downloadDocument = () => {
  const markdownText = viewMode.value === 'editor' ? fullMarkdownText.value : getFullMarkdown()
  const blob = new Blob([markdownText], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `project_scope_${scopeStore.sessionId || 'document'}.md`
  link.click()
  URL.revokeObjectURL(url)
}

const insertMarkdown = (syntax: string) => {
  const textarea = document.querySelector('textarea') as HTMLTextAreaElement
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = fullMarkdownText.value
  
  const selected = text.substring(start, end)
  let replacement = ''
  
  if (syntax === 'bold') {
    replacement = `**${selected || 'bold text'}**`
  } else if (syntax === 'italic') {
    replacement = `*${selected || 'italic text'}*`
  } else if (syntax === 'code') {
    replacement = `\`${selected || 'code'}\``
  } else if (syntax === 'link') {
    replacement = `[${selected || 'link text'}](https://example.com)`
  } else if (syntax === 'list') {
    replacement = `\n- ${selected || 'list item'}`
  }
  
  fullMarkdownText.value = text.substring(0, start) + replacement + text.substring(end)
  
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + replacement.length, start + replacement.length)
  }, 50)
}

const saveEditorChanges = () => {
  const text = fullMarkdownText.value
  const stepRegex = /## Step (\d) - ([^\n]+)/g
  let match
  const matches: Array<{ step: number; title: string; index: number }> = []
  
  while ((match = stepRegex.exec(text)) !== null) {
    matches.push({
      step: parseInt(match[1], 10),
      title: match[2].trim(),
      index: match.index
    })
  }
  
  if (matches.length === 0) {
    const fallbackRegex = /## ([^\n]+)/g
    let idx = 1
    while ((match = fallbackRegex.exec(text)) !== null) {
      matches.push({
        step: idx++,
        title: match[1].trim(),
        index: match.index
      })
    }
  }
  
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i]
    const next = matches[i + 1]
    
    const headerStart = current.index
    const headerEnd = text.indexOf('\n', headerStart)
    const contentStart = headerEnd === -1 ? text.length : headerEnd
    
    const contentEnd = next ? next.index : text.length
    const rawContent = text.substring(contentStart, contentEnd).trim()
    
    const sec = scopeStore.sections.find(s => s.step === current.step)
    if (sec) {
      sec.content = rawContent
    }
  }
  
  showSuccess('Changes saved and synced back successfully!')
}

// 9. Watchers
watch(viewMode, (newVal) => {
  if (newVal === 'editor') {
    fullMarkdownText.value = getFullMarkdown()
  }
})

watch(() => scopeStore.sections.length, (newLength) => {
  if (newLength > 0 && scopeStore.isStreaming) {
    const latestStep = scopeStore.sections[newLength - 1].step
    activeTab.value = latestStep
    if (viewMode.value === 'editor') {
      fullMarkdownText.value = getFullMarkdown()
    }
  }
})

watch(() => scopeStore.isStreaming, (streaming) => {
  if (streaming && scopeStore.sections.length > 0) {
    activeTab.value = scopeStore.sections[scopeStore.sections.length - 1].step
  }
})
</script>

<template>
  <div class="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">

    <!-- Header -->
    <div class="px-6 py-4.5 border-b border-zinc-100 flex items-center justify-between">
      <div>
        <h2 class="text-sm font-bold text-zinc-950 tracking-tight">{{ t('output.title') }}</h2>
        <p class="text-xs text-zinc-400 mt-0.5">Real-time architecture analysis</p>
      </div>
      <div>
        <span v-if="scopeStore.isInitiating || scopeStore.isStreaming" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 animate-pulse">
          <span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          Streaming Blueprints
        </span>
        <span v-else-if="scopeStore.sections.length > 0" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100">
          ✓ {{ t('output.ready') }}
        </span>
        <span v-else class="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Idle</span>
      </div>
    </div>

    <!-- Body -->
    <div class="p-6">
      <section aria-live="polite" class="flex flex-col gap-5">

        <!-- Error State -->
        <div v-if="scopeStore.streamError" class="p-4 bg-red-50 border border-red-200/80 rounded-lg text-xs text-red-800 flex items-start gap-2.5">
          <i class="pi pi-exclamation-circle text-red-500 mt-0.5"></i>
          <div class="flex-grow">
            <span class="font-bold block">Generation Failed</span>
            <span class="mt-0.5 block leading-relaxed">{{ scopeStore.streamError }}</span>
          </div>
        </div>

        <!-- Skeleton / Loading State -->
        <div v-else-if="scopeStore.isInitiating && scopeStore.sections.length === 0" class="flex flex-col gap-6 py-4">
          <div class="flex items-center gap-3">
            <div class="h-5 w-5 bg-zinc-200 rounded animate-pulse"></div>
            <div class="h-5 bg-zinc-200 rounded animate-pulse w-1/3"></div>
          </div>
          <div class="flex flex-col gap-3">
            <div class="h-4.5 bg-zinc-100 rounded animate-pulse w-full"></div>
            <div class="h-4.5 bg-zinc-100 rounded animate-pulse w-11/12"></div>
            <div class="h-4.5 bg-zinc-100 rounded animate-pulse w-4/5"></div>
          </div>
          <div class="h-px bg-zinc-100 my-2"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 border border-zinc-100 rounded-lg bg-zinc-50/50 space-y-2">
              <div class="h-3.5 bg-zinc-200 rounded w-1/4 animate-pulse"></div>
              <div class="h-3 bg-zinc-100 rounded w-full animate-pulse"></div>
            </div>
            <div class="p-4 border border-zinc-100 rounded-lg bg-zinc-50/50 space-y-2">
              <div class="h-3.5 bg-zinc-200 rounded w-1/4 animate-pulse"></div>
              <div class="h-3 bg-zinc-100 rounded w-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <!-- Premium Empty State -->
        <div v-else-if="scopeStore.sections.length === 0 && !scopeStore.isInitiating" class="py-20 border border-dashed border-zinc-200/80 rounded-xl flex flex-col items-center justify-center text-center p-6 bg-zinc-50/30">
          <div class="h-11 w-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 mb-3 shadow-sm">
            <svg class="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h4 class="text-sm font-bold text-zinc-950">Awaiting Specifications</h4>
          <p class="text-xs text-zinc-450 mt-1 max-w-sm leading-relaxed">
            Specify project details on the left sidebar, or prefill configurations using one of our quick-start templates above.
          </p>
        </div>

        <!-- Live Content Workspace -->
        <div v-else class="flex flex-col gap-5">

          <!-- Segment control: step tabs (Vercel-inspired) -->
          <div class="flex p-1 bg-zinc-100 rounded-lg gap-1 border border-zinc-200/50">
            <button
              v-for="tab in [
                { step: 1, label: '1. Classification', status: step1Status },
                { step: 2, label: '2. Risk Mitigation', status: step2Status },
                { step: 3, label: '3. Technical Scope', status: step3Status }
              ]"
              :key="tab.step"
              type="button"
              class="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-bold transition-all duration-150 border-none outline-none cursor-pointer rounded-md"
              :class="[
                activeTab === tab.step
                  ? 'bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-950/5'
                  : 'text-zinc-500 hover:text-zinc-800'
              ]"
              @click="activeTab = tab.step"
            >
              <span
                v-if="tab.status === 'completed'"
                class="h-3.5 w-3.5 rounded-full bg-emerald-500 text-white text-[8px] flex items-center justify-center font-extrabold"
              >✓</span>
              <span
                v-else-if="tab.status === 'active'"
                class="h-3.5 w-3.5 rounded-full bg-zinc-400 text-white text-[8px] flex items-center justify-center animate-pulse"
              >{{ tab.step }}</span>
              <span
                v-else
                class="h-3.5 w-3.5 rounded-full bg-zinc-250 text-zinc-450 text-[8px] flex items-center justify-center font-bold"
              >{{ tab.step }}</span>
              {{ tab.label }}
            </button>
          </div>

          <!-- View Mode selector & Title -->
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-zinc-450">Format & Workspace</span>
            
            <div class="flex p-0.5 bg-zinc-100 rounded-md gap-0.5 border border-zinc-200/40">
              <button
                v-for="mode in [
                  { key: 'steps', label: 'Tabs' },
                  { key: 'full', label: 'Report' },
                  { key: 'editor', label: 'Editor' }
                ]"
                :key="mode.key"
                type="button"
                class="text-[11px] font-semibold px-3 py-1 transition-all duration-150 cursor-pointer border-none rounded"
                :class="[
                  viewMode === mode.key ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
                ]"
                @click="viewMode = mode.key as any"
              >
                {{ mode.label }}
              </button>
            </div>
          </div>

          <!-- TABS VIEW -->
          <div v-if="viewMode === 'steps'" class="min-h-[380px] max-h-[600px] overflow-y-auto pr-1">
            <article v-if="activeSection" class="rounded-xl border border-zinc-200 p-5 bg-white shadow-xs">
              <header class="mb-4.5 flex items-center justify-between pb-3.5 border-b border-zinc-100">
                <h3 class="text-xs font-bold text-zinc-950 flex items-center gap-2 tracking-tight">
                  <span class="h-5 w-5 rounded bg-zinc-100 text-[10px] font-extrabold text-zinc-500 flex items-center justify-center">{{ activeSection.step }}</span>
                  {{ activeSection.title }}
                </h3>
                <span
                  class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  :class="activeSection.step === scopeStore.sections[scopeStore.sections.length - 1]?.step && scopeStore.isStreaming
                    ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'"
                >
                  {{ activeSection.step === scopeStore.sections[scopeStore.sections.length - 1]?.step && scopeStore.isStreaming ? 'Streaming…' : 'Complete' }}
                </span>
              </header>
              <div class="scope-prose" v-html="parseMarkdown(activeSection.content, activeSection.step) + (scopeStore.isStreaming && scopeStore.sections[scopeStore.sections.length - 1]?.step === activeSection.step ? '<span class=\'inline-block ml-0.5 w-1.5 h-4 bg-zinc-900 animate-pulse align-middle rounded-sm\'></span>' : '')"></div>
            </article>
            <div v-else class="py-20 border border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-center gap-2">
              <i class="pi pi-lock text-zinc-300 text-lg"></i>
              <h5 class="text-xs font-bold text-zinc-700">Section Locked</h5>
              <p class="text-[11px] text-zinc-450 max-w-[220px] leading-relaxed">This stage will render dynamically as soon as the previous analysis settles.</p>
            </div>
          </div>

          <!-- FULL REPORT VIEW -->
          <div v-else-if="viewMode === 'full'" class="max-h-[600px] overflow-y-auto pr-1">
            <div class="border border-zinc-200 rounded-xl p-6 md:p-8 flex flex-col gap-6 bg-white shadow-xs">
              
              <!-- Report header -->
              <div class="border-b border-zinc-100 pb-5">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-450">System Architecture Specification</span>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-450 bg-zinc-100 px-1.5 py-0.5 rounded">CONFIDENTIAL</span>
                </div>
                <h3 class="text-xl font-extrabold text-zinc-950 tracking-tight leading-none">Engineering Scope Blueprint</h3>
                <p class="text-xs text-zinc-450 mt-1.5">Unified report detailing application constraints, risks, stack composition, and milestone schedules.</p>
                
                <!-- Facts Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50/50 rounded-lg p-4 border border-zinc-150 mt-4.5">
                  <div>
                    <span class="text-[9px] uppercase tracking-wider text-zinc-400 font-extrabold block mb-0.5">Project Type</span>
                    <span class="text-[11px] font-bold text-zinc-750 capitalize">{{ scopeStore.projectType.replace('_', ' ') }}</span>
                  </div>
                  <div>
                    <span class="text-[9px] uppercase tracking-wider text-zinc-400 font-extrabold block mb-0.5">Industry Segment</span>
                    <span class="text-[11px] font-bold text-zinc-750 truncate block">{{ scopeStore.industry || 'General Domain' }}</span>
                  </div>
                  <div>
                    <span class="text-[9px] uppercase tracking-wider text-zinc-400 font-extrabold block mb-0.5">Budget Cap</span>
                    <span class="text-[11px] font-bold text-zinc-750">{{ scopeStore.budgetUsd ? '$' + scopeStore.budgetUsd.toLocaleString() : 'Not Specified' }}</span>
                  </div>
                  <div>
                    <span class="text-[9px] uppercase tracking-wider text-zinc-400 font-extrabold block mb-0.5">Target Platforms</span>
                    <span class="text-[11px] font-bold text-zinc-750 capitalize">{{ scopeStore.platforms.join(', ') }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Sections list -->
              <div class="flex flex-col gap-6">
                <section v-for="(section, idx) in scopeStore.sections" :key="`full-${section.step}-${idx}`" class="flex flex-col gap-3">
                  <header class="flex items-center gap-2 border-b border-zinc-100 pb-1.5">
                    <span class="h-4.5 w-4.5 rounded bg-zinc-950 text-[9px] font-extrabold text-white flex items-center justify-center">{{ section.step }}</span>
                    <h4 class="text-xs font-bold text-zinc-950 uppercase tracking-wider">{{ section.title }}</h4>
                  </header>
                  <div class="scope-prose" v-html="parseMarkdown(section.content, section.step) + (scopeStore.isStreaming && idx === scopeStore.sections.length - 1 ? '<span class=\'inline-block ml-0.5 w-1.5 h-4 bg-zinc-900 animate-pulse align-middle rounded-sm\'></span>' : '')"></div>
                </section>
              </div>

              <!-- Footer -->
              <div class="border-t border-zinc-100 pt-4 flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                <span>© ScopeFlow.ai — Automated Scoping Engine</span>
                <span>Page 1 of 1</span>
              </div>
            </div>
          </div>

          <!-- EDITOR VIEW -->
          <div v-else-if="viewMode === 'editor'" class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-zinc-950">Markdown Workspace</span>
              <button
                type="button"
                class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-white border-none cursor-pointer transition-colors shadow-xs"
                @click="saveEditorChanges"
              >
                Sync Back Changes
              </button>
            </div>
            
            <div class="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-md">
              <!-- Monospace Editor Toolbar -->
              <div class="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <button v-for="btn in [
                  { syntax: 'bold', label: 'B', cls: 'font-bold' },
                  { syntax: 'italic', label: 'I', cls: 'italic' }
                ]" :key="btn.syntax" type="button" @click="insertMarkdown(btn.syntax)"
                  :class="'px-2 py-0.5 hover:bg-zinc-700/50 rounded text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer border-none bg-transparent transition-colors ' + btn.cls"
                >{{ btn.label }}</button>
                
                <div class="w-px h-3 bg-zinc-800 mx-1"></div>
                
                <button v-for="btn in [
                  { syntax: 'code', icon: 'pi-code' },
                  { syntax: 'link', icon: 'pi-link' },
                  { syntax: 'list', icon: 'pi-list' }
                ]" :key="btn.syntax" type="button" @click="insertMarkdown(btn.syntax)"
                  class="px-2 py-0.5 hover:bg-zinc-700/50 rounded text-zinc-400 hover:text-zinc-200 cursor-pointer border-none bg-transparent transition-colors"
                ><i :class="'pi ' + btn.icon + ' text-[10px]'"></i></button>
                
                <span class="ml-auto text-[10px] text-zinc-500 select-none font-mono">markdown-mode</span>
              </div>
              
              <textarea
                v-model="fullMarkdownText"
                rows="15"
                class="w-full bg-transparent text-zinc-300 text-[13px] p-4.5 focus:outline-none border-none resize-y leading-relaxed font-mono"
                placeholder="Edit the unified markdown scope document here..."
              ></textarea>
            </div>
            <p class="text-[11px] text-zinc-400">Edits made here are saved directly back into your Tabs and Report layouts.</p>
          </div>

          <!-- Export Actions -->
          <div v-if="hasDocument" class="flex justify-end gap-2.5 border-t border-zinc-150 pt-4 mt-2">
            <button
              type="button"
              class="rounded-lg text-[13px] font-semibold py-2 px-4.5 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 cursor-pointer transition-all duration-150 flex items-center gap-2"
              @click="copyToClipboard"
            >
              <i :class="isCopied ? 'pi pi-check text-emerald-600' : 'pi pi-copy'"></i>
              {{ isCopied ? 'Copied!' : 'Copy Markdown' }}
            </button>
            <button
              type="button"
              class="rounded-lg text-[13px] font-semibold py-2 px-4.5 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 cursor-pointer transition-all duration-150 flex items-center gap-2"
              @click="copyRichText"
            >
              <i class="pi pi-copy text-indigo-500"></i>
              Copy Rich Text
            </button>
            <button
              type="button"
              class="rounded-lg text-[13px] font-semibold py-2 px-4.5 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 cursor-pointer transition-all duration-150 flex items-center gap-2"
              @click="exportToGoogleDoc"
            >
              <i class="pi pi-external-link text-blue-500"></i>
              Google Docs
            </button>
            <button
              type="button"
              class="rounded-lg text-[13px] font-semibold py-2 px-4.5 bg-zinc-950 hover:bg-zinc-900 text-white border-none cursor-pointer transition-all duration-150 flex items-center gap-2 shadow-sm"
              @click="downloadDocument"
            >
              <i class="pi pi-download"></i>
              Download Markdown
            </button>
          </div>

        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
:deep(.scope-prose) ul {
  padding-left: 1.25rem;
  margin: 0.5rem 0 0.8rem;
  list-style-type: disc;
}
:deep(.scope-prose) li {
  margin: 0.25rem 0;
  line-height: 1.6;
  font-size: 0.85rem;
  color: #3f3f46;
}
:deep(.scope-prose) h2, :deep(.scope-prose) h3, :deep(.scope-prose) h4 {
  font-weight: 700;
  color: #09090b;
}
:deep(.scope-prose) p {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #3f3f46;
  margin-bottom: 0.75rem;
}
:deep(.scope-prose) strong {
  color: #09090b;
  font-weight: 700;
}
</style>

