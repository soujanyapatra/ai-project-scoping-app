export type ProjectType = 'web_app' | 'mobile_app' | 'saas' | 'ecommerce' | 'internal_tool' | 'api_integration'
export type TargetPlatform = 'web' | 'ios' | 'android' | 'desktop'
export type AgentStep = 1 | 2 | 3

export interface DiscoveryFormPayload {
  projectType: ProjectType
  industry: string
  budgetUsd: number | null
  timelineStart: string | null
  timelineEnd: string | null
  features: string[]
  platforms: TargetPlatform[]
  integrations: string[]
  constraints: string
  successCriteria: string
}

export interface AgentStreamEvent {
  type: 'step_start' | 'section' | 'done' | 'error'
  step?: AgentStep
  section?: string
  content?: string
  message?: string
}

export interface StreamSection {
  step: AgentStep
  title: string
  content: string
}

