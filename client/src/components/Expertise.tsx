import type { ReactNode } from 'react';
import content from '../content.json';

const { expertise } = content;

// Icons keyed by area.key — text comes from content.json
const ICONS: Record<string, ReactNode> = {
  corporate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  family: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
    </svg>
  ),
  criminal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  civil: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  realestate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  estate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
};

export default function Expertise() {
  return (
    <section id="expertise" aria-label="Practice areas" className="py-14 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.35em] uppercase mb-3 sm:mb-4">{expertise.eyebrow}</p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f2167] mb-4 sm:mb-5">{expertise.heading}</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">{expertise.description}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {expertise.areas.map(({ key, title, desc }) => (
            <article key={key} className="group p-5 sm:p-8 border border-gray-100 hover:border-[#c9a84c] hover:shadow-lg transition-all duration-300 cursor-default">
              <div className="text-[#c9a84c] mb-4 sm:mb-5 inline-block group-hover:scale-110 transition-transform duration-300">
                {ICONS[key]}
              </div>
              <h3 className="font-bold text-[#0f2167] text-base sm:text-lg mb-2 sm:mb-3">{title}</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
              <div className="mt-4 sm:mt-6 w-8 h-0.5 bg-[#c9a84c] group-hover:w-16 transition-all duration-300" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
