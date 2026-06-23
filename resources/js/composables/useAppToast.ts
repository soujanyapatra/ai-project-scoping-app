import { useToast } from 'primevue/usetoast'

export function useAppToast() {
  const toast = useToast()

  const showError = (detail: string) => {
    toast.add({ severity: 'error', summary: 'Error', detail, life: 5000 })
  }

  const showSuccess = (detail: string) => {
    toast.add({ severity: 'success', summary: 'Success', detail, life: 3000 })
  }

  return { showError, showSuccess }
}

