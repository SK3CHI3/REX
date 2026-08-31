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
  isAiGenerated?: boolean;
}

// Row shape of the news_articles table (weekly AI digests written by n8n)
interface WeeklyDigestRow {
  id: string;
  title: string;
  summary: string | null;
  body: string;
  category: string | null;
  ai_generated: boolean | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapDigestToArticle(digest: WeeklyDigestRow): NewsArticle {
  return {
    id: digest.id,
    title: digest.title,
    content: digest.body,
    excerpt: digest.summary || undefined,
    author: 'AI Newsroom',
    status: 'published',
    category: digest.category || 'Weekly Digest',
    tags: ['weekly-digest', 'ai-generated'],
    published_at: digest.published_at || undefined,
    created_at: digest.created_at,
    updated_at: digest.updated_at,
    isAiGenerated: digest.ai_generated ?? true,
  };
}

// Digests live in news_articles; a missing/failed table must not break the News page
async function fetchPublishedDigests(): Promise<NewsArticle[]> {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching weekly digests:', error);
    return [];
  }
  return ((data as WeeklyDigestRow[]) || []).map(mapDigestToArticle);
}

// Get news article by slug (falls back to digest id lookup)
export function useNewsArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['newsArticle', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('news')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (data) return data as NewsArticle;

      // Weekly digests are linked by their id
      const digests = await fetchPublishedDigests();
      const digest = digests.find((d) => d.id === slug);
      if (!digest) throw new Error('Article not found');
      return digest;
    },
    enabled: !!slug,
  });
}

// Get all published news articles (editorial + weekly AI digests)
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

      const digests = await fetchPublishedDigests();
      const merged = [...(data as NewsArticle[]), ...digests];
      merged.sort(
        (a, b) =>
          new Date(b.published_at || b.created_at).getTime() -
          new Date(a.published_at || a.created_at).getTime()
      );
      return merged;
    }
  });
}
