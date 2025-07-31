import React from 'react';
import { Case } from '@/types';
import { MapPin, Calendar, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IncidentHoverCardProps {
  case: Case;
  position: { x: number; y: number };
  onViewDetails: () => void;
  onClose: () => void;
}

const IncidentHoverCard = ({ case: caseItem, position, onViewDetails, onClose }: IncidentHoverCardProps) => {
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

  const getTypeColor = (type: Case['type']) => {
    switch (type) {
      case 'death': return 'bg-red-100 text-red-800 border-red-200';
      case 'assault': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'harassment': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unlawful_arrest': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="fixed z-50 pointer-events-auto"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80 max-w-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {caseItem.victimName}
            </h3>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              {caseItem.location}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Case Type Badge */}
        <div className="mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(caseItem.type)}`}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {getTypeLabel(caseItem.type)}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center mb-3 text-xs text-gray-600">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(caseItem.date)}
        </div>

        {/* Description Preview */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {caseItem.description}
        </p>

        {/* Action Button */}
        <Button
          onClick={onViewDetails}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          See Details
        </Button>

        {/* Arrow pointing to marker */}
        <div className="absolute bottom-0 left-6 transform translate-y-full">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
        </div>
      </div>
    </div>
  );
};

export default IncidentHoverCard;
