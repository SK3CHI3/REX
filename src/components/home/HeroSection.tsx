import { Map as MapIcon, FileText, FolderOpen, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onScrollToData: () => void;
}

const HeroSection = ({ onScrollToData }: HeroSectionProps) => {
  const navigate = useNavigate();

  const pillClass =
    'inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-100 bg-white/80 text-sm font-medium text-slate-700 hover:bg-white hover:border-red-300 hover:text-red-600 transition-all duration-200';

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-28 pb-16 overflow-hidden">
      {/* Background: real imagery under a warm white wash */}
      <div className="absolute inset-0">
        <img
          src="/the_independent_data_project-hero_image.png"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.07),transparent_65%)]" />
      </div>

      <div className="relative max-w-4xl mx-auto w-full text-center">
        {/* Kicker */}
        <div className="fade-up inline-flex items-center gap-3 mb-8">
          <span className="h-px w-8 bg-red-400/70" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-600">
            An independent data project — Kenya
          </span>
          <span className="h-px w-8 bg-red-400/70" />
        </div>

        {/* Headline */}
        <h1
          className="fade-up text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.05] mb-10"
          style={{ animationDelay: '0.1s' }}
        >
          Police violence in Kenya,
          <br />
          <span className="text-red-600">documented and mapped.</span>
        </h1>

        {/* Pill navigation — MPV style */}
        <div
          className="fade-up flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          style={{ animationDelay: '0.3s' }}
        >
          <Button
            onClick={() => navigate('/map')}
            size="lg"
            className="rounded-full bg-red-600 hover:bg-red-700 text-white px-7 font-semibold shadow-lg shadow-red-200 gap-2"
          >
            <MapIcon className="w-4 h-4" />
            Explore the map
          </Button>
          <button onClick={onScrollToData} className={pillClass}>
            <Database className="w-4 h-4 text-red-500" />
            See the data
          </button>
          <button onClick={() => navigate('/cases')} className={pillClass}>
            <FolderOpen className="w-4 h-4 text-red-500" />
            Browse cases
          </button>
          <button onClick={() => navigate('/news')} className={pillClass}>
            <FileText className="w-4 h-4 text-red-500" />
            Read news
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
