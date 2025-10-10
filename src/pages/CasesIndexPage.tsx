import { Link } from 'react-router-dom';
import { MapPin, Calendar, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCases } from '@/hooks/useCases';
import SEOHead from '@/components/SEOHead';

/**
 * CasesIndexPage - A dedicated page listing all police brutality cases
 * Purpose: Make individual cases discoverable by AI crawlers
 * Each case has a clickable link to its dedicated page (/case/:id)
 */
const CasesIndexPage = () => {
  const { data: cases, isLoading } = useCases();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'death': return 'bg-red-600 text-white';
      case 'assault': return 'bg-orange-600 text-white';
      case 'harassment': return 'bg-yellow-600 text-white';
      case 'unlawful_arrest': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  // Generate structured data for the collection
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Police Brutality Cases in Kenya",
    "description": "Comprehensive database of documented police brutality cases across all 47 counties in Kenya",
    "url": "https://rextracker.online/cases-index",
    "publisher": {
      "@type": "Organization",
      "name": "REX Kenya",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rextracker.online/logo.svg"
      }
    },
    "numberOfItems": cases?.length || 0,
    "itemListElement": cases?.slice(0, 100).map((caseItem, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://rextracker.online/case/${caseItem.id}`,
      "name": `${caseItem.victimName} - ${caseItem.county}`,
      "description": caseItem.description.substring(0, 200)
    })) || []
  };

  return (
    <>
      <SEOHead
        title="All Police Brutality Cases Database | REX Kenya"
        description={`Browse ${cases?.length || 'all'} documented police brutality cases across Kenya's 47 counties. Comprehensive database for transparency and accountability.`}
        keywords="police brutality cases, Kenya database, all cases, incident list, human rights violations, police accountability"
        url="https://rextracker.online/cases-index"
      />
      
      {/* Structured Data for AI */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Police Brutality Cases Database
            </h1>
            <p className="text-gray-400 text-lg">
              {cases?.length || 0} documented cases across Kenya's 47 counties
            </p>
            <p className="text-gray-500 text-sm mt-2">
              This page lists all police brutality cases tracked by REX Kenya. Click any case to view full details.
            </p>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Loading cases...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases?.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  to={`/case/${caseItem.id}`}
                  className="block group"
                >
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors mb-2 line-clamp-1">
                            {caseItem.victimName}
                          </h2>
                          {caseItem.age && (
                            <p className="text-sm text-gray-400">Age: {caseItem.age}</p>
                          )}
                        </div>
                        <Badge className={getTypeColor(caseItem.type)}>
                          {caseItem.type.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-400 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{caseItem.location}, {caseItem.county}</span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-gray-400 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(caseItem.date)}</span>
                      </div>

                      {/* Description Preview */}
                      <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed mb-4">
                        {caseItem.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <Badge variant="outline" className="border-white/20 text-gray-400">
                          {caseItem.status}
                        </Badge>
                        <span className="text-xs text-gray-500 group-hover:text-red-400 transition-colors">
                          View Details →
                        </span>
                      </div>

                      {/* Community Verification Indicator */}
                      {caseItem.communityVerified && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Community Verified
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* No Cases */}
          {!isLoading && (!cases || cases.length === 0) && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No cases found in the database.</p>
            </div>
          )}

          {/* SEO Footer Content for AI */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">About This Database</h2>
              <p className="text-gray-300 mb-4">
                REX Kenya maintains a comprehensive database of police brutality cases across all 47 counties in Kenya. 
                Each case is documented with location data, incident details, victim information, and current investigation status.
              </p>
              <p className="text-gray-300 mb-4">
                Our database serves as a tool for transparency and accountability, helping journalists, researchers, 
                human rights organizations, and concerned citizens track patterns of police violence in Kenya.
              </p>
              <h3 className="text-xl font-semibold mb-3">How Cases Are Verified</h3>
              <p className="text-gray-300">
                Each case in our database goes through a community verification process where users can confirm 
                the authenticity of reports. Cases with 2 or more community confirmations are marked as verified. 
                All cases are also reviewed by our team for accuracy before publication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CasesIndexPage;

