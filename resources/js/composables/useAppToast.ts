import { useToast } from 'primevue/usetoast'

export function useAppToast() {
  const toast = useToast()

  const showError = (detail: string) => {
    toast.add({ severity: 'error', summary: 'Error', detail, life: 5000 })
  }

  return { showError }
}

