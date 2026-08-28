interface SectionHeadingProps {
  kicker: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

const SectionHeading = ({ kicker, title, subtitle, align = 'left' }: SectionHeadingProps) => {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-4 mb-12 ${alignment}`}>
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">
        {kicker}
      </span>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg text-slate-600 leading-relaxed ${align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
