import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { X, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom red marker for location selection
const redMarker = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 19.404 12.5 41 12.5 41S25 19.404 25 12.5C25 5.596 19.404 0 12.5 0ZM12.5 17C10.015 17 8 14.985 8 12.5C8 10.015 10.015 8 12.5 8C14.985 8 17 10.015 17 12.5C17 14.985 14.985 17 12.5 17Z" fill="%23EF4444"/></svg>',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: undefined,
});

interface LocationData {
  latitude: number;
  longitude: number;
  location: string;
  county: string;
}

interface LocationPickerModalProps {
  onClose: () => void;
  onLocationSelect: (locationData: LocationData) => void;
  initialLocation?: LocationData;
}

// Component to handle map clicks
const MapClickHandler = ({ onLocationClick }: { onLocationClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocationPickerModal = ({ onClose, onLocationSelect, initialLocation }: LocationPickerModalProps) => {
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null
  );
  const [locationName, setLocationName] = useState(initialLocation?.location || '');
  const [countyName, setCountyName] = useState(initialLocation?.county || '');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Kenya's center coordinates (Nairobi area)
  const kenyaCenter: [number, number] = [-1.2921, 36.8219];
  
  // Kenya's bounding box
  const kenyaBounds: [[number, number], [number, number]] = [
    [-4.678, 33.909], // Southwest
    [5.019, 41.899]   // Northeast
  ];

  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    setIsGeocoding(true);
    
    try {
      // Use Nominatim for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        // Extract location and county from the response
        const address = data.address;
        const location = address.suburb || address.neighbourhood || address.village || address.town || address.city || 'Unknown Location';
        const county = address.state || address.county || 'Unknown County';
        
        setLocationName(location);
        setCountyName(county);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Keep the manual input fields available if geocoding fails
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedPosition || !locationName.trim() || !countyName.trim()) {
      return;
    }

    onLocationSelect({
      latitude: selectedPosition[0],
      longitude: selectedPosition[1],
      location: locationName.trim(),
      county: countyName.trim(),
    });
  };

  const isValidSelection = selectedPosition && locationName.trim() && countyName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span>Select Incident Location</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Click on the map to select the exact location of the incident. You can adjust the location name and county if needed.
            </p>
          </CardHeader>
        
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[500px]">
            {/* Map */}
            <div className="lg:col-span-2 relative">
              <MapContainer
                center={selectedPosition || kenyaCenter}
                zoom={selectedPosition ? 12 : 7}
                className="w-full h-full"
                bounds={selectedPosition ? undefined : kenyaBounds}
                boundsOptions={selectedPosition ? undefined : { padding: [20, 20] }}
                maxBounds={kenyaBounds}
                maxBoundsViscosity={1.0}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapClickHandler onLocationClick={handleMapClick} />
                
                {selectedPosition && (
                  <Marker position={selectedPosition} icon={redMarker} />
                )}
              </MapContainer>
              
              {/* Instructions overlay */}
              {!selectedPosition && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200 max-w-sm text-center">
                    <MapPin className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Click anywhere on the map</p>
                    <p className="text-xs text-gray-600">to select the incident location</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Location Details */}
            <div className="p-6 border-l border-border bg-gray-50/50">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
                    Location Details
                  </h3>

                  {selectedPosition && (
                    <div className="text-xs text-gray-500 mb-4 p-2 bg-white rounded border">
                      <strong>Coordinates:</strong><br />
                      Lat: {selectedPosition[0].toFixed(6)}<br />
                      Lng: {selectedPosition[1].toFixed(6)}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="locationName">Location Name *</Label>
                    <Input
                      id="locationName"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g., Kibera, CBD, etc."
                      disabled={isGeocoding}
                    />
                    {isGeocoding && (
                      <p className="text-xs text-gray-500 mt-1">Looking up location...</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="countyName">County *</Label>
                    <Input
                      id="countyName"
                      value={countyName}
                      onChange={(e) => setCountyName(e.target.value)}
                      placeholder="e.g., Nairobi, Mombasa, etc."
                      disabled={isGeocoding}
                    />
                  </div>
                </div>

                {!selectedPosition && (
                  <div className="text-xs text-gray-500 text-center pt-4">
                    Please select a location on the map first
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        </Card>

        {/* Action Buttons - Outside the card to prevent map interaction conflicts */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 px-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValidSelection || isGeocoding}
            className="flex-1 order-1 sm:order-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
