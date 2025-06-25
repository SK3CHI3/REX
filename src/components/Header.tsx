
import { Filter, Plus, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onOpenFilters: () => void;
  onSubmitCase: () => void;
  caseCount: number;
}

const Header = ({ onOpenFilters, onSubmitCase, caseCount }: HeaderProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-3 sm:p-4">
        {/* Logo and title */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">REX</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Police Brutality Tracker</p>
            </div>
          </div>
        </div>

        {/* Case counter - redesigned */}
        <div className="hidden sm:flex items-center mr-4">
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 px-3 py-1">
            <MapPin className="w-3 h-3 mr-1" />
            {caseCount} cases
          </Badge>
        </div>

        {/* Action buttons - improved design */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFilters}
            className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          
          <Button
            size="sm"
            onClick={onSubmitCase}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Report Case</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile subtitle and counter - improved */}
      <div className="sm:hidden px-3 pb-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">Kenya's Police Brutality Tracker</span>
        <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-1">
          <MapPin className="w-3 h-3 mr-1" />
          {caseCount}
        </Badge>
      </div>
    </div>
  );
};

export default Header;
