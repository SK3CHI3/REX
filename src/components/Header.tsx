
import { Filter, Plus, MapPin, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">REX</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Police Brutality Tracker</p>
            </div>
          </div>
        </div>

        {/* Case counter - mobile optimized */}
        <div className="hidden sm:flex items-center text-sm text-gray-600 mr-4 bg-gray-100 rounded-full px-3 py-1">
          <span className="font-semibold text-red-600">{caseCount}</span>
          <span className="ml-1">cases</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFilters}
            className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          
          <Button
            size="sm"
            onClick={onSubmitCase}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Report Case</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile subtitle and counter */}
      <div className="sm:hidden px-3 pb-2 flex items-center justify-between text-xs text-gray-500">
        <span>Kenya's Police Brutality Tracker</span>
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
          {caseCount} cases
        </span>
      </div>
    </div>
  );
};

export default Header;
