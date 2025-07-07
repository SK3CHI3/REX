import { X, Filter, Search, Calendar, MapPin, AlertTriangle, Eye, Upload, CheckCircle2, XCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FilterState, Case } from '@/types';
import { kenyanCounties, caseTypes } from '@/data/mockData';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar';

interface DataSidebarProps {
  selectedCase: Case | null;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  filteredCasesCount: number;
}

const DataSidebar = ({ selectedCase, filters, onFiltersChange, filteredCasesCount }: DataSidebarProps) => {
  const [countySearch, setCountySearch] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'filters'>(selectedCase ? 'details' : 'filters');
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar ? useSidebar() : { setOpenMobile: undefined };

  // When a case is selected, switch to details tab
  useEffect(() => {
    if (selectedCase) setActiveTab('details');
    else setActiveTab('filters');
  }, [selectedCase]);

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
    <div className={`w-80 bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white border-r border-white/10 flex flex-col h-full overflow-y-auto max-h-screen pb-8${isMobile ? ' w-screen h-screen max-w-none max-h-none border-none pt-0 pb-0 m-0 bg-transparent border-transparent' : ' pt-20'}`}>
      {/* Mobile sticky header with back/close button */}
      {isMobile && (
        <div className="sticky top-0 z-50 bg-slate-900/95 flex items-center justify-between px-2 py-1 border-b border-white/10 min-h-0 h-12">
          <button onClick={() => setOpenMobile && setOpenMobile(false)} className="text-white text-base font-bold px-1 py-0.5 rounded hover:bg-white/10 focus:outline-none">Back</button>
          <h2 className="text-base font-bold">Case Details</h2>
          <span className="w-8" />
        </div>
      )}
      {/* Header (desktop only) */}
      {!isMobile && (
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
      )}
      <ScrollArea className="flex-1 min-h-0">
        {activeTab === 'details' ? (
          <div className={`p-4 ${isMobile ? 'h-full w-full flex flex-col justify-start items-stretch bg-slate-900/95 rounded-none border-none' : ''}`}>
            {selectedCase ? (
              <div className={`space-y-6 ${isMobile ? 'h-full w-full flex-1 flex flex-col justify-start items-stretch' : ''}`}>
                {/* Simple glassmorphic card for mobile */}
                <div className={
                  isMobile
                    ? 'w-full bg-white/50 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-2xl p-5 flex flex-col gap-8 transition-all duration-300 max-h-[75vh] overflow-y-auto'
                    : 'bg-white/30 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 w-full flex flex-col gap-8 transition-all duration-300 max-h-[80vh] overflow-y-auto'
                }>
                  {/* Header: Name & Status */}
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-center gap-3 mb-1">
                      <AlertTriangle className="w-7 h-7 text-red-500 shrink-0" />
                      <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight flex-1">{selectedCase.victimName}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <span className={
                          selectedCase.status === 'verified'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : selectedCase.status === 'investigating'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            : 'bg-gray-200 text-gray-700 border-gray-300'
                        + ' px-3 py-1 rounded-full text-xs font-bold border shadow-sm tracking-wide'}>
                          {selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedCase.justiceServed !== undefined && (
                          <span className={
                            'flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border shadow-sm ' +
                            (selectedCase.justiceServed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')
                          }>
                            {selectedCase.justiceServed ? (
                              <><CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />Justice Served</>
                            ) : (
                              <><XCircle className="w-4 h-4 mr-1 text-red-500" />Justice Not Served</>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(selectedCase.type)} shadow-sm`}>{getTypeLabel(selectedCase.type)}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                        <span className="flex items-center gap-1 text-gray-700 text-sm"><Calendar className="w-4 h-4" />{new Date(selectedCase.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                        <span className="flex items-center gap-1 text-gray-700 text-sm"><MapPin className="w-4 h-4" />{selectedCase.location}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                        <span className="flex items-center gap-1 text-gray-700 text-sm"><span className="font-medium">County:</span> {selectedCase.county}</span>
                      </div>
                      {selectedCase.age !== undefined && (
                        <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                          <span className="font-medium text-gray-600 text-sm">Age:</span>
                          <span className="text-gray-700 text-sm">{selectedCase.age}</span>
                    </div>
                      )}
                    </div>
                  </div>
                  {/* Divider */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gray-300/30 to-transparent my-2 rounded-full" />
                  {/* Description */}
                  {selectedCase.description && (
                    <div className="bg-white/60 rounded-xl p-4 shadow-sm">
                      <h4 className="font-semibold mb-1 text-gray-900 flex items-center gap-2"><Eye className="w-4 h-4 text-blue-400" />Description</h4>
                      <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">{selectedCase.description}</p>
                    </div>
                  )}
                  {/* Evidence Section */}
                  {(selectedCase.photos?.length || selectedCase.videoLinks?.length) && (
                    <div className="bg-white/60 rounded-xl p-4 shadow-sm">
                      <h4 className="font-semibold mb-1 text-gray-900 flex items-center gap-2"><Upload className="w-4 h-4 text-purple-400" />Evidence</h4>
                      {selectedCase.photos?.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-3">
                          {selectedCase.photos.map((photo, idx) => (
                            <img key={idx} src={photo} alt={`evidence-${idx}`} className="w-20 h-20 object-cover rounded-lg border-2 border-white/60 shadow hover:scale-105 transition-transform duration-200" />
                          ))}
                        </div>
                      )}
                      {selectedCase.videoLinks?.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {selectedCase.videoLinks.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-sm w-fit"
                            >
                              <PlayCircle className="w-5 h-5" />
                              <span>Watch Evidence {selectedCase.videoLinks.length > 1 ? `#${idx + 1}` : ''}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Reporter Info Section */}
                  {(selectedCase.reportedBy || selectedCase.source) && (
                    <div className="bg-white/60 rounded-xl p-4 shadow-sm">
                      <h4 className="font-semibold mb-1 text-gray-900 flex items-center gap-2"><Eye className="w-4 h-4 text-pink-400" />Reported By</h4>
                      {selectedCase.reportedBy && (
                        <div className="text-gray-800 text-base leading-relaxed font-medium">{selectedCase.reportedBy}</div>
                      )}
                      {selectedCase.source && (
                        <div className="text-gray-500 text-sm leading-relaxed">{selectedCase.source}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-10 h-10 bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-2"><MapPin className="w-5 h-5 text-red-400" /></div>
                <h3 className="text-base font-semibold mb-1 text-white">Select a Case</h3>
                <p className="text-gray-400 text-xs">Click a pin on the map to view details.</p>
              </div>
            )}
            {/* Quick Stats (desktop only) */}
            {!isMobile && (
            <div className="mt-6 bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h4 className="font-semibold mb-3 text-white">Current View</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Total Cases</span>
                    <Badge variant="secondary" className="bg-red-900/50 text-red-300 border-red-500/30">{filteredCasesCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Year Range</span>
                  <span className="text-gray-300 text-sm">{filters.yearRange[0]} - {filters.yearRange[1]}</span>
                </div>
              </div>
            </div>
            )}
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
