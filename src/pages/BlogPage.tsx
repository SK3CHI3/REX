import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Tag, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAllPublishedNews } from '@/hooks/useNewsArticle';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';

const BlogPage = () => {
  const { data: articles, isLoading } = useAllPublishedNews();
  const navigate = useNavigate();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const generateSlug = (article: any) => {
    return article.slug || article.id;
  };

  const blogStructuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "REX Kenya Blog",
    "description": "News, insights, and reports on police accountability and human rights in Kenya",
    "url": "https://rextracker.online/blog",
    "publisher": {
      "@type": "Organization",
      "name": "REX Kenya",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rextracker.online/logo.svg"
      }
    },
    "blogPost": articles?.slice(0, 20).map(article => ({
      "@type": "BlogPosting",
      "headline": article.title,
      "description": article.excerpt || article.content?.substring(0, 160),
      "author": { "@type": "Person", "name": article.author },
      "datePublished": article.published_at || article.created_at,
      "url": `https://rextracker.online/blog/${generateSlug(article)}`
    })) || []
  };

  return (
    <>
      <SEOHead
        title="Blog - News & Insights | REX Kenya"
        description="Read the latest news, reports, and insights on police accountability, human rights, and justice in Kenya. Stay informed with REX Kenya's editorial content."
        keywords="police brutality Kenya blog, human rights news Kenya, police accountability articles, Kenya justice news, civic tech Kenya"
        url="https://rextracker.online/blog"
        structuredData={blogStructuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              News & Insights
            </h1>
            <p className="text-gray-400 text-lg">
              Reports, analysis, and updates on police accountability in Kenya
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4" />
              <p className="text-gray-400">Loading articles...</p>
            </div>
          ) : !articles || articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No articles published yet. Check back soon.</p>
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {articles[0] && (
                <Link
                  to={`/blog/${generateSlug(articles[0])}`}
                  className="block group mb-12"
                >
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {articles[0].featured_image_url ? (
                          <div className="h-64 lg:h-full">
                            <img
                              src={articles[0].featured_image_url}
                              alt={articles[0].title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="h-64 lg:h-full bg-gradient-to-br from-red-900/50 to-slate-900 flex items-center justify-center">
                            <span className="text-6xl opacity-30">📰</span>
                          </div>
                        )}
                        <div className="p-8 flex flex-col justify-center">
                          <Badge className="w-fit mb-4 bg-red-600/20 text-red-300 border-red-500/30">
                            Featured
                          </Badge>
                          <h2 className="text-2xl md:text-3xl font-bold text-white group-hover:text-red-400 transition-colors mb-4">
                            {articles[0].title}
                          </h2>
                          <p className="text-gray-300 mb-6 line-clamp-3">
                            {articles[0].excerpt || articles[0].content?.substring(0, 200)}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {articles[0].author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(articles[0].published_at || articles[0].created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {/* Rest of articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(1).map((article) => (
                  <Link
                    key={article.id}
                    to={`/blog/${generateSlug(article)}`}
                    className="block group"
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 h-full">
                      <CardContent className="p-0">
                        {article.featured_image_url ? (
                          <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-red-900/30 to-slate-800 flex items-center justify-center rounded-t-lg">
                            <span className="text-4xl opacity-30">📰</span>
                          </div>
                        )}
                        <div className="p-6">
                          {article.category && (
                            <Badge variant="outline" className="mb-3 border-white/20 text-gray-300 text-xs">
                              {article.category}
                            </Badge>
                          )}
                          <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors mb-3 line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                            {article.excerpt || article.content?.substring(0, 150)}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {article.author}
                            </span>
                            <span>{formatDate(article.published_at || article.created_at)}</span>
                          </div>
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {article.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* SEO Footer */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">About REX Kenya Blog</h2>
              <p className="text-gray-300 mb-4">
                The REX Kenya Blog covers news, analysis, and insights on police accountability and human rights in Kenya.
                Our editorial team publishes reports on incidents, legal developments, and community responses to
                police misconduct across all 47 counties.
              </p>
              <p className="text-gray-300">
                Stay informed about the fight for justice and transparency. Our blog complements our
                <Link to="/map" className="text-red-400 hover:text-red-300 mx-1">interactive incident map</Link>
                and <Link to="/cases-index" className="text-red-400 hover:text-red-300 mx-1">case database</Link>,
                providing context and depth to the data we track.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
