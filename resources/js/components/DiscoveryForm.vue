<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import {
  Button,
  Card,
  Chips,
  DatePicker,
  Divider,
  Dropdown,
  InputNumber,
  InputText,
  MultiSelect,
  Textarea,
} from '@/lib/primevue'
import { useAgentStream } from '@/composables/useAgentStream'
import { useScopeStore } from '@/stores/useScopeStore'
import type { ProjectType, TargetPlatform } from '@/types/scope'

type DropdownOption<T extends string> = { label: string; value: T }
type FormErrors = Partial<Record<'projectType' | 'industry' | 'budgetUsd' | 'timelineStart' | 'timelineEnd' | 'features' | 'platforms', string>>

const { t } = useI18n()
const scopeStore = useScopeStore()
const { open, close } = useAgentStream()

const formErrors = reactive<FormErrors>({})

const validationSchema = yup.object({
  projectType: yup.string().required('Project type is required.'),
  industry: yup.string().trim().required('Industry is required.'),
  budgetUsd: yup.number().typeError('Budget is required.').required('Budget is required.').moreThan(0, 'Budget must be greater than 0.'),
  timelineStart: yup.date().required('Timeline start is required.'),
  timelineEnd: yup
    .date()
    .required('Timeline end is required.')
    .when('timelineStart', ([timelineStart], schema) =>
      timelineStart ? schema.min(timelineStart as Date, 'Timeline end must be after timeline start.') : schema,
    ),
  features: yup.array().of(yup.string().required()).min(1, 'Add at least one feature.'),
  platforms: yup.array().of(yup.string().required()).min(1, 'Select at least one platform.'),
})

const projectTypeOptions: DropdownOption<ProjectType>[] = [
  { label: 'Web App', value: 'web_app' },
  { label: 'Mobile App', value: 'mobile_app' },
  { label: 'SaaS', value: 'saas' },
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'Internal Tool', value: 'internal_tool' },
  { label: 'API Integration', value: 'api_integration' },
]

const platformOptions: DropdownOption<TargetPlatform>[] = [
  { label: 'Web', value: 'web' },
  { label: 'iOS', value: 'ios' },
  { label: 'Android', value: 'android' },
  { label: 'Desktop', value: 'desktop' },
]

const canSubmit = computed(() => !scopeStore.isInitiating && !scopeStore.isStreaming)

const clearErrors = () => {
  Object.keys(formErrors).forEach((key) => {
    delete formErrors[key as keyof FormErrors]
  })
}

const validateForm = async () => {
  clearErrors()

  try {
    await validationSchema.validate(
      {
        projectType: scopeStore.projectType,
        industry: scopeStore.industry,
        budgetUsd: scopeStore.budgetUsd,
        timelineStart: scopeStore.timelineStart,
        timelineEnd: scopeStore.timelineEnd,
        features: scopeStore.features,
        platforms: scopeStore.platforms,
      },
      { abortEarly: false },
    )

    return true
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      error.inner.forEach((issue) => {
        if (!issue.path) return
        const key = issue.path as keyof FormErrors
        if (!formErrors[key]) {
          formErrors[key] = issue.message
        }
      })
    }

    return false
  }
}

const onSubmit = async () => {
  const isValid = await validateForm()
  if (!isValid) return

  close()
  scopeStore.clearOutput()
  const { streamUrl } = await scopeStore.initiateScope()
  open(streamUrl)
}

const onReset = () => {
  clearErrors()
  close()
  scopeStore.reset()
}
</script>

<template>
  <Card>
    <template #title>{{ t('discovery.title') }}</template>
    <template #content>
      <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
        <fieldset class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <legend class="sr-only">Core project details</legend>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-900">{{ t('discovery.fields.projectType') }}</span>
            <Dropdown v-model="scopeStore.projectType" :options="projectTypeOptions" optionLabel="label" optionValue="value" :invalid="!!formErrors.projectType" />
            <small v-if="formErrors.projectType" class="text-xs font-medium text-red-500">{{ formErrors.projectType }}</small>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-900">{{ t('discovery.fields.industry') }}</span>
            <InputText v-model="scopeStore.industry" :invalid="!!formErrors.industry" />
            <small v-if="formErrors.industry" class="text-xs font-medium text-red-500">{{ formErrors.industry }}</small>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-900">{{ t('discovery.fields.budgetUsd') }}</span>
            <InputNumber v-model="scopeStore.budgetUsd" :min="0" mode="currency" currency="USD" :invalid="!!formErrors.budgetUsd" />
            <small v-if="formErrors.budgetUsd" class="text-xs font-medium text-red-500">{{ formErrors.budgetUsd }}</small>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-900">{{ t('discovery.fields.platforms') }}</span>
            <MultiSelect v-model="scopeStore.platforms" :options="platformOptions" optionLabel="label" optionValue="value" display="chip" :invalid="!!formErrors.platforms" />
            <small v-if="formErrors.platforms" class="text-xs font-medium text-red-500">{{ formErrors.platforms }}</small>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-900">{{ t('discovery.fields.timelineStart') }}</span>
            <DatePicker v-model="scopeStore.timelineStart" showIcon :invalid="!!formErrors.timelineStart" />
            <small v-if="formErrors.timelineStart" class="text-xs font-medium text-red-500">{{ formErrors.timelineStart }}</small>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-900">{{ t('discovery.fields.timelineEnd') }}</span>
            <DatePicker v-model="scopeStore.timelineEnd" showIcon :invalid="!!formErrors.timelineEnd" />
            <small v-if="formErrors.timelineEnd" class="text-xs font-medium text-red-500">{{ formErrors.timelineEnd }}</small>
          </label>
        </fieldset>

        <Divider />

        <fieldset class="flex flex-col gap-3">
          <legend class="sr-only">Scope details</legend>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-900">{{ t('discovery.fields.features') }}</span>
            <Chips v-model="scopeStore.features" :invalid="!!formErrors.features" />
            <small class="text-xs text-slate-500">{{ t('discovery.featuresHint') }}</small>
            <small v-if="formErrors.features" class="text-xs font-medium text-red-500">{{ formErrors.features }}</small>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-900">{{ t('discovery.fields.integrations') }}</span>
            <Chips v-model="scopeStore.integrations" />
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-900">{{ t('discovery.fields.constraints') }}</span>
            <Textarea v-model="scopeStore.constraints" rows="3" />
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-sm font-medium text-slate-900">{{ t('discovery.fields.successCriteria') }}</span>
            <Textarea v-model="scopeStore.successCriteria" rows="3" />
          </label>
        </fieldset>

        <footer class="flex justify-end gap-3">
          <Button type="button" severity="secondary" outlined :disabled="scopeStore.isInitiating || scopeStore.isStreaming" @click="onReset">
            {{ t('discovery.reset') }}
          </Button>
          <Button type="submit" :disabled="!canSubmit">{{ t('discovery.submit') }}</Button>
        </footer>
      </form>
    </template>
  </Card>
</template>
