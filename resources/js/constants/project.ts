import type { ProjectType, TargetPlatform } from '@/types/scope'

export interface DropdownOption<T extends string> {
  label: string
  value: T
}

export const projectTypeOptions: DropdownOption<ProjectType>[] = [
  { label: 'Web App', value: 'web_app' },
  { label: 'Mobile App', value: 'mobile_app' },
  { label: 'SaaS', value: 'saas' },
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'Internal Tool', value: 'internal_tool' },
  { label: 'API Integration', value: 'api_integration' },
]

export const platformOptions: DropdownOption<TargetPlatform>[] = [
  { label: 'Web', value: 'web' },
  { label: 'iOS', value: 'ios' },
  { label: 'Android', value: 'android' },
  { label: 'Desktop', value: 'desktop' },
]
