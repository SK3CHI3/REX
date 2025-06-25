
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
    <div className="absolute inset-0 pt-14 sm:pt-16 lg:pt-20">
      <MapContainer
        center={kenyaCenter}
        zoom={6}
        className="w-full h-full z-10"
        zoomControl={true}
        preferCanvas={true}
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
            <Popup 
              className="custom-popup"
              closeButton={true}
              autoClose={false}
              closeOnEscapeKey={true}
            >
              <div className="min-w-[250px] max-w-[300px] p-2">
                <h3 className="font-semibold text-base mb-2 text-gray-900">{caseItem.victimName}</h3>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <p className="font-medium text-red-600">{getTypeLabel(caseItem.type)}</p>
                  <p>{caseItem.location}, {caseItem.county}</p>
                  <p>{new Date(caseItem.date).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onCaseSelect(caseItem);
                  }}
                  className="w-full text-sm bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                >
                  View Full Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Empty state overlay */}
      {cases.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-center p-6 mx-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 max-w-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">No cases found</h3>
            <p className="text-gray-600 text-sm">Try adjusting your filter criteria to see more cases</p>
          </div>
        </div>
      )}

      {/* Map info panel - mobile optimized */}
      {cases.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 pointer-events-none z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Cases on Map</h4>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {cases.length}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Tap on red markers to view case details
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-red-600 rounded-full flex-shrink-0"></div>
              <span>Police brutality incident</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile attribution */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded pointer-events-none z-20">
        © OpenStreetMap
      </div>
    </div>
  );
};

export default MapView;
