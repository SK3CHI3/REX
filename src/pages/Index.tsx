import { useState } from 'react';
import MapView from '@/components/MapView';
import CaseModal from '@/components/CaseModal';
import FilterSidebar from '@/components/FilterSidebar';
import Header from '@/components/Header';
import SubmitCaseModal from '@/components/SubmitCaseModal';
import { Case, FilterState } from '@/types';
import { mockCases } from '@/data/mockData';
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

  const filteredCases = mockCases.filter(caseItem => {
    const matchesCounty = filters.counties.length === 0 || filters.counties.includes(caseItem.county);
    const matchesCaseType = filters.caseTypes.length === 0 || filters.caseTypes.includes(caseItem.type);
    const caseYear = new Date(caseItem.date).getFullYear();
    const matchesYear = caseYear >= filters.yearRange[0] && caseYear <= filters.yearRange[1];
    
    return matchesCounty && matchesCaseType && matchesYear;
  });

  const closeFilter = () => {
    setIsFilterOpen(false);
  };

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
