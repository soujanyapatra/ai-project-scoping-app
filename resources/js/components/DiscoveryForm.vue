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
    'transition-all duration-200',
    isSidebar ? '' : 'rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(9,9,11,0.04),0_8px_24px_rgba(9,9,11,0.04)] overflow-hidden'
  ]">
    <!-- Header (landing card only) -->
    <div v-if="!isSidebar" class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white">
      <div>
        <h2 class="text-[14px] font-bold text-zinc-950 tracking-tight">{{ t('discovery.title') }}</h2>
        <p class="text-[12px] text-zinc-500 mt-0.5">Fill in your project requirements below</p>
      </div>
      <div class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50/80 border border-emerald-100">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        <span class="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest">Builder</span>
      </div>
    </div>

    <div :class="isSidebar ? 'pt-1' : 'p-6 sm:p-7'">
      <form class="flex flex-col gap-7" novalidate @submit.prevent="onSubmit">

        <!-- Section 1: Core -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2.5">
            <span class="text-[11px] font-semibold text-zinc-500 tracking-[0.08em] uppercase whitespace-nowrap">Core Parameters</span>
            <div class="h-px bg-zinc-200/60 flex-grow"></div>
          </div>

          <fieldset :class="isSidebar ? 'grid grid-cols-1 gap-3.5' : 'grid grid-cols-1 gap-4 md:grid-cols-2'">
            <legend class="sr-only">Core project details</legend>

            <!-- Project Type -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-medium text-zinc-700">{{ t('discovery.fields.projectType') }}</label>
              <Dropdown v-model="scopeStore.projectType" :options="projectTypeOptions" optionLabel="label" optionValue="value" :invalid="!!formErrors.projectType" class="w-full" />
              <transition name="form-error">
                <small v-if="formErrors.projectType" class="text-[11px] text-red-500 mt-0.5">{{ formErrors.projectType }}</small>
              </transition>
            </div>

            <!-- Industry -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-medium text-zinc-700">{{ t('discovery.fields.industry') }}</label>
              <InputText v-model="scopeStore.industry" :invalid="!!formErrors.industry" class="w-full" placeholder="e.g. Healthcare, Fintech, SaaS" />
              <transition name="form-error">
                <small v-if="formErrors.industry" class="text-[11px] text-red-500 mt-0.5">{{ formErrors.industry }}</small>
              </transition>
            </div>

            <!-- Budget -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-medium text-zinc-700">{{ t('discovery.fields.budgetUsd') }}</label>
              <InputNumber v-model="scopeStore.budgetUsd" :min="0" mode="currency" currency="USD" locale="en-US" :invalid="!!formErrors.budgetUsd" class="w-full" placeholder="$0.00" />
              <transition name="form-error">
                <small v-if="formErrors.budgetUsd" class="text-[11px] text-red-500 mt-0.5">{{ formErrors.budgetUsd }}</small>
              </transition>
            </div>

            <!-- Platforms -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-medium text-zinc-700">{{ t('discovery.fields.platforms') }}</label>
              <MultiSelect v-model="scopeStore.platforms" :options="platformOptions" optionLabel="label" optionValue="value" display="chip" :invalid="!!formErrors.platforms" class="w-full" />
              <transition name="form-error">
                <small v-if="formErrors.platforms" class="text-[11px] text-red-500 mt-0.5">{{ formErrors.platforms }}</small>
              </transition>
            </div>

            <!-- Timeline Start -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-medium text-zinc-700">{{ t('discovery.fields.timelineStart') }}</label>
              <DatePicker v-model="scopeStore.timelineStart" showIcon :invalid="!!formErrors.timelineStart" class="w-full" placeholder="Start date" />
              <transition name="form-error">
                <small v-if="formErrors.timelineStart" class="text-[11px] text-red-500 mt-0.5">{{ formErrors.timelineStart }}</small>
              </transition>
            </div>

            <!-- Timeline End -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-medium text-zinc-700">{{ t('discovery.fields.timelineEnd') }}</label>
              <DatePicker v-model="scopeStore.timelineEnd" showIcon :invalid="!!formErrors.timelineEnd" class="w-full" placeholder="End date" />
              <transition name="form-error">
                <small v-if="formErrors.timelineEnd" class="text-[11px] text-red-500 mt-0.5">{{ formErrors.timelineEnd }}</small>
              </transition>
            </div>
          </fieldset>
        </div>

        <!-- Section 2: Specifications -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2.5">
            <span class="text-[11px] font-semibold text-zinc-500 tracking-[0.08em] uppercase whitespace-nowrap">Specifications</span>
            <div class="h-px bg-zinc-200/60 flex-grow"></div>
          </div>

          <fieldset class="flex flex-col gap-4">
            <legend class="sr-only">Scope specifications</legend>

            <!-- Features -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-medium text-zinc-700">{{ t('discovery.fields.features') }}</label>
              <Chips v-model="scopeStore.features" :invalid="!!formErrors.features" class="w-full" placeholder="Type feature and press Enter" />
              <div class="flex justify-between items-center mt-0.5">
                <small class="text-[11px] text-zinc-400">{{ t('discovery.featuresHint') }}</small>
                <transition name="form-error">
                  <small v-if="formErrors.features" class="text-[11px] text-red-500">{{ formErrors.features }}</small>
                </transition>
              </div>
            </div>

            <!-- Integrations -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-medium text-zinc-700">{{ t('discovery.fields.integrations') }}</label>
              <Chips v-model="scopeStore.integrations" class="w-full" placeholder="e.g. Stripe, Auth0, Twilio" />
            </div>

            <!-- Constraints -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-medium text-zinc-700">{{ t('discovery.fields.constraints') }}</label>
              <Textarea v-model="scopeStore.constraints" rows="2" class="w-full resize-none" placeholder="e.g. HIPAA compliance, SOC2, legacy systems..." />
            </div>

            <!-- Success Criteria -->
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-medium text-zinc-700">{{ t('discovery.fields.successCriteria') }}</label>
              <Textarea v-model="scopeStore.successCriteria" rows="2" class="w-full resize-none" placeholder="e.g. < 200ms latency, 10k concurrent users..." />
            </div>
          </fieldset>
        </div>

        <!-- Footer -->
        <footer class="flex justify-end gap-2.5 pt-4 border-t border-zinc-100">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg text-[12.5px] font-semibold h-9 px-4 text-zinc-600 border border-zinc-200 bg-white hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="scopeStore.isInitiating || scopeStore.isStreaming"
            @click="onReset"
          >
            Reset
          </button>

          <button
            type="submit"
            :disabled="!canSubmit"
            class="relative inline-flex items-center gap-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[12.5px] font-semibold h-9 px-5 border-none active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 cursor-pointer transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_1px_2px_rgba(9,9,11,0.15),0_4px_12px_rgba(9,9,11,0.12)]"
          >
            <span v-if="scopeStore.isInitiating" class="spinner w-3.5 h-3.5 border-white/30 border-t-white"></span>
            <svg v-else class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            {{ scopeStore.isInitiating ? 'Generating...' : t('discovery.submit') }}
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
  transition:
    border-color 0.12s ease,
    box-shadow 0.12s ease,
    background-color 0.12s ease !important;
  border-radius: 8px !important;
}

:deep(.p-dropdown:hover),
:deep(.p-multiselect:hover),
:deep(.p-datepicker:hover),
:deep(.p-inputtext:hover),
:deep(.p-chips:hover),
:deep(.p-textarea:hover) {
  border-color: #d4d4d8 !important;
  background-color: #fafafa !important;
}

:deep(.p-dropdown:focus-within),
:deep(.p-multiselect:focus-within),
:deep(.p-datepicker:focus-within),
:deep(.p-inputtext:focus),
:deep(.p-chips:focus-within),
:deep(.p-textarea:focus) {
  border-color: #09090b !important;
  box-shadow: 0 0 0 3px rgba(9, 9, 11, 0.08) !important;
  background-color: #ffffff !important;
}

/* Brand hover variant */
:deep(.p-dropdown.p-focus),
:deep(.p-multiselect.p-focus) {
  border-color: #09090b !important;
  box-shadow: 0 0 0 3px rgba(9, 9, 11, 0.08) !important;
}

/* Invalid State Animation */
:deep(.p-invalid) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
  animation: shake 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-5px); }
  40%       { transform: translateX(5px); }
  60%       { transform: translateX(-3px); }
  80%       { transform: translateX(3px); }
}

/* Spinner override */
.spinner {
  display: inline-block;
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.65s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Form error message transition */
.form-error-enter-active,
.form-error-leave-active {
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
.form-error-enter-from,
.form-error-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-3px);
}
.form-error-enter-to,
.form-error-leave-from {
  opacity: 1;
  max-height: 32px;
}

/* Custom DatePicker inputs & trigger styling */
:deep(.p-datepicker) {
  position: relative;
  display: inline-flex;
  width: 100%;
}

:deep(.p-datepicker .p-inputtext) {
  padding-right: 2.5rem !important;
  width: 100%;
}

:deep(.p-datepicker-dropdown) {
  position: absolute !important;
  right: 0.25rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  background: transparent !important;
  border: none !important;
  color: #71717a !important; /* zinc-500 */
  box-shadow: none !important;
  width: 2rem !important;
  height: 2rem !important;
  padding: 0 !important;
  min-width: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  z-index: 10 !important;
}

:deep(.p-datepicker-dropdown:hover) {
  color: #18181b !important; /* zinc-900 */
}

/* Ensure the icon inside is sized correctly */
:deep(.p-datepicker-dropdown .p-icon) {
  width: 1rem !important;
  height: 1rem !important;
}
</style>
