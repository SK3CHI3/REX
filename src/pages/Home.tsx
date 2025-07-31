import React, { useState, useRef } from 'react';
import { MapPin, ArrowRight, Shield, Users, Eye, Calendar, AlertTriangle, ChevronDown, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useCases } from '@/hooks/useCases';
import { useRecentScrapedArticles } from '@/hooks/useScraping';
import { useVisitorTracking } from '@/hooks/useVisitorTracking';
import { useRecentNews } from '@/hooks/useNews';
import NewsDetailModal from '@/components/NewsDetailModal';
import { getTopCounties } from '@/utils/countyNormalization';

// Helper functions - defined outside component to avoid hoisting issues
const formatRelativeDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const formatCaseType = (type: string | null | undefined) => {
  if (!type) return 'Unknown';
  return type.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const formatArticleForNews = (article: any) => {
  const extractedData = article.extracted_data || {};
  const sourceName = article.scraping_sources?.name || 'Unknown Source';

  // Determine category based on case type
  const getCategoryFromCaseType = (caseType: string) => {
    switch (caseType) {
      case 'death': return 'Fatal Incident';
      case 'assault': return 'Assault';
      case 'harassment': return 'Harassment';
      case 'unlawful_arrest': return 'Arrest';
      default: return 'Investigation';
    }
  };

  // Create excerpt from content or description
  const createExcerpt = (content: string, description: string) => {
    const text = description || content || '';
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  return {
    title: article.title || extractedData.victim_name ?
      `Police Incident: ${extractedData.victim_name || 'Victim'}` :
      'Police Brutality Incident Reported',
    excerpt: createExcerpt(article.content, extractedData.description),
    source: sourceName,
    date: formatRelativeDate(article.created_at),
    category: getCategoryFromCaseType(extractedData.case_type),
    url: article.url || '#', // Use actual article URL or fallback
    location: extractedData.location || 'Kenya',
    image: getImageForCategory(extractedData.case_type)
  };
};

const getImageForCategory = (caseType: string) => {
  // Use police brutality/justice related fallback image for news articles
  const fallbackImage = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop&q=80'; // Justice/protest image

  switch (caseType) {
    case 'death':
      return 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=250&fit=crop&q=80'; // Memorial/candles
    case 'assault':
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&q=80'; // Justice scales
    case 'harassment':
      return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop&q=80'; // Protest/justice
    case 'unlawful_arrest':
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&q=80'; // Police/law enforcement
    default:
      return fallbackImage;
  }
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  const parent = target.parentElement;

  if (parent) {
    // Replace image with a styled placeholder related to justice/police brutality
    parent.innerHTML = `
      <div class="w-full h-full bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center">
        <div class="text-center text-red-200">
          <svg class="w-12 h-12 mx-auto mb-2 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <p class="text-xs">Justice Report</p>
        </div>
      </div>
    `;
  }
};

const Home = () => {
  // Track visitor
  useVisitorTracking();

  const navigate = useNavigate();
  const { data: cases, isLoading, error } = useCases();
  const { data: scrapedArticles, isLoading: articlesLoading } = useRecentScrapedArticles(3);
  const { data: newsArticles } = useRecentNews(3);

  // News modal state
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<any>(null);

  // Secret admin access state
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnterApp = () => {
    navigate('/map');
  };

  const handleViewAllNews = () => {
    navigate('/cases');
  };

  const handleNewsClick = (article: any) => {
    setSelectedNewsArticle(article);
  };

  // Secret admin access handler
  const handleLiveIndicatorClick = () => {
    setTapCount(prev => prev + 1);

    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Set new timeout to reset tap count
    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, 500); // Reset after 500ms

    // Check for double tap
    if (tapCount + 1 >= 2) {
      setTapCount(0);
      navigate('/admin/login');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculate statistics from real data
  const totalCases = cases?.length || 0;

  // Calculate this month's cases with better error handling and timezone awareness
  const thisMonthCases = cases?.filter(c => {
    if (!c.date) return false;

    try {
      // Parse the date string (should be in YYYY-MM-DD format)
      const caseDate = new Date(c.date + 'T00:00:00'); // Add time to avoid timezone issues
      const now = new Date();

      // Check if date is valid
      if (isNaN(caseDate.getTime())) {
        console.warn('Invalid date found in case:', c.id, c.date);
        return false;
      }

      // Compare month and year
      const isThisMonth = caseDate.getMonth() === now.getMonth() &&
                         caseDate.getFullYear() === now.getFullYear();

      return isThisMonth;
    } catch (error) {
      console.warn('Error parsing date for case:', c.id, c.date, error);
      return false;
    }
  }).length || 0;

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development' && cases && cases.length > 0) {
    console.log('Total cases:', totalCases);
    console.log('This month cases:', thisMonthCases);
    console.log('Current month/year:', new Date().getMonth(), new Date().getFullYear());
    console.log('Sample case dates:', cases.slice(0, 3).map(c => ({ id: c.id, date: c.date })));
  }

  // Show error state if data fails to load
  if (error) {
    console.error('Error loading cases:', error);
  }

  // Get top counties using the utility function
  const topCounties = getTopCounties(cases || [], 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white overflow-x-hidden">
      {/* Floating Navigation Header */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl max-w-7xl w-full">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                {/* Police shield with crack/slash SVG */}
                <span className="text-2xl" role="img" aria-label="Scales of Justice">⚖️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">REX</h1>
                <p className="text-xs text-gray-300 hidden sm:block">Justice through visibility</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform duration-200"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform duration-200"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('impact')}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium hover:scale-105 transform duration-200"
              >
                Impact
              </button>
            </div>

            <Button
              onClick={handleEnterApp}
              size="sm"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 transform duration-200"
            >
              Launch App
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <section className="relative min-h-[80vh] flex items-center px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pb-16">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center min-h-[60vh]">

            {/* Left Side - Main Content */}
            <div className="space-y-8 animate-fade-in flex flex-col justify-center h-full text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-red-900/30 backdrop-blur-sm border border-red-500/30 text-red-300 px-6 py-3 rounded-full text-sm font-medium w-fit mx-auto lg:mx-0">
                <Shield className="w-4 h-4" />
                <span>Brutality Marked On Map</span>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Kenya's
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent block ml-4 sm:ml-6">
                    Justice
                  </span>
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Tracker
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 leading-relaxed font-light">
                  An interactive platform documenting police brutality incidents across Kenya. 
                  <span className="text-red-400 font-medium"> Empowering communities through data transparency.</span>
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <Button
                  onClick={handleEnterApp}
                  size="lg"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-6 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 group"
                >
                  <span>Explore Interactive Map</span>
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <button 
                  onClick={() => scrollToSection('about')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-lg font-medium group"
                >
                  <span>Learn More</span>
                  <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </button>
              </div>

              {/* Key Metrics - No background card, moved up */}
              <div className="mt-6 mb-4">
                <div className="grid grid-cols-2 gap-8 justify-items-center lg:justify-items-start">
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="text-3xl font-bold text-white mb-1">24/7</div>
                    <div className="text-sm text-gray-400">Live Monitoring</div>
                  </div>
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="text-3xl font-bold text-white mb-1">100%</div>
                    <div className="text-sm text-gray-400">Data Transparency</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Data Visualization & Recent Cases */}
            <div className="animate-fade-in lg:pl-8 flex items-center justify-center">
              {/* Live Stats Card - Responsive width */}
              <div className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg flex flex-col">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl font-bold">Live Statistics</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center group">
                    <div className="text-3xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      47
                    </div>
                    <div className="text-sm text-gray-400 font-medium">Counties</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      {isLoading ? '...' : error ? '--' : totalCases}
                    </div>
                    <div className="text-sm text-gray-400 font-medium">Total Cases</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                      {isLoading ? '...' : error ? '--' : thisMonthCases}
                    </div>
                    <div className="text-sm text-gray-400 font-medium">This Month</div>
                  </div>
                </div>

                {/* Top Counties by Incidents */}
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                      Top Counties
                    </h4>
                    <Badge variant="secondary" className="bg-red-900/50 text-red-300 border-red-500/30">
                      Most Incidents
                    </Badge>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
                    {isLoading ? (
                      <div className="text-center text-gray-400 py-4">Loading county data...</div>
                    ) : error ? (
                      <div className="text-center text-gray-400 py-4">Unable to load data</div>
                    ) : topCounties.length === 0 ? (
                      <div className="text-center text-gray-400 py-4">No data available</div>
                    ) : (
                      topCounties.map((county, index) => (
                        <div key={county.county} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              index === 1 ? 'bg-gray-400/20 text-gray-300' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              #{county.rank}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white group-hover:text-red-300 transition-colors">
                                {county.county}
                              </p>
                              <p className="text-xs text-gray-400">{county.count} incidents</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-red-400">{county.percentage}%</span>
                            <p className="text-xs text-gray-500">of total</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Our Mission
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              REX exists to create transparency and accountability in law enforcement through 
              comprehensive documentation and community empowerment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Why This Matters</h3>
              <p className="text-gray-300 leading-relaxed">
                Police brutality cases often go undocumented or unreported, making it difficult 
                to understand patterns and hold authorities accountable. Our platform bridges 
                this gap by providing a comprehensive, transparent view of incidents across Kenya.
              </p>
              <div className="flex items-center space-x-3 text-red-400">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Real-time incident tracking</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-900/20 to-black/40 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20">
              <h4 className="text-xl font-bold text-white mb-4">Data-Driven Justice</h4>
              <p className="text-gray-300 mb-6">
                Every pin on our map represents a human story. By visualizing these incidents, 
                we help communities, activists, and policymakers make informed decisions.
              </p>
              <Button 
                onClick={handleEnterApp}
                variant="outline" 
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                View Data Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Latest News & Reports
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Stay informed with the latest developments in police accountability and human rights in Kenya
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {articlesLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="group">
                  <div className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 animate-pulse">
                    <div className="h-48 bg-gray-700"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-700 rounded mb-3"></div>
                      <div className="h-6 bg-gray-700 rounded mb-3"></div>
                      <div className="h-16 bg-gray-700 rounded mb-4"></div>
                      <div className="h-4 bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : newsArticles && newsArticles.length > 0 ? (
              // Admin news articles (prioritized)
              newsArticles.map((article, index) => (
                <div key={article.id} className="group cursor-pointer" onClick={() => handleNewsClick(article)}>
                  <div className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.featured_image_url || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop&q=80'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={handleImageError}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-red-500/90 text-white text-xs font-medium px-3 py-1 rounded-full">
                          {article.category || 'News'}
                        </span>
                      </div>
                      {article.source === 'admin' && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-blue-500/90 text-white text-xs font-medium px-2 py-1 rounded-full">
                            Editorial
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span>{article.author}</span>
                        <span>{formatRelativeDate(article.published_at || article.created_at)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">{article.title}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
                        {article.excerpt || article.content.substring(0, 150) + '...'}
                      </p>
                      <div className="inline-flex items-center text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                        Read More
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : scrapedArticles && scrapedArticles.length > 0 ? (
              // Real scraped articles
              scrapedArticles.map((rawArticle, index) => {
                const article = formatArticleForNews(rawArticle);
                return (
              <div key={index} className="group cursor-pointer" onClick={() => handleNewsClick(article)}>
                <div className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={handleImageError}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-500/90 text-white text-xs font-medium px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>{article.source}</span>
                      <span>{article.date}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">{article.excerpt}</p>
                    {article.url && article.url !== '#' ? (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Read More
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    ) : (
                      <span className="inline-flex items-center text-gray-500 text-sm font-medium">
                        Source Unavailable
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              </div>
                );
              })
            ) : (
              // Fallback when no scraped articles available
              [
                {
                  title: "No Recent Articles Available",
                  excerpt: "We're currently scraping news sources for the latest police brutality incidents. Check back soon for updates.",
                  source: "System",
                  date: "Now",
                  category: "Info",
                  url: "#",
                  image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop&q=80"
                }
              ].map((article, index) => (
                <div key={index} className="group col-span-full max-w-md mx-auto">
                  <div className="bg-gradient-to-br from-black/40 to-gray-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover opacity-50"
                        onError={handleImageError}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-500/90 text-white text-xs font-medium px-3 py-1 rounded-full">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-lg font-bold text-white mb-3">{article.title}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">{article.excerpt}</p>
                      <p className="text-gray-400 text-xs">Scraping system is actively collecting incident data...</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleViewAllNews}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              View All News & Reports
            </button>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 px-4 bg-gradient-to-r from-red-900/10 to-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Creating Real Impact
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join thousands of Kenyans working together to build a more transparent 
            and accountable society through data-driven advocacy.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-red-400 mb-2">{isLoading ? '...' : error ? '--' : totalCases}</div>
              <div className="text-gray-300">Cases Documented</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-red-400 mb-2">47</div>
              <div className="text-gray-300">Counties Covered</div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-red-400 mb-2">24/7</div>
              <div className="text-gray-300">Live Monitoring</div>
            </div>
          </div>
          
          <Button
            onClick={handleEnterApp}
            size="lg"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
          >
            Start Exploring
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                  <span className="text-2xl" role="img" aria-label="Scales of Justice">⚖️</span>
                </div>
                <span className="text-xl font-bold">REX</span>
              </div>
              <p className="text-gray-400 text-sm">
                Justice through visibility
              </p>
            </div>

            {/* Platform */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Platform</h4>
              <div className="space-y-2">
                <button onClick={handleEnterApp} className="block text-gray-400 hover:text-white text-sm transition-colors">
                  Interactive Map
                </button>
                <button onClick={() => scrollToSection('about')} className="block text-gray-400 hover:text-white text-sm transition-colors">
                  About
                </button>
                <button onClick={() => scrollToSection('news')} className="block text-gray-400 hover:text-white text-sm transition-colors">
                  News
                </button>
              </div>
            </div>

            {/* Data */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Data</h4>
              <div className="space-y-2">
                <div className="text-gray-400 text-sm">Total Cases: {isLoading ? '...' : error ? '--' : totalCases}</div>
                <div className="text-gray-400 text-sm">Counties: 47</div>
                <div className="text-gray-400 text-sm">Last Updated: Today</div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Support</h4>
              <div className="space-y-2">
                <div className="text-gray-400 text-sm">Report an Issue</div>
                <div className="text-gray-400 text-sm">Community Guidelines</div>
                <div className="text-gray-400 text-sm">Privacy Policy</div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm text-center md:text-left mb-4 md:mb-0">
                © {new Date().getFullYear()} REX. Building a safer Kenya through transparency and accountability.
              </p>
              <div className="flex items-center space-x-6">
                <span className="text-gray-400 text-sm">Together for justice</span>
                <button
                  onClick={handleLiveIndicatorClick}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* News Detail Modal */}
      <NewsDetailModal
        isOpen={!!selectedNewsArticle}
        onClose={() => setSelectedNewsArticle(null)}
        article={selectedNewsArticle}
      />
    </div>
  );
};

export default Home;
