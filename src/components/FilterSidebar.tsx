
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterState } from '@/types';
import { kenyanCounties, caseTypes } from '@/data/mockData';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const FilterSidebar = ({ isOpen, onClose, filters, onFiltersChange }: FilterSidebarProps) => {
  const handleCountyChange = (county: string, checked: boolean) => {
    const newCounties = checked
      ? [...filters.counties, county]
      : filters.counties.filter(c => c !== county);
    
    onFiltersChange({ ...filters, counties: newCounties });
  };

  const handleCaseTypeChange = (caseType: string, checked: boolean) => {
    const newCaseTypes = checked
      ? [...filters.caseTypes, caseType]
      : filters.caseTypes.filter(t => t !== caseType);
    
    onFiltersChange({ ...filters, caseTypes: newCaseTypes });
  };

  const handleYearRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, yearRange: [value[0], value[1]] });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      counties: [],
      caseTypes: [],
      yearRange: [2020, 2024]
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-card border-l border-border slide-in-right">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-6">
            
            {/* Clear filters */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Active filters: {filters.counties.length + filters.caseTypes.length}
              </span>
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>

            {/* Year Range */}
            <div>
              <h3 className="font-medium mb-3">Year Range</h3>
              <div className="px-2">
                <Slider
                  value={filters.yearRange}
                  onValueChange={handleYearRangeChange}
                  min={2015}
                  max={2024}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{filters.yearRange[0]}</span>
                  <span>{filters.yearRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Case Types */}
            <div>
              <h3 className="font-medium mb-3">Case Types</h3>
              <div className="space-y-3">
                {caseTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      checked={filters.caseTypes.includes(type.value)}
                      onCheckedChange={(checked) => 
                        handleCaseTypeChange(type.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={type.value}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Counties */}
            <div>
              <h3 className="font-medium mb-3">Counties</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {kenyanCounties.map((county) => (
                  <div key={county} className="flex items-center space-x-2">
                    <Checkbox
                      id={county}
                      checked={filters.counties.includes(county)}
                      onCheckedChange={(checked) => 
                        handleCountyChange(county, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={county}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {county}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default FilterSidebar;
