import { Link } from 'react-router-dom';
import content from '../content.json';

const { hero } = content;

export default function Hero() {
  return (
    <section id="home" aria-label="Introduction" className="relative min-h-screen flex items-center bg-[#0f2167] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9a84c 0, #c9a84c 1px, transparent 0, transparent 50%)', backgroundSize: '24px 24px' }} aria-hidden="true" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c9a84c]" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full py-20 sm:py-24 lg:py-36">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.35em] uppercase mb-4 sm:mb-5">{hero.eyebrow}</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-5 sm:mb-6">
              {hero.heading1}
              <br />
              <span className="text-[#c9a84c]">{hero.heading2}</span>
            </h1>
            <div className="w-16 h-0.5 bg-[#c9a84c] mb-5 sm:mb-6" />
            <p className="text-base sm:text-lg md:text-xl text-white/75 leading-relaxed mb-8 sm:mb-10 max-w-lg"
              dangerouslySetInnerHTML={{ __html: hero.subtext }} />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/query" className="inline-block text-center bg-[#c9a84c] hover:bg-[#a08030] text-[#080f3a] font-bold px-8 sm:px-9 py-4 text-sm tracking-widest uppercase transition-all hover:shadow-[0_8px_24px_rgba(201,168,76,0.35)]">
                {hero.primaryCta}
              </Link>
              <a href="#about" className="inline-block text-center border border-white/30 hover:border-[#c9a84c] text-white hover:text-[#c9a84c] font-medium px-8 sm:px-9 py-4 text-sm tracking-widest uppercase transition-all">
                {hero.secondaryCta}
              </a>
            </div>

            <div className="mt-10 sm:mt-14 grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-8">
              {hero.stats.map(({ value, label }, i) => (
                <div key={label} className="sm:flex sm:items-center sm:gap-8">
                  {i > 0 && <div className="hidden sm:block w-px h-10 bg-white/20" />}
                  <div className="text-center sm:text-left">
                    <p className="text-2xl sm:text-3xl font-bold text-[#c9a84c] font-serif">{value}</p>
                    <p className="text-white/50 text-[10px] sm:text-xs tracking-wider uppercase mt-1">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end mt-4 lg:mt-0">
            <div className="relative">
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-full h-full border-2 border-[#c9a84c]/40" aria-hidden="true" />
              <div className="w-52 h-64 sm:w-64 sm:h-80 md:w-72 md:h-[400px] lg:w-80 lg:h-[480px] relative overflow-hidden bg-gradient-to-b from-[#1a2b5e] to-[#080f3a]">
                <svg viewBox="0 0 220 320" className="w-full h-full opacity-20 fill-[#c9a84c]" aria-hidden="true">
                  <circle cx="110" cy="90" r="52" />
                  <path d="M20 320 C20 210 50 185 110 180 C170 185 200 210 200 320 Z" />
                </svg>
                <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 text-center px-4">
                  <p className="text-[#c9a84c] font-serif text-base sm:text-lg font-semibold">{hero.photoCaption}</p>
                  <p className="text-white/50 text-xs tracking-widest uppercase">{hero.photoCaptionRole}</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-[#c9a84c] px-4 sm:px-5 py-2.5 sm:py-3 shadow-2xl">
                <p className="text-[#080f3a] font-bold text-xs sm:text-sm leading-none">{hero.badge.title}</p>
                <p className="text-[#080f3a]/70 text-xs mt-0.5">{hero.badge.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
