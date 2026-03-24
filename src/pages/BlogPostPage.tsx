import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNewsArticleBySlug, useAllPublishedNews } from '@/hooks/useNewsArticle';
import SEOHead from '@/components/SEOHead';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading, error } = useNewsArticleBySlug(slug || '');
  const { data: allArticles } = useAllPublishedNews();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const estimateReadTime = (content?: string) => {
    if (!content) return '1 min';
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt || article?.seo_description,
          url,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  // Related articles (same category, excluding current)
  const relatedArticles = allArticles
    ?.filter(a => a.id !== article?.id && a.category === article?.category)
    .slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/blog')} className="bg-red-600 hover:bg-red-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.seo_title || article.title,
    "description": article.seo_description || article.excerpt || article.content?.substring(0, 160),
    "image": article.featured_image_url || "https://rextracker.online/og-image.svg",
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "REX Kenya",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rextracker.online/logo.svg"
      }
    },
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://rextracker.online/blog/${slug}`
    },
    "url": `https://rextracker.online/blog/${slug}`,
    "keywords": article.tags?.join(', ') || 'police brutality, Kenya, human rights',
    "articleSection": article.category || 'News',
    "wordCount": article.content?.split(/\s+/).length || 0,
    "inLanguage": "en"
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rextracker.online" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://rextracker.online/blog" },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": `https://rextracker.online/blog/${slug}` }
    ]
  };

  return (
    <>
      <SEOHead
        title={`${article.seo_title || article.title} | REX Kenya`}
        description={article.seo_description || article.excerpt || article.content?.substring(0, 155) + '...'}
        keywords={article.tags?.join(', ') || `${article.category}, police brutality Kenya, human rights`}
        url={`https://rextracker.online/blog/${slug}`}
        image={article.featured_image_url || undefined}
        type="article"
        structuredData={[articleStructuredData, breadcrumbData]}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white">
        {/* Header Bar */}
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Articles
            </Button>
            <Button
              variant="ghost"
              onClick={handleShare}
              className="text-gray-300 hover:text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            {article.category && (
              <Badge className="mb-4 bg-red-600/20 text-red-300 border-red-500/30">
                {article.category}
              </Badge>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-6 border-b border-white/10">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(article.published_at || article.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {estimateReadTime(article.content)}
              </span>
            </div>
          </header>

          {/* Article Body */}
          <div className="prose prose-invert prose-lg max-w-none mb-12
            prose-headings:text-white prose-headings:font-bold
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-red-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-blockquote:border-red-500 prose-blockquote:text-gray-300
          ">
            {/* Render content - support basic paragraph splitting */}
            {article.content?.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8 pt-6 border-t border-white/10">
              <Tag className="w-4 h-4 text-gray-400" />
              {article.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="border-white/20 text-gray-300">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Author Card */}
          <Card className="bg-white/5 border-white/10 mb-12">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                <User className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-white">{article.author}</p>
                <p className="text-sm text-gray-400">REX Kenya Contributor</p>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    to={`/blog/${related.slug || related.id}`}
                    className="block group"
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all h-full">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors mb-2 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {formatDate(related.published_at || related.created_at)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="text-center mt-12 pt-8 border-t border-white/10">
            <p className="text-gray-400 mb-4">Explore more from REX Kenya</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={() => navigate('/blog')} variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                More Articles
              </Button>
              <Button onClick={() => navigate('/map')} className="bg-red-600 hover:bg-red-700">
                View Interactive Map
              </Button>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogPostPage;
