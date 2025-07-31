import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  getScrapingSources,
  getScrapingJobs,
  getScrapingStats,
  getSchedulerStatus,
  getPendingScrapedCases,
  getRecentScrapedArticles,
  startManualScraping,
  startSourceScraping,
  approveScrapedCase,
  rejectScrapedCase,
  getScrapingMetrics,
  updateScrapingSource
} from '@/lib/scraping-api';

/**
 * Hook to fetch scraping sources
 */
export function useScrapingSources() {
  return useQuery({
    queryKey: ['scraping-sources'],
    queryFn: getScrapingSources,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch scraping jobs with pagination
 */
export function useScrapingJobs(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ['scraping-jobs', page, limit],
    queryFn: () => getScrapingJobs(page, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch scraping statistics
 */
export function useScrapingStats() {
  return useQuery({
    queryKey: ['scraping-stats'],
    queryFn: getScrapingStats,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch scheduler status
 */
export function useSchedulerStatus() {
  return useQuery({
    queryKey: ['scheduler-status'],
    queryFn: getSchedulerStatus,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch pending scraped cases
 */
export function usePendingScrapedCases() {
  return useQuery({
    queryKey: ['pending-scraped-cases'],
    queryFn: getPendingScrapedCases,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch recent scraped articles for news display
 */
export function useRecentScrapedArticles(limit: number = 6) {
  return useQuery({
    queryKey: ['recent-scraped-articles', limit],
    queryFn: () => getRecentScrapedArticles(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch scraping metrics
 */
export function useScrapingMetrics() {
  return useQuery({
    queryKey: ['scraping-metrics'],
    queryFn: getScrapingMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to start manual scraping for all sources
 */
export function useStartManualScraping() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startManualScraping,
    onSuccess: (jobIds) => {
      toast({
        title: "Scraping Started",
        description: `Started ${jobIds.length} scraping jobs successfully.`,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['scraping-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Scraping Failed",
        description: "Failed to start scraping jobs. Please try again.",
        variant: "destructive",
      });
      console.error('Error starting manual scraping:', error);
    },
  });
}

/**
 * Hook to start scraping for a specific source
 */
export function useStartSourceScraping() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startSourceScraping,
    onSuccess: (jobId, sourceId) => {
      if (jobId) {
        toast({
          title: "Source Scraping Started",
          description: `Started scraping job ${jobId} for source.`,
        });
      } else {
        toast({
          title: "Scraping Already Running",
          description: "A scraping job is already running for this source.",
          variant: "destructive",
        });
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['scraping-sources'] });
    },
    onError: (error) => {
      toast({
        title: "Source Scraping Failed",
        description: "Failed to start scraping for this source. Please try again.",
        variant: "destructive",
      });
      console.error('Error starting source scraping:', error);
    },
  });
}

/**
 * Hook to approve a scraped case
 */
export function useApproveScrapedCase() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveScrapedCase,
    onSuccess: () => {
      toast({
        title: "Case Approved",
        description: "The scraped case has been approved and added to the database.",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['pending-scraped-cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['scraping-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: "Failed to approve the case. Please try again.",
        variant: "destructive",
      });
      console.error('Error approving scraped case:', error);
    },
  });
}

/**
 * Hook to reject a scraped case
 */
export function useRejectScrapedCase() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, reason }: { submissionId: string; reason?: string }) =>
      rejectScrapedCase(submissionId, reason),
    onSuccess: () => {
      toast({
        title: "Case Rejected",
        description: "The scraped case has been rejected.",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['pending-scraped-cases'] });
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject the case. Please try again.",
        variant: "destructive",
      });
      console.error('Error rejecting scraped case:', error);
    },
  });
}

/**
 * Hook to update scraping source configuration
 */
export function useUpdateScrapingSource() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateScrapingSource(id, updates),
    onSuccess: () => {
      toast({
        title: "Source Updated",
        description: "Scraping source configuration has been updated.",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['scraping-sources'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update scraping source. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating scraping source:', error);
    },
  });
}

/**
 * Hook to get real-time scraping status
 */
export function useScrapingStatus() {
  const scrapingJobs = useScrapingJobs(1, 10);
  const scrapingStats = useScrapingStats();
  const schedulerStatus = useSchedulerStatus();

  const isLoading = scrapingJobs.isLoading || scrapingStats.isLoading || schedulerStatus.isLoading;
  const error = scrapingJobs.error || scrapingStats.error || schedulerStatus.error;

  const activeJobs = scrapingJobs.data?.jobs.filter(job => 
    job.status === 'running' || job.status === 'pending'
  ) || [];

  const recentJobs = scrapingJobs.data?.jobs.slice(0, 5) || [];

  return {
    isLoading,
    error,
    activeJobs,
    recentJobs,
    stats: scrapingStats.data,
    scheduler: schedulerStatus.data,
    refetch: () => {
      scrapingJobs.refetch();
      scrapingStats.refetch();
      schedulerStatus.refetch();
    }
  };
}
