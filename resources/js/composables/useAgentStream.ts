import { onBeforeUnmount, ref } from 'vue'
import { useAppToast } from '@/composables/useAppToast'
import { useScopeStore } from '@/stores/useScopeStore'
import type { AgentStreamEvent, AgentStep } from '@/types/scope'

function asAgentStreamEvent(raw: unknown): AgentStreamEvent | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (typeof r.type !== 'string') return null
  const type = r.type as AgentStreamEvent['type']
  if (!['step_start', 'section', 'done', 'error'].includes(type)) return null
  const stepRaw = r.step
  const step = stepRaw === 1 || stepRaw === 2 || stepRaw === 3 ? (stepRaw as AgentStep) : undefined
  const section = typeof r.section === 'string' ? r.section : undefined
  const content = typeof r.content === 'string' ? r.content : undefined
  const message = typeof r.message === 'string' ? r.message : undefined
  return { type, step, section, content, message }
}

export function useAgentStream() {
  const { showError } = useAppToast()
  const scopeStore = useScopeStore()
  const eventSource = ref<EventSource | null>(null)

  const close = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
    }
    scopeStore.isStreaming = false
  }

  const open = (url: string) => {
    close()
    scopeStore.isStreaming = true
    scopeStore.streamError = null
    const es = new EventSource(url, { withCredentials: false })
    eventSource.value = es

    es.onmessage = (evt) => {
      try {
        const event = asAgentStreamEvent(JSON.parse(evt.data))
        if (!event) return
        if (event.type === 'error') {
          const msg = event.message ?? 'Stream error.'
          scopeStore.streamError = msg
          showError(msg)
          close()
          return
        }
        if (event.type === 'done') {
          close()
          return
        }
        if (event.type === 'section' && event.step && event.section && event.content) {
          scopeStore.appendSection({ step: event.step, title: event.section, content: event.content })
        }
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      scopeStore.streamError = 'Stream disconnected.'
      showError('Stream disconnected.')
      close()
    }
  }

  onBeforeUnmount(close)
  return { open, close }
}

