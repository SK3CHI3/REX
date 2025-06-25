
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Case } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom red marker for police brutality cases
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  cases: Case[];
  onCaseSelect: (caseItem: Case) => void;
}

const MapView = ({ cases, onCaseSelect }: MapViewProps) => {
  // Kenya's center coordinates
  const kenyaCenter: [number, number] = [-1.2921, 36.8219];

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
    <div className="absolute inset-0 pt-16 sm:pt-20">
      <MapContainer
        center={kenyaCenter}
        zoom={6}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {cases.map((caseItem) => (
          <Marker
            key={caseItem.id}
            position={caseItem.coordinates}
            icon={redIcon}
            eventHandlers={{
              click: () => onCaseSelect(caseItem)
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-sm mb-1">{caseItem.victimName}</h3>
                <p className="text-xs text-gray-600 mb-1">{getTypeLabel(caseItem.type)}</p>
                <p className="text-xs text-gray-600 mb-1">{caseItem.location}, {caseItem.county}</p>
                <p className="text-xs text-gray-600 mb-2">{new Date(caseItem.date).toLocaleDateString()}</p>
                <button 
                  onClick={() => onCaseSelect(caseItem)}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map overlay with instructions */}
      {cases.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-2">No cases match your filters</h3>
            <p className="text-muted-foreground">Try adjusting your filter criteria</p>
          </div>
        </div>
      )}

      {cases.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 pointer-events-none">
          <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground mb-2">
              Click on red pins to view case details
            </p>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span>Police brutality case ({cases.length})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
