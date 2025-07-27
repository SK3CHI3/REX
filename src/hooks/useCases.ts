import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCases, fetchCaseById, submitCase, fetchCounties } from '@/lib/api'
import { SubmitCaseData } from '@/types'
import { toast } from '@/components/ui/sonner'

// Hook to fetch all cases
export function useCases() {
  return useQuery({
    queryKey: ['cases'],
    queryFn: fetchCases,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Hook to fetch a single case
export function useCase(id: string) {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => fetchCaseById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Hook to fetch counties
export function useCounties() {
  return useQuery({
    queryKey: ['counties'],
    queryFn: fetchCounties,
    staleTime: 60 * 60 * 1000, // 1 hour - counties don't change often
  })
}

// Hook to submit a new case
export function useSubmitCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitCase,
    onSuccess: () => {
      // Invalidate and refetch cases
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Case submitted successfully! It will be reviewed before being published.')
    },
    onError: (error) => {
      console.error('Error submitting case:', error)
      toast.error('Failed to submit case. Please try again.')
    },
  })
}
