import { useState } from 'react';
import MapView from '@/components/MapView';
import CaseModal from '@/components/CaseModal';
import FilterSidebar from '@/components/FilterSidebar';
import Header from '@/components/Header';
import SubmitCaseModal from '@/components/SubmitCaseModal';
import { Case, FilterState } from '@/types';
import { useCases } from '@/hooks/useCases';
import { normalizeCountyName } from '@/utils/countyNormalization';
import { SidebarProvider, Sidebar, SidebarTrigger } from '@/components/ui/sidebar';

const Index = () => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    counties: [],
    caseTypes: [],
    yearRange: [2020, 2024]
  });

  // Fetch real cases from Supabase
  const { data: cases, isLoading, error } = useCases();

  // Filter cases based on current filters with normalized county names
  const filteredCases = (cases || []).filter(caseItem => {
    const normalizedCounty = normalizeCountyName(caseItem.county);
    const matchesCounty = filters.counties.length === 0 || filters.counties.includes(normalizedCounty);
    const matchesCaseType = filters.caseTypes.length === 0 || filters.caseTypes.includes(caseItem.type);

    // Use the correct field name 'date' instead of 'incident_date'
    const caseYear = caseItem.date ? new Date(caseItem.date).getFullYear() : 0;
    const matchesYear = caseYear >= filters.yearRange[0] && caseYear <= filters.yearRange[1];

    return matchesCounty && matchesCaseType && matchesYear;
  });

  const closeFilter = () => {
    setIsFilterOpen(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cases...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Failed to load cases</h2>
          <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {/* Mobile Hamburger Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex">
        <Sidebar>
          <FilterSidebar
            isOpen={isFilterOpen}
            onClose={closeFilter}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </Sidebar>
        <div className="relative h-screen w-full bg-background overflow-hidden">
          <Header 
            onOpenFilters={() => setIsFilterOpen(true)}
            onSubmitCase={() => setIsSubmitModalOpen(true)}
            caseCount={filteredCases.length}
          />
          
          <MapView 
            cases={filteredCases}
            onCaseSelect={setSelectedCase}
          />

          {selectedCase && (
            <CaseModal
              case={selectedCase}
              onClose={() => setSelectedCase(null)}
            />
          )}

          {isSubmitModalOpen && (
            <SubmitCaseModal
              onClose={() => setIsSubmitModalOpen(false)}
            />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
