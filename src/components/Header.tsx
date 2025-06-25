
import { Filter, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onOpenFilters: () => void;
  onSubmitCase: () => void;
  caseCount: number;
}

const Header = ({ onOpenFilters, onSubmitCase, caseCount }: HeaderProps) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">REX</h1>
          </div>
          <div className="hidden sm:block text-sm text-muted-foreground">
            Kenya's Police Brutality Tracker
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center text-sm text-muted-foreground mr-4">
            <span className="font-medium text-primary">{caseCount}</span>
            <span className="ml-1">cases tracked</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFilters}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          
          <Button
            size="sm"
            onClick={onSubmitCase}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Submit Case</span>
          </Button>
        </div>
      </div>
      
      <div className="sm:hidden px-4 pb-3 text-xs text-muted-foreground">
        Kenya's Police Brutality Tracker • {caseCount} cases tracked
      </div>
    </div>
  );
};

export default Header;
