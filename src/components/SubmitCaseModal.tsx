
import { useState } from 'react';
import { X, Upload, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { SubmitCaseData } from '@/types';
import { useSubmitCase, useCounties } from '@/hooks/useCases';

// Case types for the form
const caseTypes = [
  { value: 'death', label: 'Death' },
  { value: 'assault', label: 'Physical Assault' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'unlawful_arrest', label: 'Unlawful Arrest' },
  { value: 'other', label: 'Other' }
];

interface SubmitCaseModalProps {
  onClose: () => void;
}

const SubmitCaseModal = ({ onClose }: SubmitCaseModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<SubmitCaseData>>({
    videoLinks: []
  });
  const [newVideoLink, setNewVideoLink] = useState('');

  // Use hooks for API calls
  const submitCaseMutation = useSubmitCase();
  const { data: counties = [], isLoading: countiesLoading } = useCounties();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.victimName || !formData.date || !formData.location || !formData.county ||
        !formData.type || !formData.description || !formData.reporterName || !formData.reporterContact) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitCaseMutation.mutateAsync(formData as SubmitCaseData);
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
                  <Label htmlFor="date">Date of Incident *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Specific location (e.g., Kibera, Nairobi)"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="county">County *</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, county: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {countiesLoading ? (
                        <SelectItem value="loading" disabled>Loading counties...</SelectItem>
                      ) : (
                        counties.map((county) => (
                          <SelectItem key={county} value={county}>
                            {county}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
    </div>
  );
};

export default SubmitCaseModal;
