
import { useEffect, useRef } from 'react';
import { Case } from '@/types';

interface MapViewProps {
  cases: Case[];
  onCaseSelect: (caseItem: Case) => void;
}

const MapView = ({ cases, onCaseSelect }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // For now, we'll create a simple visual representation
    // In a real implementation, you would integrate with Leaflet or Mapbox here
    console.log('Map would be initialized here with cases:', cases);
  }, [cases]);

  return (
    <div className="absolute inset-0 pt-16 sm:pt-20">
      <div 
        ref={mapRef}
        className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
      >
        {/* Simulated Kenya map background */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 400 300" className="w-full h-full">
            <path
              d="M50 150 C80 120, 120 130, 150 140 L200 135 C240 140, 280 160, 320 180 L350 200 L340 240 L300 250 L250 245 L200 240 L150 235 L100 225 L70 200 Z"
              fill="currentColor"
              className="text-muted-foreground"
            />
          </svg>
        </div>

        {/* Case pins */}
        {cases.map((caseItem, index) => (
          <div
            key={caseItem.id}
            className="absolute case-pin animate-fade-in cursor-pointer"
            style={{
              left: `${20 + (index * 60) % 300}px`,
              top: `${100 + (index * 40) % 150}px`,
              animationDelay: `${index * 100}ms`
            }}
            onClick={() => onCaseSelect(caseItem)}
            title={`${caseItem.victimName} - ${caseItem.location}`}
          />
        ))}

        {/* Map overlay with instructions */}
        {cases.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 bg-card/80 backdrop-blur-sm rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-2">No cases match your filters</h3>
              <p className="text-muted-foreground">Try adjusting your filter criteria</p>
            </div>
          </div>
        )}

        {cases.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80">
            <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Click on red pins to view case details
              </p>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>Police brutality case</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
