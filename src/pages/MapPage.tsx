import { useState } from 'react';
import MapView from '@/components/MapView';
import CaseModal from '@/components/CaseModal';
import Header from '@/components/Header';
import SubmitCaseModal from '@/components/SubmitCaseModal';
import DataSidebar from '@/components/DataSidebar';
import { Case, FilterState } from '@/types';
import { mockCases } from '@/data/mockData';

const MapPage = () => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    counties: [],
    caseTypes: [],
    yearRange: [2020, 2024]
  });

  const filteredCases = mockCases.filter(caseItem => {
    const matchesCounty = filters.counties.length === 0 || filters.counties.includes(caseItem.county);
    const matchesCaseType = filters.caseTypes.length === 0 || filters.caseTypes.includes(caseItem.type);
    const caseYear = new Date(caseItem.date).getFullYear();
    const matchesYear = caseYear >= filters.yearRange[0] && caseYear <= filters.yearRange[1];
    
    return matchesCounty && matchesCaseType && matchesYear;
  });

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 overflow-hidden flex flex-col">
      <Header 
        onOpenFilters={() => {}} // Not needed with sidebar
        onSubmitCase={() => setIsSubmitModalOpen(true)}
        caseCount={filteredCases.length}
      />
      
      <div className="flex flex-1">
        <DataSidebar
          selectedCase={selectedCase}
          filters={filters}
          onFiltersChange={setFilters}
          filteredCasesCount={filteredCases.length}
        />
        
        <div className="flex-1 relative">
          <MapView 
            cases={filteredCases}
            onCaseSelect={setSelectedCase}
          />
        </div>
      </div>

      {isSubmitModalOpen && (
        <SubmitCaseModal
          onClose={() => setIsSubmitModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MapPage;
