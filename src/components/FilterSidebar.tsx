
import { X, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { FilterState } from '@/types';
import { kenyanCounties, caseTypes } from '@/data/mockData';
import { useState } from 'react';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const FilterSidebar = ({ isOpen, onClose, filters, onFiltersChange }: FilterSidebarProps) => {
  const [countySearch, setCountySearch] = useState('');

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
    setCountySearch('');
  };

  const filteredCounties = kenyanCounties.filter(county =>
    county.toLowerCase().includes(countySearch.toLowerCase())
  );

  const activeFiltersCount = filters.counties.length + filters.caseTypes.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white border-l border-gray-200 shadow-xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {activeFiltersCount > 0 && (
                <p className="text-xs text-red-600">{activeFiltersCount} active</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-6">
            
            {/* Clear filters */}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                disabled={activeFiltersCount === 0}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>

            {/* Year Range */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 text-sm">Year Range</h3>
              <div className="px-2">
                <Slider
                  value={filters.yearRange}
                  onValueChange={handleYearRangeChange}
                  min={2015}
                  max={2024}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{filters.yearRange[0]}</span>
                  <span>{filters.yearRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Case Types */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 text-sm">Case Types</h3>
              <div className="space-y-2">
                {caseTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={type.value}
                      checked={filters.caseTypes.includes(type.value)}
                      onCheckedChange={(checked) => 
                        handleCaseTypeChange(type.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={type.value}
                      className="text-sm cursor-pointer flex-1 font-medium text-gray-700"
                    >
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Counties */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 text-sm">Counties</h3>
              
              {/* Search counties */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search counties..."
                  value={countySearch}
                  onChange={(e) => setCountySearch(e.target.value)}
                  className="pl-9 text-sm h-9"
                />
              </div>

              {/* County list */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredCounties.map((county) => (
                  <div key={county} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={county}
                      checked={filters.counties.includes(county)}
                      onCheckedChange={(checked) => 
                        handleCountyChange(county, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={county}
                      className="text-sm cursor-pointer flex-1 text-gray-700"
                    >
                      {county}
                    </label>
                  </div>
                ))}
              </div>

              {filteredCounties.length === 0 && countySearch && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No counties found matching "{countySearch}"
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default FilterSidebar;
