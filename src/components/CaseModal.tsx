
import { X, Calendar, MapPin, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Case } from '@/types';

interface CaseModalProps {
  case: Case;
  onClose: () => void;
}

const CaseModal = ({ case: caseData, onClose }: CaseModalProps) => {
  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'verified': return 'bg-emerald-600 text-white';
      case 'investigating': return 'bg-amber-600 text-white';
      case 'dismissed': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTypeLabel = (type: Case['type']) => {
    switch (type) {
      case 'death': return 'Death';
      case 'assault': return 'Physical Assault';
      case 'harassment': return 'Harassment';
      case 'unlawful_arrest': return 'Unlawful Arrest';
      case 'other': return 'Other';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <Card className="w-full max-w-2xl max-h-[96vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 sm:slide-in-from-bottom-0 sm:fade-in">
        {/* Header - minimal mobile design */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{caseData.victimName}</h2>
              {caseData.age && (
                <span className="text-xs text-gray-500">Age {caseData.age}</span>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Content - scrollable */}
        <CardContent className="p-3 sm:p-4 space-y-4 sm:space-y-6 overflow-y-auto">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(caseData.status)}>
              {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
              {getTypeLabel(caseData.type)}
            </Badge>
          </div>

          {/* Quick info grid - better mobile layout */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                <p className="text-sm font-medium text-gray-900">{new Date(caseData.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                <p className="text-sm font-medium text-gray-900">{caseData.location}, {caseData.county}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold mb-2 sm:mb-3 flex items-center space-x-2 text-gray-900">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              <span>Incident Description</span>
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {caseData.description}
            </p>
          </div>

          {/* Evidence section */}
          {((caseData.photos && caseData.photos.length > 0) || (caseData.videoLinks && caseData.videoLinks.length > 0)) && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-gray-900">Evidence</h3>
              
              {caseData.photos && caseData.photos.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Photos ({caseData.photos.length})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {caseData.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              )}

              {caseData.videoLinks && caseData.videoLinks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Video Evidence</h4>
                  <div className="space-y-2">
                    {caseData.videoLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-red-600 hover:text-red-700 hover:underline bg-red-50 p-2 sm:p-3 rounded-lg border border-red-200"
                      >
                        📹 Video Evidence {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
              <div>
                <span className="text-gray-500">Source:</span>
                <span className="ml-2 font-medium text-gray-900">{caseData.source}</span>
              </div>
              {caseData.reportedBy && (
                <div>
                  <span className="text-gray-500">Reported by:</span>
                  <span className="ml-2 font-medium text-gray-900">{caseData.reportedBy}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseModal;
