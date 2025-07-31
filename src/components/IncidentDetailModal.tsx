import React from 'react';
import { Case } from '@/types';
import { X, MapPin, Calendar, AlertTriangle, User, FileText, Shield, ExternalLink, Clock, CheckCircle2, Phone, Users, Scale, Heart, Camera, Video, Eye, UserCheck, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface IncidentDetailModalProps {
  isOpen: boolean;
  incident: Case | null;
  onClose: () => void;
}

const IncidentDetailModal = ({ isOpen, incident: caseItem, onClose }: IncidentDetailModalProps) => {
  if (!isOpen || !caseItem) return null;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    // Handle time format (HH:MM)
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold">Police Brutality Incident Report</h2>
                <Badge className={`${getStatusColor(caseItem.status)} border-0`}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center space-x-6 text-red-100">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium">{caseItem.victimName}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{caseItem.location}, {caseItem.county}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(caseItem.date)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            {/* Case Type and Justice Status */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge className={`${getTypeColor(caseItem.type)} border text-sm px-3 py-1`}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                {getTypeLabel(caseItem.type)}
              </Badge>
              {caseItem.justiceServed !== undefined && (
                <Badge className={caseItem.justiceServed ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                  {caseItem.justiceServed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Justice Served
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Justice Pending
                    </>
                  )}
                </Badge>
              )}
              {caseItem.confidence_score && (
                <Badge variant="outline" className="text-blue-700 border-blue-200">
                  <Shield className="w-3 h-3 mr-1" />
                  {caseItem.confidence_score}% Confidence
                </Badge>
              )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Victim & Incident Details */}
              <div className="lg:col-span-2 space-y-6">

                {/* Victim Information */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Victim Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-lg font-semibold text-gray-900">{caseItem.victimName}</p>
                    </div>
                    {caseItem.age && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Age</label>
                        <p className="text-lg font-semibold text-gray-900">{caseItem.age} years old</p>
                      </div>
                    )}

                  </div>
                </div>

                {/* Incident Details */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Incident Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Date</label>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        {formatDate(caseItem.date)}
                      </p>
                    </div>
                    {caseItem.time && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Time</label>
                        <p className="text-gray-900 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-blue-600" />
                          {formatTime(caseItem.time)}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-green-600" />
                        {caseItem.location}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">County</label>
                      <p className="text-gray-900">{caseItem.county}</p>
                    </div>

                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-2 block">Incident Description</label>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">{caseItem.description}</p>
                    </div>
                  </div>
                </div>

                {/* Officers Involved */}
                {caseItem.officersInvolved && caseItem.officersInvolved.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <UserCheck className="w-5 h-5 mr-2 text-red-600" />
                      Officers Involved
                    </h3>
                    <div className="space-y-4">
                      {caseItem.officersInvolved.map((officer, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-red-100 flex items-start space-x-4">
                          {officer.photo_url ? (
                            <img
                              src={officer.photo_url}
                              alt={officer.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-red-200"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-200">
                              <UserCheck className="w-8 h-8 text-red-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{officer.name}</h4>
                            {officer.rank && (
                              <p className="text-sm text-gray-600">Rank: {officer.rank}</p>
                            )}
                            {officer.badge_number && (
                              <p className="text-sm text-gray-600">Badge: {officer.badge_number}</p>
                            )}
                            {officer.station && (
                              <p className="text-sm text-gray-600">Station: {officer.station}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Witnesses */}
                {caseItem.witnesses && caseItem.witnesses.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      Witnesses
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {caseItem.witnesses.map((witness, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                          <p className="font-medium text-gray-900">{witness}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Evidence */}
                {((caseItem.photos && caseItem.photos.length > 0) || (caseItem.videoLinks && caseItem.videoLinks.length > 0)) && (
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Camera className="w-5 h-5 mr-2 text-purple-600" />
                      Media Evidence
                    </h3>

                    {/* Photos */}
                    {caseItem.photos && caseItem.photos.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <Camera className="w-4 h-4 mr-2" />
                          Photos ({caseItem.photos.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {caseItem.photos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={photo}
                                alt={`Evidence photo ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-purple-200 group-hover:opacity-75 transition-opacity cursor-pointer"
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-6 h-6 text-white bg-black/50 rounded-full p-1" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos */}
                    {caseItem.videoLinks && caseItem.videoLinks.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <Video className="w-4 h-4 mr-2" />
                          Videos ({caseItem.videoLinks.length})
                        </h4>
                        <div className="space-y-2">
                          {caseItem.videoLinks.map((video, index) => (
                            <a
                              key={index}
                              href={video}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 transition-colors"
                            >
                              <Video className="w-5 h-5 mr-3 text-purple-600" />
                              <span className="text-gray-900">Video Evidence {index + 1}</span>
                              <ExternalLink className="w-4 h-4 ml-auto text-gray-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Case Management & Sources */}
              <div className="space-y-6">

                {/* Case Status */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-indigo-600" />
                    Case Status
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Status</label>
                      <Badge className={`${getStatusColor(caseItem.status)} mt-1 block w-fit`}>
                        {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                      </Badge>
                    </div>

                    {caseItem.justiceServed !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Justice Status</label>
                        <div className="mt-1">
                          <Badge className={caseItem.justiceServed ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                            {caseItem.justiceServed ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Justice Served
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Justice Pending
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {caseItem.confidence_score && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Confidence Score</label>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-blue-700 border-blue-200">
                            <Shield className="w-3 h-3 mr-1" />
                            {caseItem.confidence_score}% Confidence
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Source Information */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Source Information
                  </h3>
                  <div className="space-y-3">
                    {caseItem.source && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Primary Source</label>
                        <p className="text-gray-900">{caseItem.source}</p>
                      </div>
                    )}

                    {caseItem.reportedBy && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Reported By</label>
                        <p className="text-gray-900">{caseItem.reportedBy}</p>
                      </div>
                    )}

                    {caseItem.created_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Report Date</label>
                        <p className="text-gray-900">{formatDate(caseItem.created_at)}</p>
                      </div>
                    )}

                    {caseItem.updated_at && caseItem.updated_at !== caseItem.created_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Last Updated</label>
                        <p className="text-gray-900">{formatDate(caseItem.updated_at)}</p>
                      </div>
                    )}

                    {caseItem.auto_approved && (
                      <div>
                        <Badge variant="outline" className="text-blue-700 border-blue-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Auto-Approved
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* External Links */}
                {caseItem.scraped_from_url && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <ExternalLink className="w-5 h-5 mr-2 text-blue-600" />
                      External Sources
                    </h3>
                    <a
                      href={caseItem.scraped_from_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors group"
                    >
                      <ExternalLink className="w-5 h-5 mr-3 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-blue-600">View Original Article</p>
                        <p className="text-sm text-gray-500">Source documentation</p>
                      </div>
                    </a>
                  </div>
                )}

                {/* Case ID */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    Case Reference
                  </h3>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Case ID</label>
                    <p className="text-gray-900 font-mono text-sm bg-gray-100 px-3 py-2 rounded mt-1 break-all">
                      {caseItem.id}
                    </p>
                  </div>
                </div>
              </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              Case ID: {caseItem.id.slice(0, 8)}...
            </span>
          </div>
          <div className="flex space-x-3">
            {caseItem.scraped_from_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(caseItem.scraped_from_url, '_blank')}
                className="flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Source
              </Button>
            )}
            <Button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailModal;
