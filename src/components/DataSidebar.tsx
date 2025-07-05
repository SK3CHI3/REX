
import { X, Filter, Search, Calendar, MapPin, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FilterState, Case } from '@/types';
import { kenyanCounties, caseTypes } from '@/data/mockData';
import { useState } from 'react';

interface DataSidebarProps {
  selectedCase: Case | null;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  filteredCasesCount: number;
}

const DataSidebar = ({ selectedCase, filters, onFiltersChange, filteredCasesCount }: DataSidebarProps) => {
  const [countySearch, setCountySearch] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'filters'>('details');

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
      case 'death': return 'text-red-700 bg-red-50 border-red-200';
      case 'assault': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'harassment': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'unlawful_arrest': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-80 bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white border-r border-white/10 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">REX</h2>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-black/30 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-all ${
              activeTab === 'details'
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Details
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-all ${
              activeTab === 'filters'
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {activeTab === 'details' ? (
          <div className="p-4">
            {selectedCase ? (
              <div className="space-y-6">
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <h3 className="text-xl font-bold mb-3 text-white">{selectedCase.victimName}</h3>
                  
                  <div className="space-y-3">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(selectedCase.type)}`}>
                      {getTypeLabel(selectedCase.type)}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedCase.location}, {selectedCase.county}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(selectedCase.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {selectedCase.description && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <h4 className="font-semibold mb-2 text-white">Description</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{selectedCase.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Select a Case</h3>
                <p className="text-gray-400 text-sm">Click on any pin on the map to view detailed information about that incident.</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-6 bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h4 className="font-semibold mb-3 text-white">Current View</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total Cases</span>
                  <Badge variant="secondary" className="bg-red-900/50 text-red-300 border-red-500/30">
                    {filteredCasesCount}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Year Range</span>
                  <span className="text-gray-300 text-sm">{filters.yearRange[0]} - {filters.yearRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Clear filters */}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                disabled={activeFiltersCount === 0}
                className="text-xs border-white/20 text-gray-300 hover:bg-white/5"
              >
                Clear All
              </Button>
            </div>

            {/* Year Range */}
            <div className="space-y-3">
              <h3 className="font-medium text-white text-sm">Year Range</h3>
              <div className="px-2">
                <Slider
                  value={filters.yearRange}
                  onValueChange={handleYearRangeChange}
                  min={2015}
                  max={2024}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{filters.yearRange[0]}</span>
                  <span>{filters.yearRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Case Types */}
            <div className="space-y-3">
              <h3 className="font-medium text-white text-sm">Case Types</h3>
              <div className="space-y-2">
                {caseTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5">
                    <Checkbox
                      id={type.value}
                      checked={filters.caseTypes.includes(type.value)}
                      onCheckedChange={(checked) => 
                        handleCaseTypeChange(type.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={type.value}
                      className="text-sm cursor-pointer flex-1 font-medium text-gray-300 hover:text-white"
                    >
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Counties */}
            <div className="space-y-3">
              <h3 className="font-medium text-white text-sm">Counties</h3>
              
              {/* Search counties */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search counties..."
                  value={countySearch}
                  onChange={(e) => setCountySearch(e.target.value)}
                  className="pl-9 text-sm h-9 bg-black/30 border-white/20 text-white placeholder-gray-400"
                />
              </div>

              {/* County list */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filteredCounties.map((county) => (
                  <div key={county} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5">
                    <Checkbox
                      id={county}
                      checked={filters.counties.includes(county)}
                      onCheckedChange={(checked) => 
                        handleCountyChange(county, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={county}
                      className="text-sm cursor-pointer flex-1 text-gray-300 hover:text-white"
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
        )}
      </ScrollArea>
    </div>
  );
};

export default DataSidebar;
