import type { AxiosError } from 'axios'

export function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>
  const responseMessage = axiosError?.response?.data?.message ?? axiosError?.response?.data?.error
  if (typeof responseMessage === 'string' && responseMessage.trim().length > 0) return responseMessage
  if (typeof axiosError?.message === 'string' && axiosError.message.trim().length > 0) return axiosError.message
  return 'Request failed.'
}

