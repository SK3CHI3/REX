import { useQuery } from '@tanstack/react-query';
import { fetchUserAnalytics, fetchRecentActivity, UserAnalytics, RecentActivity } from '@/lib/api';

export function useUserAnalytics() {
  return useQuery<UserAnalytics>({
    queryKey: ['userAnalytics'],
    queryFn: fetchUserAnalytics,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

export function useRecentActivity() {
  return useQuery<RecentActivity[]>({
    queryKey: ['recentActivity'],
    queryFn: fetchRecentActivity,
    refetchInterval: 15000, // Refetch every 15 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}
