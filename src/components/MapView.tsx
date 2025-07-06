import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { Case } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngBoundsExpression } from 'leaflet';

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
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28],
  shadowSize: [32, 32]
});

interface MapViewProps {
  cases: Case[];
  onCaseSelect: (caseItem: Case) => void;
}

const MapView = ({ cases, onCaseSelect }: MapViewProps) => {
  // Kenya's bounding box (approximate southwest and northeast corners)
  const kenyaBounds: LatLngBoundsExpression = [
    [ -4.678, 33.909 ], // Southwest (near Lunga Lunga, Kwale)
    [ 5.019, 41.899 ]   // Northeast (near Mandera)
  ];
  const mapRef = useRef(null);

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
      case 'death': return 'text-red-700 bg-red-50';
      case 'assault': return 'text-orange-700 bg-orange-50';
      case 'harassment': return 'text-yellow-700 bg-yellow-50';
      case 'unlawful_arrest': return 'text-purple-700 bg-purple-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="absolute inset-0">
      <MapContainer
        bounds={kenyaBounds}
        boundsOptions={{ padding: [20, 20] }}
        className="w-full h-full z-10"
        zoomControl={true}
        preferCanvas={true}
        ref={mapRef}
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
            <Tooltip
              sticky={false}
              direction="top"
              offset={[0, -10]}
              className="custom-tooltip"
            >
              <div className="text-xs font-medium">
                <div className="font-semibold text-gray-900">{caseItem.victimName}</div>
                <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getTypeColor(caseItem.type)}`}>
                  {getTypeLabel(caseItem.type)}
                </div>
              </div>
            </Tooltip>
            
            <Popup 
              className="custom-popup"
              closeButton={true}
              autoClose={false}
              closeOnEscapeKey={true}
            >
              <div className="min-w-[250px] max-w-[300px] p-2">
                <h3 className="font-semibold text-base mb-2 text-gray-900">{caseItem.victimName}</h3>
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(caseItem.type)}`}>
                    {getTypeLabel(caseItem.type)}
                  </div>
                  <p className="mt-2">{caseItem.location}, {caseItem.county}</p>
                  <p>{new Date(caseItem.date).toLocaleDateString()}</p>
                </div>
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

      {/* Compact legend - mobile optimized */}
      {cases.length > 0 && (
        <div className="absolute bottom-4 left-4 pointer-events-none z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-3 h-3 bg-red-600 rounded-full flex-shrink-0"></div>
              <span className="text-gray-700 font-medium">{cases.length} incidents</span>
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
