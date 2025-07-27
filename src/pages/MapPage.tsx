import { useState } from 'react';
import MapView from '@/components/MapView';
import CaseModal from '@/components/CaseModal';
import Header from '@/components/Header';
import SubmitCaseModal from '@/components/SubmitCaseModal';
import DataSidebar from '@/components/DataSidebar';
import { Case, FilterState } from '@/types';
import { useCases } from '@/hooks/useCases';
import { SidebarProvider, Sidebar, SidebarTrigger } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

const MapPage = () => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    counties: [],
    caseTypes: [],
    yearRange: [2020, 2024]
  });

  // Fetch cases from Supabase
  const { data: cases = [], isLoading, error } = useCases();

  const filteredCases = cases.filter(caseItem => {
    const matchesCounty = filters.counties.length === 0 || filters.counties.includes(caseItem.county);
    const matchesCaseType = filters.caseTypes.length === 0 || filters.caseTypes.includes(caseItem.type);
    const caseYear = new Date(caseItem.date).getFullYear();
    const matchesYear = caseYear >= filters.yearRange[0] && caseYear <= filters.yearRange[1];

    return matchesCounty && matchesCaseType && matchesYear;
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-400" />
          <p className="text-white">Loading cases...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          <p className="text-red-400 text-lg">Error loading cases</p>
          <p className="text-gray-400">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 overflow-hidden flex flex-col">
        <Header 
          onOpenFilters={() => {}} // Not needed with sidebar
          onSubmitCase={() => setIsSubmitModalOpen(true)}
          caseCount={filteredCases.length}
        />
        <div className="flex flex-1">
          <Sidebar>
            <DataSidebar
              selectedCase={selectedCase}
              filters={filters}
              onFiltersChange={setFilters}
              filteredCasesCount={filteredCases.length}
            />
          </Sidebar>
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
    </SidebarProvider>
  );
};

export default MapPage;
