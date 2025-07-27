import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCases, fetchCaseById, submitCase, fetchCounties, fetchPendingSubmissions, approveSubmission, rejectSubmission } from '@/lib/api'
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

// Hook to fetch pending case submissions
export function usePendingSubmissions() {
  return useQuery({
    queryKey: ['pending-submissions'],
    queryFn: fetchPendingSubmissions,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Hook to approve a case submission
export function useApproveSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: approveSubmission,
    onSuccess: () => {
      // Invalidate and refetch both pending submissions and cases
      queryClient.invalidateQueries({ queryKey: ['pending-submissions'] })
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Case approved and published successfully!')
    },
    onError: (error) => {
      console.error('Error approving submission:', error)
      toast.error('Failed to approve case. Please try again.')
    },
  })
}

// Hook to reject a case submission
export function useRejectSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ submissionId, reason }: { submissionId: string; reason?: string }) =>
      rejectSubmission(submissionId, reason),
    onSuccess: () => {
      // Invalidate and refetch pending submissions
      queryClient.invalidateQueries({ queryKey: ['pending-submissions'] })
      toast.success('Case submission rejected.')
    },
    onError: (error) => {
      console.error('Error rejecting submission:', error)
      toast.error('Failed to reject case. Please try again.')
    },
  })
}
