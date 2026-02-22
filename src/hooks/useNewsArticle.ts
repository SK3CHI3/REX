import { useQuery } from '@tanstack/react-query';
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
  slug?: string;
  seo_title?: string;
  seo_description?: string;
}

// Get news article by slug
export function useNewsArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['newsArticle', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data as NewsArticle;
    },
    enabled: !!slug,
  });
}

// Get all published news articles
export function useAllPublishedNews() {
  return useQuery({
    queryKey: ['allPublishedNews'],
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