
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
      case 'verified': return 'bg-green-600';
      case 'investigating': return 'bg-yellow-600';
      case 'dismissed': return 'bg-gray-600';
      default: return 'bg-gray-600';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto slide-up">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{caseData.victimName}</h2>
            {caseData.age && (
              <span className="text-sm text-muted-foreground">Age {caseData.age}</span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(caseData.status)}>
              {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              {getTypeLabel(caseData.type)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{new Date(caseData.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{caseData.location}, {caseData.county}</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Incident Description</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {caseData.description}
            </p>
          </div>

          {caseData.photos && caseData.photos.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Evidence Photos</h3>
              <div className="grid grid-cols-2 gap-2">
                {caseData.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                ))}
              </div>
            </div>
          )}

          {caseData.videoLinks && caseData.videoLinks.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Video Evidence</h3>
              <div className="space-y-2">
                {caseData.videoLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline"
                  >
                    Video Evidence {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Source:</span>
              <span>{caseData.source}</span>
            </div>
            {caseData.reportedBy && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reported by:</span>
                <span>{caseData.reportedBy}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseModal;
