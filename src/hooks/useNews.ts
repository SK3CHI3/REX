import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  tags?: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  source?: 'admin' | 'scraped';
  scraped_article_id?: string;
  slug: string;
}

export interface CreateNewsData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  author: string;
  status?: 'draft' | 'published';
  category?: string;
  tags?: string[];
  slug?: string;
}

export interface UpdateNewsData extends Partial<CreateNewsData> {
  id: string;
}

// Get all news articles (admin)
export function useNews() {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NewsArticle[];
    }
  });
}

// Get published news articles (public)
export function usePublishedNews() {
  return useQuery({
    queryKey: ['publishedNews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data as NewsArticle[];
    }
  });
}

// Get recent published news (for homepage)
export function useRecentNews(limit: number = 3) {
  return useQuery({
    queryKey: ['recentNews', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as NewsArticle[];
    }
  });
}

// Create news article
export function useCreateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsData: CreateNewsData) => {
      const { data, error } = await supabase
        .from('news')
        .insert({
          ...newsData,
          slug: newsData.slug || newsData.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
          source: 'admin',
          published_at: newsData.status === 'published' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['publishedNews'] });
      queryClient.invalidateQueries({ queryKey: ['recentNews'] });
    }
  });
}

// Update news article
export function useUpdateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsData: UpdateNewsData) => {
      const { id, ...updateData } = newsData;

      // Set published_at when status changes to published
      const publishedAt = updateData.status === 'published' ? new Date().toISOString() : undefined;

      // Don't regenerate slug from title - preserve existing slug unless explicitly provided
      const { data, error } = await supabase
        .from('news')
        .update({
          ...updateData,
          ...(publishedAt ? { published_at: publishedAt } : {}),
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['publishedNews'] });
      queryClient.invalidateQueries({ queryKey: ['recentNews'] });
    }
  });
}

// Delete news article
export function useDeleteNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['publishedNews'] });
      queryClient.invalidateQueries({ queryKey: ['recentNews'] });
    }
  });
}

