import { X, Filter, Search, Calendar, MapPin, AlertTriangle, Eye, Upload, CheckCircle2, XCircle, PlayCircle, Clock } from 'lucide-react';
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
  const [showSourcesModal, setShowSourcesModal] = useState(false);
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
    <div className={`${isMobile ? 'w-screen h-screen max-w-none max-h-none border-none pt-0 pb-0 m-0 bg-transparent border-transparent' : 'w-[28rem] pt-20'} bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white border-r border-white/10 flex flex-col h-full overflow-y-auto max-h-screen pb-8`}>
      {/* Mobile sticky header with back/close button */}
      {isMobile && (
        <div className="sticky top-0 z-50 bg-slate-900/95 flex items-center justify-between px-2 py-1 border-b border-white/10 min-h-0 h-12">
          <button onClick={() => setOpenMobile && setOpenMobile(false)} className="text-white text-base font-bold px-1 py-0.5 rounded hover:bg-white/10 focus:outline-none">Back</button>
          <h2 className="text-base font-bold">Case Details</h2>
          <span className="w-8" />
        </div>
      )}
      {/* Tab Navigation (desktop only) */}
      {!isMobile && (
      <div className="p-6 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex space-x-2 bg-black/40 backdrop-blur-sm rounded-xl p-2 border border-white/10">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'details'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Details
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'filters'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
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
                {/* Case details card */}
                <div className={
                  isMobile
                    ? 'w-full bg-white/50 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-2xl p-5 flex flex-col gap-8 transition-all duration-300 max-h-[75vh] overflow-y-auto'
                    : 'bg-gray-50 rounded-2xl border border-gray-200 shadow-lg p-8 w-full flex flex-col gap-6 transition-all duration-300 max-h-[80vh] overflow-y-auto'
                }>
                  {/* Header: Name & Status */}
                  <div className="border-b border-gray-300 pb-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedCase.victimName}</h3>
                      {selectedCase.age && (
                        <p className="text-gray-600 text-sm">Age: {selectedCase.age} years</p>
                      )}
                    </div>
                    
                    {/* Justice Status and Case Type */}
                    <div className="mb-4 flex items-center gap-3">
                      {selectedCase.justiceServed !== undefined ? (
                        <span className={
                          'flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border shadow-sm ' +
                          (selectedCase.justiceServed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')
                        }>
                          {selectedCase.justiceServed ? (
                            <><CheckCircle2 className="w-4 h-4 text-green-500" />Justice Served</>
                          ) : (
                            <><XCircle className="w-4 h-4 text-red-500" />Justice Not Served</>
                          )}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border shadow-sm bg-gray-50 text-gray-700 border-gray-200">
                          <Clock className="w-4 h-4 text-gray-500" />
                          Justice Status Pending
                        </span>
                      )}
                      
                      <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold border ${getTypeColor(selectedCase.type)} shadow-sm`}>
                        {getTypeLabel(selectedCase.type)}
                      </span>
                    </div>

                    {/* Location and Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{selectedCase.location}</p>
                          <p className="text-xs text-gray-500">{selectedCase.county} County</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{new Date(selectedCase.date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">Incident Date</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Description */}
                  {selectedCase.description && (
                    <div className="bg-white/70 rounded-xl p-6 border border-gray-300">
                      <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-600" />
                        Incident Description
                      </h4>
                      <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">{selectedCase.description}</p>
                    </div>
                  )}
                  {/* Photos Section */}
                  {selectedCase.photos?.length > 0 && (
                    <div className="space-y-4">
                      {selectedCase.photos.map((photo, idx) => (
                        <div key={idx} className="bg-white/70 rounded-xl p-4 border border-gray-300">
                          <img 
                            src={photo} 
                            alt={`Case photo ${idx + 1}`} 
                            className="w-full h-auto rounded-lg shadow-sm" 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Reporter Info Section */}
                  {(selectedCase.reportedBy || selectedCase.source) && (
                    <div className="bg-white/70 rounded-xl p-6 border border-gray-300">
                      <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-pink-600" />
                        Report Information
                      </h4>
                      {selectedCase.reportedBy && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Reported By</p>
                          <p className="text-gray-800 text-base font-medium">{selectedCase.reportedBy}</p>
                        </div>
                      )}
                      {selectedCase.source && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Source</p>
                          <p className="text-gray-600 text-sm">{selectedCase.source}</p>
                        </div>
                      )}
                      
                      {/* View Other Sources Button */}
                      <div className="pt-3 border-t border-gray-300">
                        <Button 
                          variant="outline" 
                          className="w-full bg-white/80 border-gray-400 text-gray-700 hover:bg-white hover:border-gray-500 transition-colors duration-200"
                          onClick={() => setShowSourcesModal(true)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Other Sources
                        </Button>
                      </div>
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
            <div className="mt-8 bg-gradient-to-br from-black/40 to-red-950/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
              <h4 className="font-bold mb-4 text-white text-lg flex items-center">
                <Eye className="w-5 h-5 mr-2 text-red-400" />
                Current View
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-300 font-medium">Total Cases</span>
                  <Badge variant="secondary" className="bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/50 px-3 py-1 font-bold">
                    {filteredCasesCount}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-300 font-medium">Year Range</span>
                  <span className="text-white font-semibold">{filters.yearRange[0]} - {filters.yearRange[1]}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-300 font-medium">Active Filters</span>
                  <span className="text-white font-semibold">{activeFiltersCount}</span>
                </div>
              </div>
            </div>
            )}
          </div>
        ) : (
          <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-8`}>
            {/* Clear filters */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Filter className="w-5 h-5 mr-2 text-red-400" />
                Filter Cases
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                disabled={activeFiltersCount === 0}
                className={`${isMobile ? 'text-xs' : 'text-sm'} border-white/20 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200`}
              >
                Clear All
              </Button>
            </div>

            {/* Year Range */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-base flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-red-400" />
                Year Range
              </h3>
              <div className="px-3 py-4 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
                <Slider
                  value={filters.yearRange}
                  onValueChange={handleYearRangeChange}
                  min={2015}
                  max={2024}
                  step={1}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-gray-300 font-medium">
                  <span>{filters.yearRange[0]}</span>
                  <span>{filters.yearRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Case Types */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-base flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />
                Case Types
              </h3>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-3">
                {caseTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200">
                    <Checkbox
                      id={type.value}
                      checked={filters.caseTypes.includes(type.value)}
                      onCheckedChange={(checked) => 
                        handleCaseTypeChange(type.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={type.value}
                      className="text-sm cursor-pointer flex-1 font-medium text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {type.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Counties */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-base flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-red-400" />
                Counties
              </h3>
              
              {/* Search counties */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search counties..."
                  value={countySearch}
                  onChange={(e) => setCountySearch(e.target.value)}
                  className="pl-9 text-sm h-10 bg-black/30 border-white/20 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                />
              </div>

              {/* County list */}
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4 space-y-2 max-h-48 overflow-y-auto">
                {filteredCounties.map((county) => (
                  <div key={county} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors duration-200">
                    <Checkbox
                      id={county}
                      checked={filters.counties.includes(county)}
                      onCheckedChange={(checked) => 
                        handleCountyChange(county, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={county}
                      className="text-sm cursor-pointer flex-1 text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {county}
                    </label>
                  </div>
                ))}
              </div>

              {filteredCounties.length === 0 && countySearch && (
                <div className="text-center py-6 bg-black/10 rounded-xl border border-white/5">
                  <Search className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    No counties found matching "{countySearch}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Sources Modal */}
      {showSourcesModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Additional Sources</h3>
                <p className="text-sm text-gray-600 mt-1">Third-party sources for {selectedCase.victimName}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSourcesModal(false)}
                className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {/* News Articles */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    News Articles
                  </h4>
                  <div className="space-y-3">
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors duration-200"
                    >
                      <p className="font-medium text-gray-900 mb-1">Police Brutality Incident Reported in {selectedCase.county}</p>
                      <p className="text-sm text-gray-600 mb-2">Local news coverage of the incident</p>
                      <p className="text-xs text-blue-600">The Daily Nation • 2 days ago</p>
                    </a>
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors duration-200"
                    >
                      <p className="font-medium text-gray-900 mb-1">Community Demands Justice After Police Incident</p>
                      <p className="text-sm text-gray-600 mb-2">Community response and demands</p>
                      <p className="text-xs text-blue-600">Standard Digital • 1 week ago</p>
                    </a>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Social Media Reports
                  </h4>
                  <div className="space-y-3">
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 bg-white rounded-lg border border-green-100 hover:border-green-300 transition-colors duration-200"
                    >
                      <p className="font-medium text-gray-900 mb-1">Twitter Thread on Incident</p>
                      <p className="text-sm text-gray-600 mb-2">Detailed eyewitness account</p>
                      <p className="text-xs text-green-600">@WitnessAccount • 3 days ago</p>
                    </a>
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 bg-white rounded-lg border border-green-100 hover:border-green-300 transition-colors duration-200"
                    >
                      <p className="font-medium text-gray-900 mb-1">Facebook Community Post</p>
                      <p className="text-sm text-gray-600 mb-2">Local community discussion</p>
                      <p className="text-xs text-green-600">{selectedCase.county} Community Group • 5 days ago</p>
                    </a>
                  </div>
                </div>

                {/* Human Rights Reports */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Human Rights Organizations
                  </h4>
                  <div className="space-y-3">
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 transition-colors duration-200"
                    >
                      <p className="font-medium text-gray-900 mb-1">Amnesty International Report</p>
                      <p className="text-sm text-gray-600 mb-2">Official documentation of the incident</p>
                      <p className="text-xs text-purple-600">Amnesty International Kenya • 1 week ago</p>
                    </a>
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 transition-colors duration-200"
                    >
                      <p className="font-medium text-gray-900 mb-1">KNCHR Statement</p>
                      <p className="text-sm text-gray-600 mb-2">Official response from human rights commission</p>
                      <p className="text-xs text-purple-600">Kenya National Commission on Human Rights • 2 weeks ago</p>
                    </a>
                  </div>
                </div>

                {/* Legal Documents */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Legal Documents
                  </h4>
                  <div className="space-y-3">
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-300 transition-colors duration-200"
                    >
                      <p className="font-medium text-gray-900 mb-1">Police Report</p>
                      <p className="text-sm text-gray-600 mb-2">Official police documentation</p>
                      <p className="text-xs text-orange-600">{selectedCase.county} Police Station • 1 week ago</p>
                    </a>
                    <a 
                      href="#" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-300 transition-colors duration-200"
                    >
                      <p className="font-medium text-gray-900 mb-1">Medical Report</p>
                      <p className="text-sm text-gray-600 mb-2">Medical examination documentation</p>
                      <p className="text-xs text-orange-600">County Hospital • 1 week ago</p>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {selectedCase.photos?.length || 0} photos • {selectedCase.videoLinks?.length || 0} videos available
                </p>
                <Button
                  onClick={() => setShowSourcesModal(false)}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSidebar;
