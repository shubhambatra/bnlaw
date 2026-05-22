import content from '../content.json';

export default function Stats() {
  return (
    <section aria-label="Key statistics" className="bg-[#080f3a] py-10 sm:py-14 border-y border-[#c9a84c]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-[#c9a84c]/20">
          {content.stats.map(({ value, label }) => (
            <div key={label} className="text-center px-4 sm:px-6">
              <dt className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#c9a84c] font-serif mb-1.5 sm:mb-2">{value}</dt>
              <dd className="text-white/55 text-[10px] sm:text-xs tracking-wider uppercase">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
