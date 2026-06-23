<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import {
  Button,
  Card,
  Chips,
  DatePicker,
  Dropdown,
  InputNumber,
  InputText,
  MultiSelect,
  Textarea,
} from '@/lib/primevue'
import { useAgentStream } from '@/composables/useAgentStream'
import { useScopeStore } from '@/stores/useScopeStore'
import type { ProjectType, TargetPlatform } from '@/types/scope'

// 2. Types
type DropdownOption<T extends string> = { label: string; value: T }
type FormErrors = Partial<Record<'projectType' | 'industry' | 'budgetUsd' | 'timelineStart' | 'timelineEnd' | 'features' | 'platforms', string>>

// 4. Composables
const { t } = useI18n()
const { open, close } = useAgentStream()

// 5. Pinia Store
const scopeStore = useScopeStore()

// 6. Reactive State & Constants
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

// 7. Computed
const canSubmit = computed(() => !scopeStore.isInitiating && !scopeStore.isStreaming)

// 8. Methods
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
  <Card class="shadow-xl border border-slate-100 rounded-2xl bg-white/90 backdrop-blur-md">
    <template #title>
      <div class="flex items-center gap-2.5 border-b border-slate-100 pb-4">
        <div class="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
          <i class="pi pi-sliders-h text-sm"></i>
        </div>
        <div class="flex flex-col">
          <h2 class="text-base font-bold text-slate-900">{{ t('discovery.title') }}</h2>
          <p class="text-xs text-slate-400">Configure parameters to draft the architecture scope</p>
        </div>
      </div>
    </template>
    
    <template #content>
      <form class="flex flex-col gap-5 pt-3" novalidate @submit.prevent="onSubmit">
        <!-- Core info section header -->
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-semibold uppercase tracking-wider text-brand-600">1. Core Specification</span>
          <div class="h-[1px] bg-slate-100 flex-grow"></div>
        </div>

        <fieldset class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <legend class="sr-only">Core project details</legend>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <i class="pi pi-briefcase text-slate-400 text-[10px]"></i>
              {{ t('discovery.fields.projectType') }}
            </span>
            <Dropdown v-model="scopeStore.projectType" :options="projectTypeOptions" optionLabel="label" optionValue="value" :invalid="!!formErrors.projectType" class="w-full rounded-xl border-slate-200" />
            <small v-if="formErrors.projectType" class="text-xs font-medium text-red-500">{{ formErrors.projectType }}</small>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <i class="pi pi-building text-slate-400 text-[10px]"></i>
              {{ t('discovery.fields.industry') }}
            </span>
            <InputText v-model="scopeStore.industry" :invalid="!!formErrors.industry" class="w-full rounded-xl border-slate-200" placeholder="e.g. Healthcare, Fintech" />
            <small v-if="formErrors.industry" class="text-xs font-medium text-red-500">{{ formErrors.industry }}</small>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <i class="pi pi-dollar text-slate-400 text-[10px]"></i>
              {{ t('discovery.fields.budgetUsd') }}
            </span>
            <InputNumber v-model="scopeStore.budgetUsd" :min="0" mode="currency" currency="USD" :invalid="!!formErrors.budgetUsd" class="w-full rounded-xl" placeholder="$0.00" />
            <small v-if="formErrors.budgetUsd" class="text-xs font-medium text-red-500">{{ formErrors.budgetUsd }}</small>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <i class="pi pi-desktop text-slate-400 text-[10px]"></i>
              {{ t('discovery.fields.platforms') }}
            </span>
            <MultiSelect v-model="scopeStore.platforms" :options="platformOptions" optionLabel="label" optionValue="value" display="chip" :invalid="!!formErrors.platforms" class="w-full rounded-xl border-slate-200" />
            <small v-if="formErrors.platforms" class="text-xs font-medium text-red-500">{{ formErrors.platforms }}</small>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <i class="pi pi-calendar text-slate-400 text-[10px]"></i>
              {{ t('discovery.fields.timelineStart') }}
            </span>
            <DatePicker v-model="scopeStore.timelineStart" showIcon :invalid="!!formErrors.timelineStart" class="w-full rounded-xl border-slate-200" />
            <small v-if="formErrors.timelineStart" class="text-xs font-medium text-red-500">{{ formErrors.timelineStart }}</small>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <i class="pi pi-calendar text-slate-400 text-[10px]"></i>
              {{ t('discovery.fields.timelineEnd') }}
            </span>
            <DatePicker v-model="scopeStore.timelineEnd" showIcon :invalid="!!formErrors.timelineEnd" class="w-full rounded-xl border-slate-200" />
            <small v-if="formErrors.timelineEnd" class="text-xs font-medium text-red-500">{{ formErrors.timelineEnd }}</small>
          </label>
        </fieldset>

        <!-- Scope & Details section header -->
        <div class="flex items-center gap-2 mt-2 mb-1">
          <span class="text-xs font-semibold uppercase tracking-wider text-brand-600">2. Scope Details & Constraints</span>
          <div class="h-[1px] bg-slate-100 flex-grow"></div>
        </div>

        <fieldset class="flex flex-col gap-4">
          <legend class="sr-only">Scope details</legend>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <i class="pi pi-star text-slate-400 text-[10px]"></i>
              {{ t('discovery.fields.features') }}
            </span>
            <Chips v-model="scopeStore.features" :invalid="!!formErrors.features" class="w-full" />
            <div class="flex justify-between items-center px-1">
              <small class="text-[10px] text-slate-400 font-medium">{{ t('discovery.featuresHint') }}</small>
              <small v-if="formErrors.features" class="text-xs font-medium text-red-500">{{ formErrors.features }}</small>
            </div>
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <i class="pi pi-share-alt text-slate-400 text-[10px]"></i>
              {{ t('discovery.fields.integrations') }}
            </span>
            <Chips v-model="scopeStore.integrations" class="w-full" placeholder="e.g. Stripe, SendGrid, Auth0" />
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <i class="pi pi-exclamation-triangle text-slate-400 text-[10px]"></i>
              {{ t('discovery.fields.constraints') }}
            </span>
            <Textarea v-model="scopeStore.constraints" rows="2" class="w-full rounded-xl border-slate-200 p-3 text-sm" placeholder="e.g. Strict budget bounds, legacy database integration..." />
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <i class="pi pi-verified text-slate-400 text-[10px]"></i>
              {{ t('discovery.fields.successCriteria') }}
            </span>
            <Textarea v-model="scopeStore.successCriteria" rows="2" class="w-full rounded-xl border-slate-200 p-3 text-sm" placeholder="e.g. Scalable to 10k users, high conversion rate..." />
          </label>
        </fieldset>

        <!-- Form controls footer -->
        <footer class="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-3">
          <Button 
            type="button" 
            outlined
            class="rounded-xl font-semibold text-xs py-2.5 px-4 text-slate-500 border-slate-200 hover:bg-slate-50 transition-all"
            :disabled="scopeStore.isInitiating || scopeStore.isStreaming" 
            @click="onReset"
          >
            {{ t('discovery.reset') }}
          </Button>
          <Button 
            type="submit" 
            :disabled="!canSubmit"
            class="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 px-5 shadow-md shadow-brand-600/10 hover:shadow-lg transition-all border-none transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            <i class="pi pi-send mr-1 text-[10px]"></i>
            {{ t('discovery.submit') }}
          </Button>
        </footer>
      </form>
    </template>
  </Card>
</template>
