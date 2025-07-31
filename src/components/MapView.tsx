import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { Case } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngBoundsExpression } from 'leaflet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Small red person/user icon SVG for mobile
const personRedIconMobile = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="5" r="3" fill="%23EF4444"/><rect x="2" y="9" width="10" height="4" rx="2" fill="%23EF4444"/></svg>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -7],
  shadowUrl: undefined,
  shadowSize: undefined,
  shadowAnchor: undefined
});

// Larger red person/user icon SVG for desktop
const personRedIconDesktop = new L.Icon({
  iconUrl: 'data:image/svg+xml;utf8,<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="6" r="4" fill="%23EF4444"/><rect x="3" y="12" width="12" height="5" rx="2.5" fill="%23EF4444"/></svg>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -9],
  shadowUrl: undefined,
  shadowSize: undefined,
  shadowAnchor: undefined
});

interface MapViewProps {
  cases: Case[];
  onCaseHover?: (caseItem: Case, position: { x: number; y: number }) => void;
  onCaseLeave?: () => void;
  onCaseClick?: (caseItem: Case, position: { x: number; y: number }) => void;
  onCaseSelect?: (caseItem: Case) => void; // Keep for backward compatibility
  onViewDetails?: (caseItem: Case) => void;
}

const MapView = ({ cases, onCaseHover, onCaseLeave, onCaseClick, onCaseSelect, onViewDetails }: MapViewProps) => {
  // Kenya's center point (geographical center of Kenya)
  const kenyaCenter: [number, number] = [-0.0236, 37.9062];

  // Kenya's bounding box (properly fitted to Kenya borders)
  const kenyaBounds: LatLngBoundsExpression = [
    [ -4.7, 33.9 ], // Southwest (Lunga Lunga, Kwale)
    [ 5.0, 41.9 ]   // Northeast (Mandera)
  ];
  // Tighter bounds for mobile (zoom in more to Nairobi area)
  const kenyaMobileBounds: LatLngBoundsExpression = [
    [ -1.5, 36.6 ], // Southwest (just below Nairobi)
    [ 1.5, 38.2 ]   // Northeast (just above Nairobi, toward Meru)
  ];
  const isMobile = useIsMobile();
  const mapRef = useRef<any>(null);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [clickedPin, setClickedPin] = useState<string | null>(null);
  const { isMobile: sidebarIsMobile, setOpenMobile } = useSidebar();

  // Zoom to pin when clicked (not on hover)
  useEffect(() => {
    if (clickedPin && mapRef.current) {
      const map = mapRef.current;
      const pin = cases.find(c => c.id === clickedPin);
      if (pin) {
        map.flyTo(pin.coordinates, 15, { duration: 0.7 });
      }
    }
  }, [clickedPin, cases]);

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
        bounds={isMobile ? kenyaMobileBounds : kenyaBounds}
        boundsOptions={{ padding: isMobile ? [10, 10] : [50, 50] }}
        className="w-full h-full z-10"
        zoomControl={true}
        preferCanvas={true}
        ref={mapRef}
        minZoom={5}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {cases.map((caseItem) => (
          <Marker
            key={caseItem.id}
            position={caseItem.coordinates}
            icon={isMobile ? personRedIconMobile : personRedIconDesktop}
            eventHandlers={{
              mouseover: (e) => {
                if (!isMobile && !clickedPin) {
                  setSelectedPin(caseItem.id);
                  // Open popup on hover only if nothing is clicked
                  e.target.openPopup();
                }
              },
              mouseout: (e) => {
                if (!isMobile && !clickedPin) {
                  setSelectedPin(null);
                  // Close popup on mouse leave only if nothing is clicked
                  e.target.closePopup();
                }
              },
              click: (e) => {
                // Clear any previous selections
                setSelectedPin(null);

                // Set as clicked pin to keep popup open
                setClickedPin(caseItem.id);
                setSelectedPin(caseItem.id);
                e.target.openPopup();
              }
            }}
          >
            {/* Highlight effect for selected pin */}
            {selectedPin === caseItem.id && (
              <div className="leaflet-marker-selected" style={{ position: 'absolute', left: -10, top: -10, width: 34, height: 34, pointerEvents: 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid #EF4444', boxShadow: '0 0 8px 2px #EF4444', opacity: 0.5 }} />
              </div>
            )}
            <Popup
              className="custom-popup"
              closeButton={false}
              autoClose={true}
              closeOnEscapeKey={true}
              autoPan={false}
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

                {/* Show "See More Details" button when clicked or on mobile */}
                {(clickedPin === caseItem.id || isMobile) && (
                  <div className="mt-3 space-y-2">
                    <button
                      className="w-full bg-red-600 text-white rounded-lg py-2 font-semibold text-sm hover:bg-red-700 transition"
                      onClick={() => {
                        // Open detailed modal for both mobile and desktop
                        if (onViewDetails) {
                          onViewDetails(caseItem);
                        } else if (onCaseSelect) {
                          onCaseSelect(caseItem);
                        }
                      }}
                    >
                      See More Details
                    </button>

                    {/* Close button for clicked state */}
                    {clickedPin === caseItem.id && !isMobile && (
                      <button
                        className="w-full bg-gray-200 text-gray-700 rounded-lg py-1 text-xs hover:bg-gray-300 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClickedPin(null);
                          setSelectedPin(null);
                          // Close the popup by finding the marker
                          const popup = e.target.closest('.leaflet-popup');
                          if (popup && popup._source) {
                            popup._source.closePopup();
                          }
                        }}
                      >
                        Close
                      </button>
                    )}
                  </div>
                )}
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



      {/* Mobile attribution */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded pointer-events-none z-20">
        © OpenStreetMap
      </div>
    </div>
  );
};

export default MapView;
