<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

import {
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
import { projectTypeOptions, platformOptions } from '@/constants/project'
import { discoverySchema } from '@/validation/discovery'

// 2. Types
type FormErrors = Partial<Record<'projectType' | 'industry' | 'budgetUsd' | 'timelineStart' | 'timelineEnd' | 'features' | 'platforms', string>>

// 3. Props
const props = withDefaults(defineProps<{
  isSidebar?: boolean
}>(), {
  isSidebar: false
})

// 4. Composables
const { t } = useI18n()
const { open, close } = useAgentStream()

// 5. Pinia Store
const scopeStore = useScopeStore()

// 6. Reactive State & Constants
const formErrors = reactive<FormErrors>({})

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
    await discoverySchema.validate(
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
  <div :class="[
    'rounded-xl border border-zinc-200 bg-white transition-all duration-200',
    isSidebar ? 'border-none bg-transparent' : 'shadow-md overflow-hidden'
  ]">
    <!-- Header (landing only) -->
    <div v-if="!isSidebar" class="px-6 py-4.5 border-b border-zinc-100 flex items-center justify-between">
      <div>
        <h2 class="text-sm font-bold text-zinc-950 tracking-tight">{{ t('discovery.title') }}</h2>
        <p class="text-xs text-zinc-400 mt-0.5">Specify your application requirements below</p>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
        <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Builder</span>
      </div>
    </div>

    <div :class="isSidebar ? 'p-0' : 'p-6 sm:p-8'">
      <form class="flex flex-col gap-5.5" novalidate @submit.prevent="onSubmit">

        <!-- Section 1: Core parameters -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Core Parameters</span>
            <div class="h-px bg-zinc-100 flex-grow"></div>
          </div>

          <fieldset :class="isSidebar ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 gap-4.5 md:grid-cols-2'">
            <legend class="sr-only">Core project details</legend>

            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{{ t('discovery.fields.projectType') }}</span>
              <Dropdown v-model="scopeStore.projectType" :options="projectTypeOptions" optionLabel="label" optionValue="value" :invalid="!!formErrors.projectType" class="w-full" />
              <transition name="form-error">
                <small v-if="formErrors.projectType" class="text-xs text-red-500">{{ formErrors.projectType }}</small>
              </transition>
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{{ t('discovery.fields.industry') }}</span>
              <InputText v-model="scopeStore.industry" :invalid="!!formErrors.industry" class="w-full" placeholder="e.g. Healthcare, Fintech, SaaS" />
              <transition name="form-error">
                <small v-if="formErrors.industry" class="text-xs text-red-500">{{ formErrors.industry }}</small>
              </transition>
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{{ t('discovery.fields.budgetUsd') }}</span>
              <InputNumber v-model="scopeStore.budgetUsd" :min="0" mode="currency" currency="USD" locale="en-US" :invalid="!!formErrors.budgetUsd" class="w-full" placeholder="$0.00" />
              <transition name="form-error">
                <small v-if="formErrors.budgetUsd" class="text-xs text-red-500">{{ formErrors.budgetUsd }}</small>
              </transition>
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{{ t('discovery.fields.platforms') }}</span>
              <MultiSelect v-model="scopeStore.platforms" :options="platformOptions" optionLabel="label" optionValue="value" display="chip" :invalid="!!formErrors.platforms" class="w-full" />
              <transition name="form-error">
                <small v-if="formErrors.platforms" class="text-xs text-red-500">{{ formErrors.platforms }}</small>
              </transition>
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{{ t('discovery.fields.timelineStart') }}</span>
              <DatePicker v-model="scopeStore.timelineStart" showIcon :invalid="!!formErrors.timelineStart" class="w-full" placeholder="Select start date" />
              <transition name="form-error">
                <small v-if="formErrors.timelineStart" class="text-xs text-red-500">{{ formErrors.timelineStart }}</small>
              </transition>
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{{ t('discovery.fields.timelineEnd') }}</span>
              <DatePicker v-model="scopeStore.timelineEnd" showIcon :invalid="!!formErrors.timelineEnd" class="w-full" placeholder="Select end date" />
              <transition name="form-error">
                <small v-if="formErrors.timelineEnd" class="text-xs text-red-500">{{ formErrors.timelineEnd }}</small>
              </transition>
            </div>
          </fieldset>
        </div>

        <!-- Section 2: Specification details -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Specifications</span>
            <div class="h-px bg-zinc-100 flex-grow"></div>
          </div>

          <fieldset class="flex flex-col gap-4.5">
            <legend class="sr-only">Scope details</legend>

            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{{ t('discovery.fields.features') }}</span>
              <Chips v-model="scopeStore.features" :invalid="!!formErrors.features" class="w-full" placeholder="Type and press Enter..." />
              <div class="flex justify-between items-center mt-1">
                <small class="text-[10px] text-zinc-400">{{ t('discovery.featuresHint') }}</small>
                <transition name="form-error">
                  <small v-if="formErrors.features" class="text-xs text-red-500">{{ formErrors.features }}</small>
                </transition>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{{ t('discovery.fields.integrations') }}</span>
              <Chips v-model="scopeStore.integrations" class="w-full" placeholder="e.g. Stripe, Auth0, Twilio..." />
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{{ t('discovery.fields.constraints') }}</span>
              <Textarea v-model="scopeStore.constraints" rows="2" class="w-full resize-none" placeholder="e.g. strict budget bounds, HIPAA compliance, legacy database migration..." />
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{{ t('discovery.fields.successCriteria') }}</span>
              <Textarea v-model="scopeStore.successCriteria" rows="2" class="w-full resize-none" placeholder="e.g. < 200ms latency, handles 10k concurrent users..." />
            </div>
          </fieldset>
        </div>

        <!-- Action Footer -->
        <footer class="flex justify-end gap-2.5 border-t border-zinc-150 pt-4 mt-2">
          <button
            type="button"
            class="rounded-lg text-[13px] font-semibold py-2 px-4 text-zinc-700 border border-zinc-200 bg-white hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 cursor-pointer transition-all duration-150 disabled:opacity-40"
            :disabled="scopeStore.isInitiating || scopeStore.isStreaming"
            @click="onReset"
          >
            {{ t('discovery.reset') }}
          </button>
          
          <button
            type="submit"
            :disabled="!canSubmit"
            class="rounded-lg bg-zinc-950 hover:bg-zinc-900 text-white text-[13px] font-semibold py-2 px-4.5 border-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 cursor-pointer transition-all duration-150 disabled:opacity-40 shadow-sm flex items-center gap-2"
          >
            <i v-if="scopeStore.isInitiating" class="pi pi-spin pi-spinner text-xs"></i>
            {{ scopeStore.isInitiating ? 'Analyzing...' : t('discovery.submit') }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Transition & Micro-interactions for PrimeVue Form Controls */
:deep(.p-dropdown),
:deep(.p-multiselect),
:deep(.p-datepicker),
:deep(.p-inputtext),
:deep(.p-chips),
:deep(.p-textarea) {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  border-radius: 8px !important;
}

:deep(.p-dropdown:hover),
:deep(.p-multiselect:hover),
:deep(.p-datepicker:hover),
:deep(.p-inputtext:hover),
:deep(.p-chips:hover),
:deep(.p-textarea:hover) {
  border-color: #011268 !important; /* Brand 600 color */
}

:deep(.p-dropdown:focus-within),
:deep(.p-multiselect:focus-within),
:deep(.p-datepicker:focus-within),
:deep(.p-inputtext:focus),
:deep(.p-chips:focus-within),
:deep(.p-textarea:focus) {
  border-color: #011268 !important;
  box-shadow: 0 0 0 3px rgba(1, 18, 104, 0.1) !important;
}

/* Invalid State Animation */
:deep(.p-invalid) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Form error message transition */
.form-error-enter-active,
.form-error-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 24px;
}
.form-error-enter-from,
.form-error-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-4px);
}
</style>
