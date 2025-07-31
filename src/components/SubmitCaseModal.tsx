
import { useState } from 'react';
import { X, Upload, Plus, Trash2, Loader2, MapPin, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SubmitCaseData } from '@/types';
import { useSubmitCase } from '@/hooks/useCases';
import LocationPickerModal from '@/components/LocationPickerModal';

// Case types for the form
const caseTypes = [
  { value: 'death', label: 'Death' },
  { value: 'assault', label: 'Physical Assault' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'unlawful_arrest', label: 'Unlawful Arrest' },
  { value: 'other', label: 'Other' }
];

interface LocationData {
  latitude: number;
  longitude: number;
  location: string;
  county: string;
}

interface SubmitCaseModalProps {
  onClose: () => void;
}

const SubmitCaseModal = ({ onClose }: SubmitCaseModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<SubmitCaseData>>({
    videoLinks: []
  });
  const [newVideoLink, setNewVideoLink] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Use hooks for API calls
  const submitCaseMutation = useSubmitCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.victimName || !formData.date || !selectedLocation ||
        !formData.type || !formData.description || !formData.reporterName || !formData.reporterContact) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields including location.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Combine form data with location data
      const submitData: SubmitCaseData = {
        ...formData as SubmitCaseData,
        location: selectedLocation.location,
        county: selectedLocation.county,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };

      await submitCaseMutation.mutateAsync(submitData);
      onClose();
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Error submitting case:', error);
    }
  };

  const addVideoLink = () => {
    if (newVideoLink.trim()) {
      setFormData({
        ...formData,
        videoLinks: [...(formData.videoLinks || []), newVideoLink.trim()]
      });
      setNewVideoLink('');
    }
  };

  const removeVideoLink = (index: number) => {
    const updatedLinks = (formData.videoLinks || []).filter((_, i) => i !== index);
    setFormData({ ...formData, videoLinks: updatedLinks });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setFormData({ ...formData, photos: fileArray });
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = (formData.photos || []).filter((_, i) => i !== index);
    setFormData({ ...formData, photos: updatedPhotos });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto slide-up">
        <CardHeader className="sticky top-0 bg-card border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Submit New Case</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            All submissions are reviewed before being published. Please provide accurate information.
          </p>
        </CardHeader>

        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Victim Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                Victim Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="victimName">Full Name *</Label>
                  <Input
                    id="victimName"
                    value={formData.victimName || ''}
                    onChange={(e) => setFormData({ ...formData, victimName: e.target.value })}
                    placeholder="Enter victim's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                    placeholder="Age"
                  />
                </div>
              </div>
            </div>

            {/* Incident Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                Incident Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Date of Incident *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(new Date(formData.date), "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date ? new Date(formData.date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFormData({ ...formData, date: format(date, "yyyy-MM-dd") });
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="time">Time of Incident</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      value={formData.time || ''}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      placeholder="HH:MM"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Case Type *</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case type" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Incident Location *</Label>
                <div className="mt-2">
                  {selectedLocation ? (
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-900">{selectedLocation.location}</p>
                            <p className="text-sm text-green-700">{selectedLocation.county} County</p>
                            <p className="text-xs text-green-600 mt-1">
                              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsLocationPickerOpen(true)}
                          className="text-green-700 border-green-300 hover:bg-green-100"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsLocationPickerOpen(true)}
                      className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 transition-colors"
                    >
                      <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="text-gray-700">Click to select location on map</span>
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a detailed description of what happened..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="justiceServed">Justice Status</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, justiceServed: value === 'true' ? true : value === 'false' ? false : undefined })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Has justice been served?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Justice Served</SelectItem>
                    <SelectItem value="false">Justice Not Served</SelectItem>
                    <SelectItem value="pending">Status Unknown/Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Officers and Witnesses */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                Officers & Witnesses (Optional)
              </h3>

              <div>
                <Label>Police Officers Involved</Label>
                <div className="space-y-2">
                  {formData.officerNames?.map((officer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input value={officer} readOnly className="flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOfficers = [...(formData.officerNames || [])];
                          newOfficers.splice(index, 1);
                          setFormData({ ...formData, officerNames: newOfficers });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Input
                      value={formData.newOfficerName || ''}
                      onChange={(e) => setFormData({ ...formData, newOfficerName: e.target.value })}
                      placeholder="Enter officer name"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (formData.newOfficerName?.trim()) {
                          setFormData({
                            ...formData,
                            officerNames: [...(formData.officerNames || []), formData.newOfficerName.trim()],
                            newOfficerName: ''
                          });
                        }
                      }}
                      disabled={!formData.newOfficerName?.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Witnesses</Label>
                <div className="space-y-2">
                  {formData.witnesses?.map((witness, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input value={witness} readOnly className="flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newWitnesses = [...(formData.witnesses || [])];
                          newWitnesses.splice(index, 1);
                          setFormData({ ...formData, witnesses: newWitnesses });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Input
                      value={formData.newWitnessName || ''}
                      onChange={(e) => setFormData({ ...formData, newWitnessName: e.target.value })}
                      placeholder="Enter witness name"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (formData.newWitnessName?.trim()) {
                          setFormData({
                            ...formData,
                            witnesses: [...(formData.witnesses || []), formData.newWitnessName.trim()],
                            newWitnessName: ''
                          });
                        }
                      }}
                      disabled={!formData.newWitnessName?.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="justiceServed">Justice Status</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, justiceServed: value === 'true' ? true : value === 'false' ? false : undefined })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Has justice been served?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Justice Served</SelectItem>
                    <SelectItem value="false">Justice Not Served</SelectItem>
                    <SelectItem value="pending">Status Unknown/Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Officers and Witnesses */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                Officers & Witnesses
              </h3>

              <div>
                <Label>Police Officers Involved</Label>
                <div className="space-y-2">
                  {formData.officerNames?.map((officer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input value={officer} readOnly className="flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOfficers = [...(formData.officerNames || [])];
                          newOfficers.splice(index, 1);
                          setFormData({ ...formData, officerNames: newOfficers });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Input
                      value={formData.newOfficerName || ''}
                      onChange={(e) => setFormData({ ...formData, newOfficerName: e.target.value })}
                      placeholder="Enter officer name (rank, name, badge number)"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (formData.newOfficerName?.trim()) {
                          setFormData({
                            ...formData,
                            officerNames: [...(formData.officerNames || []), formData.newOfficerName.trim()],
                            newOfficerName: ''
                          });
                        }
                      }}
                      disabled={!formData.newOfficerName?.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>Witnesses</Label>
                <div className="space-y-2">
                  {formData.witnesses?.map((witness, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input value={witness} readOnly className="flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newWitnesses = [...(formData.witnesses || [])];
                          newWitnesses.splice(index, 1);
                          setFormData({ ...formData, witnesses: newWitnesses });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Input
                      value={formData.newWitnessName || ''}
                      onChange={(e) => setFormData({ ...formData, newWitnessName: e.target.value })}
                      placeholder="Enter witness name"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (formData.newWitnessName?.trim()) {
                          setFormData({
                            ...formData,
                            witnesses: [...(formData.witnesses || []), formData.newWitnessName.trim()],
                            newWitnessName: ''
                          });
                        }
                      }}
                      disabled={!formData.newWitnessName?.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                Evidence (Optional)
              </h3>
              
              <div>
                <Label htmlFor="photos">Photos</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload photos or drag and drop
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="photo-upload"
                    onChange={handlePhotoUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    Choose Files
                  </Button>
                </div>

                {/* Show selected photos */}
                {formData.photos && formData.photos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium">Selected Photos:</p>
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm truncate">{photo.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePhoto(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Video Links</Label>
                <div className="space-y-2">
                  {formData.videoLinks?.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input value={link} readOnly className="flex-1" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeVideoLink(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newVideoLink}
                      onChange={(e) => setNewVideoLink(e.target.value)}
                      placeholder="Enter video URL (YouTube, Twitter, etc.)"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVideoLink}
                      disabled={!newVideoLink.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reporter Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                Your Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reporterName">Your Name *</Label>
                  <Input
                    id="reporterName"
                    value={formData.reporterName || ''}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reporterContact">Contact (Phone/Email) *</Label>
                  <Input
                    id="reporterContact"
                    value={formData.reporterContact || ''}
                    onChange={(e) => setFormData({ ...formData, reporterContact: e.target.value })}
                    placeholder="Phone number or email"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={submitCaseMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={submitCaseMutation.isPending}>
                {submitCaseMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Case for Review'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Location Picker Modal */}
      {isLocationPickerOpen && (
        <LocationPickerModal
          onClose={() => setIsLocationPickerOpen(false)}
          onLocationSelect={(locationData) => {
            setSelectedLocation(locationData);
            setIsLocationPickerOpen(false);
          }}
          initialLocation={selectedLocation || undefined}
        />
      )}
    </div>
  );
};

export default SubmitCaseModal;
