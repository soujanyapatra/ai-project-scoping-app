import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAppToast } from '@/composables/useAppToast'
import { api } from '@/utils/axios'
import { getApiErrorMessage } from '@/utils/apiErrors'
import type { DiscoveryFormPayload, StreamSection, TargetPlatform, ProjectType } from '@/types/scope'

interface ScopeInitiateResponse {
  sessionId: string
  streamUrl: string
}

export const useScopeStore = defineStore('scope', () => {
  const { showError } = useAppToast()

  const projectType = ref<ProjectType>('web_app')
  const industry = ref('')
  const budgetUsd = ref<number | null>(null)
  const timelineStart = ref<Date | null>(null)
  const timelineEnd = ref<Date | null>(null)
  const features = ref<string[]>([])
  const platforms = ref<TargetPlatform[]>(['web'])
  const integrations = ref<string[]>([])
  const constraints = ref('')
  const successCriteria = ref('')

  const sessionId = ref<string | null>(null)
  const streamUrl = ref<string | null>(null)
  const isInitiating = ref(false)
  const sections = ref<StreamSection[]>([])
  const isStreaming = ref(false)
  const streamError = ref<string | null>(null)

  const payload = computed<DiscoveryFormPayload>(() => ({
    projectType: projectType.value,
    industry: industry.value,
    budgetUsd: budgetUsd.value,
    timelineStart: timelineStart.value ? timelineStart.value.toISOString() : null,
    timelineEnd: timelineEnd.value ? timelineEnd.value.toISOString() : null,
    features: features.value,
    platforms: platforms.value,
    integrations: integrations.value,
    constraints: constraints.value,
    successCriteria: successCriteria.value,
  }))

  const reset = () => {
    projectType.value = 'web_app'
    industry.value = ''
    budgetUsd.value = null
    timelineStart.value = null
    timelineEnd.value = null
    features.value = []
    platforms.value = ['web']
    integrations.value = []
    constraints.value = ''
    successCriteria.value = ''
    sessionId.value = null
    streamUrl.value = null
    sections.value = []
    isStreaming.value = false
    streamError.value = null
  }

  const clearOutput = () => {
    sections.value = []
    isStreaming.value = false
    streamError.value = null
  }

  const initiateScope = async () => {
    isInitiating.value = true
    streamError.value = null
    try {
      const res = await api.post<ScopeInitiateResponse>('/api/scope', payload.value)
      sessionId.value = res.data.sessionId
      streamUrl.value = res.data.streamUrl
      return res.data
    } catch (error) {
      showError(getApiErrorMessage(error))
      throw error
    } finally {
      isInitiating.value = false
    }
  }

  const appendSection = (next: StreamSection) => {
    const existingIdx = sections.value.findIndex((s) => s.step === next.step && s.title === next.title)
    if (existingIdx >= 0) {
      const existing = sections.value[existingIdx]
      sections.value.splice(existingIdx, 1, { ...existing, content: next.content })
      return
    }
    sections.value.push(next)
  }

  return { projectType, industry, budgetUsd, timelineStart, timelineEnd, features, platforms, integrations, constraints, successCriteria, sessionId, streamUrl, isInitiating, sections, isStreaming, streamError, clearOutput, appendSection, initiateScope, reset }
})

