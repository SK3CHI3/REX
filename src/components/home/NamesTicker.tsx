import { useNavigate } from 'react-router-dom';
import { Case } from '@/types';

interface NamesTickerProps {
  cases: Case[] | undefined;
  isLoading: boolean;
}

interface TickerName {
  id: string;
  name: string;
}

const NamesTicker = ({ cases, isLoading }: NamesTickerProps) => {
  const navigate = useNavigate();

  if (isLoading || !cases || cases.length === 0) return null;

  const names: TickerName[] = cases
    .filter((c) => {
      const name = (c.victimName || '').trim();
      return name.length > 0 && !/^(unknown|unkown|unnamed|n\/?a)$/i.test(name);
    })
    .map((c) => ({ id: c.id, name: c.victimName.trim() }));

  if (names.length === 0) return null;

  const renderRow = (rowNames: TickerName[], hidden: boolean) => (
    <div className="flex items-center shrink-0" aria-hidden={hidden}>
      {rowNames.map((entry, index) => (
        <span key={`${entry.id}-${hidden ? 'b' : 'a'}-${index}`} className="flex items-center shrink-0">
          <button
            onClick={() => navigate(`/case/${entry.id}`)}
            tabIndex={hidden ? -1 : 0}
            className="text-lg sm:text-xl font-semibold text-slate-700 hover:text-red-600 transition-colors whitespace-nowrap px-1"
            title="View case"
          >
            {entry.name}
          </button>
          <span className="mx-5 text-red-300 text-sm" aria-hidden="true">✦</span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="relative py-8 border-y border-red-100 bg-[#F3E7E4] overflow-hidden" aria-label="In memoriam">
      <div className="max-w-6xl mx-auto px-4 mb-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-red-200" />
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">
          In memoriam — every name a case on the map
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-red-200" />
      </div>

      <div className="ticker-hover-pause relative">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#F3E7E4] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F3E7E4] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-marquee" style={{ '--marquee-duration': `${Math.max(45, names.length * 4)}s` } as React.CSSProperties}>
          {renderRow(names, false)}
          {renderRow(names, true)}
        </div>
      </div>
    </section>
  );
};

export default NamesTicker;
