import { useState } from 'react';
import { ArrowLeft, Search, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { usePublishedNews } from '@/hooks/useNews';
import NewsDetailModal from '@/components/NewsDetailModal';
import SEOHead from '@/components/SEOHead';
import StructuredData from '@/components/StructuredData';

const AllNewsPage = () => {
  const navigate = useNavigate();
  const { data: newsArticles, isLoading: newsLoading } = usePublishedNews();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<any>(null);

  // Filter news
  const filteredNews = newsArticles?.filter(article => {
    return article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           article.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           article.category?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <SEOHead
        title="All Cases & News | REX Kenya - Police Brutality Reports"
        description="Browse all police brutality cases and news reports in Kenya. Stay informed with the latest developments in police accountability and human rights."
        keywords="police brutality cases, Kenya news, incident reports, human rights, police accountability, case database"
        url="https://rextracker.online/cases"
      />
      <StructuredData cases={[]} pageType="cases" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Latest News & Reports</h1>
                <p className="text-gray-400">Stay informed with the latest developments and editorial content</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/map')}
              className="bg-red-600 hover:bg-red-700"
            >
              <MapPin className="w-4 h-4 mr-2" />
              View Map
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">


        {/* Search */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search news articles, authors, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/20 border-white/20 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* News Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400">Loading news...</div>
              </div>
            ) : filteredNews.length > 0 ? (
              filteredNews.map((article) => (
                <Card key={article.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <CardContent className="p-0" onClick={() => setSelectedNews(article)}>
                    {article.featured_image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={article.featured_image_url}
                          alt={article.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-red-600 text-white">
                          {article.category || 'News'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatDate(article.published_at || article.created_at)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                        {article.excerpt || article.content.substring(0, 150) + '...'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>By {article.author}</span>
                        <Badge variant="outline" className={article.source === 'admin' ? 'border-blue-500 text-blue-400' : 'border-purple-500 text-purple-400'}>
                          {article.source === 'admin' ? 'Editorial' : 'News Source'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400">No news articles found matching your criteria.</div>
              </div>
            )}
          </div>
      </div>

      {/* News Detail Modal */}
      <NewsDetailModal
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        article={selectedNews}
      />
      </div>
    </>
  );
};

export default AllNewsPage;
