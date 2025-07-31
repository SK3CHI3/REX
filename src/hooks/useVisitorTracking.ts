import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Generate a simple browser fingerprint
function generateVisitorId(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// Track visitor
export function useVisitorTracking() {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const visitorId = generateVisitorId();
        const sessionKey = `visitor_${visitorId}`;
        const lastVisit = localStorage.getItem(sessionKey);
        const now = new Date().toISOString();
        
        // Only track if it's a new session (more than 30 minutes since last visit)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        
        if (!lastVisit || lastVisit < thirtyMinutesAgo) {
          // Track the visit
          await supabase
            .from('site_visitors')
            .upsert({
              visitor_id: visitorId,
              last_visit: now,
              user_agent: navigator.userAgent,
              page_url: window.location.pathname,
              referrer: document.referrer || null
            }, {
              onConflict: 'visitor_id'
            });
          
          // Update local storage
          localStorage.setItem(sessionKey, now);
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    trackVisitor();
  }, []);
}

// Get visitor analytics
export function useVisitorAnalytics() {
  return useQuery({
    queryKey: ['visitorAnalytics'],
    queryFn: async () => {
      try {
        // Get total unique visitors
        const { count: totalVisitors } = await supabase
          .from('site_visitors')
          .select('*', { count: 'exact', head: true });

        // Get visitors today
        const today = new Date().toISOString().split('T')[0];
        const { count: visitorsToday } = await supabase
          .from('site_visitors')
          .select('*', { count: 'exact', head: true })
          .gte('last_visit', today);

        // Get visitors this week
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: visitorsThisWeek } = await supabase
          .from('site_visitors')
          .select('*', { count: 'exact', head: true })
          .gte('last_visit', weekAgo);

        return {
          totalVisitors: totalVisitors || 0,
          visitorsToday: visitorsToday || 0,
          visitorsThisWeek: visitorsThisWeek || 0
        };
      } catch (error) {
        console.error('Error fetching visitor analytics:', error);
        return {
          totalVisitors: 0,
          visitorsToday: 0,
          visitorsThisWeek: 0
        };
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000 // Consider data stale after 30 seconds
  });
}
