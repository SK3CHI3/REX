import { X, Calendar, User, Tag, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface NewsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    id?: string;
    title: string;
    content: string;
    excerpt?: string;
    featured_image_url?: string;
    author: string;
    status?: string;
    category?: string;
    tags?: string[];
    published_at?: string;
    created_at?: string;
    source?: 'admin' | 'scraped';
    url?: string;
    image?: string;
    date?: string;
  } | null;
}

const NewsDetailModal = ({ isOpen, onClose, article }: NewsDetailModalProps) => {
  if (!isOpen || !article) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const imageUrl = article.featured_image_url || article.image;
  const publishDate = article.published_at || article.created_at || article.date;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-white/20">
        <CardContent className="p-0">
          {/* Header */}
          <div className="relative">
            {imageUrl && (
              <div className="relative h-64 md:h-80 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-white/20"
            >
              <X className="w-4 h-4" />
            </Button>

            {article.category && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-600 hover:bg-red-700 text-white">
                  {article.category}
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(publishDate)}</span>
              </div>

              {article.source && (
                <Badge 
                  variant="outline"
                  className={article.source === 'admin' ? 'border-blue-500 text-blue-400' : 'border-purple-500 text-purple-400'}
                >
                  {article.source === 'admin' ? 'REX Editorial' : 'News Source'}
                </Badge>
              )}
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <div className="bg-white/5 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <p className="text-gray-300 italic text-lg leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-400">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/10 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* External Link for Scraped Articles */}
            {article.source === 'scraped' && article.url && article.url !== '#' && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read Original Article
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end mt-8 pt-6 border-t border-white/10">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/10"
              >
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsDetailModal;
