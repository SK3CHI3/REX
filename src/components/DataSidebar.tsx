import { Filter, Search, Calendar, BarChart3, TrendingUp, MapPin, AlertTriangle, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FilterState } from '@/types';
import { kenyanCounties, caseTypes } from '@/data/mockData';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DataSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  filteredCasesCount: number;
  totalCasesCount: number;
}

const DataSidebar = ({ filters, onFiltersChange, filteredCasesCount, totalCasesCount }: DataSidebarProps) => {
  const [countySearch, setCountySearch] = useState('');
  const isMobile = useIsMobile();

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
  const filterPercentage = totalCasesCount > 0 ? Math.round((filteredCasesCount / totalCasesCount) * 100) : 0;

  return (
    <div className={`${isMobile ? 'w-screen h-screen max-w-none max-h-none border-none pt-0 pb-0 m-0' : 'w-80 pt-20'} bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white border-r border-white/10 flex flex-col h-full overflow-hidden`}>
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Sliders className="w-5 h-5 mr-2 text-red-400" />
            Filters & Analytics
          </h2>
          {activeFiltersCount > 0 && (
            <Badge className="bg-red-600 text-white">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Showing</span>
            </div>
            <p className="text-lg font-bold text-white">{filteredCasesCount}</p>
            <p className="text-xs text-gray-400">of {totalCasesCount} cases</p>
          </div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Filtered</span>
            </div>
            <p className="text-lg font-bold text-white">{filterPercentage}%</p>
            <p className="text-xs text-gray-400">of total data</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 space-y-6">
          {/* Search Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center">
              <Search className="w-4 h-4 mr-2" />
              Search Cases
            </h3>
            <Input
              placeholder="Search by victim name, location..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="bg-black/30 border-white/20 text-white placeholder:text-gray-400 focus:border-red-400"
            />
          </div>
          {/* Case Type Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Case Types
            </h3>
            <div className="space-y-2">
              {caseTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-3">
                  <Checkbox
                    id={type.value}
                    checked={filters.caseTypes.includes(type.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onFiltersChange({
                          ...filters,
                          caseTypes: [...filters.caseTypes, type.value]
                        });
                      } else {
                        onFiltersChange({
                          ...filters,
                          caseTypes: filters.caseTypes.filter(t => t !== type.value)
                        });
                      }
                    }}
                    className="border-white/30 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <label
                    htmlFor={type.value}
                    className="text-sm text-gray-300 cursor-pointer flex-1 flex items-center justify-between"
                  >
                    <span>{type.label}</span>
                    <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                      {type.count || 0}
                    </Badge>
                  </label>
                </div>
              ))}
            </div>
          </div>
          {/* County Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Counties
            </h3>
            <Input
              placeholder="Search counties..."
              value={countySearch}
              onChange={(e) => setCountySearch(e.target.value)}
              className="bg-black/30 border-white/20 text-white placeholder:text-gray-400 focus:border-red-400 text-sm"
            />
            <div className="max-h-48 overflow-y-auto space-y-2">
              {kenyanCounties
                .filter(county =>
                  county.toLowerCase().includes(countySearch.toLowerCase())
                )
                .slice(0, 10)
                .map((county) => (
                  <div key={county} className="flex items-center space-x-3">
                    <Checkbox
                      id={county}
                      checked={filters.counties.includes(county)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onFiltersChange({
                            ...filters,
                            counties: [...filters.counties, county]
                          });
                        } else {
                          onFiltersChange({
                            ...filters,
                            counties: filters.counties.filter(c => c !== county)
                          });
                        }
                      }}
                      className="border-white/30 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <label
                      htmlFor={county}
                      className="text-sm text-gray-300 cursor-pointer flex-1"
                    >
                      {county}
                    </label>
                  </div>
                ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">From</label>
                <Input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value }
                  })}
                  className="bg-black/30 border-white/20 text-white focus:border-red-400 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">To</label>
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value }
                  })}
                  className="bg-black/30 border-white/20 text-white focus:border-red-400 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div className="pt-4 border-t border-white/10">
              <Button
                onClick={() => onFiltersChange({
                  search: '',
                  counties: [],
                  caseTypes: [],
                  dateRange: { start: '', end: '' }
                })}
                variant="outline"
                className="w-full border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DataSidebar;

