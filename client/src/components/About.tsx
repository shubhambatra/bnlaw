import content from '../content.json';

const { about } = content;

export default function About() {
  return (
    <section id="about" aria-label="About James Mitchell" className="py-14 md:py-24 bg-[#f8f7f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.35em] uppercase mb-3 sm:mb-4">{about.eyebrow}</p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f2167] mb-5 sm:mb-6 leading-tight whitespace-pre-line">
              {about.heading}
            </h2>
            <div className="w-12 h-0.5 bg-[#c9a84c] mb-6 sm:mb-8" />
            {about.bio.map((para, i) => (
              <p key={i} className="text-gray-600 leading-relaxed mb-5 sm:mb-6 text-sm sm:text-base">{para}</p>
            ))}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10">
              {about.credentials.map((tag) => (
                <span key={tag} className="border border-[#0f2167]/20 text-[#0f2167] text-xs font-medium px-3 sm:px-4 py-1.5 sm:py-2 tracking-wide">
                  {tag}
                </span>
              ))}
            </div>
            <a href="#contact" className="inline-block bg-[#0f2167] hover:bg-[#080f3a] text-white font-bold px-8 sm:px-9 py-3.5 sm:py-4 text-sm tracking-widest uppercase transition-colors">
              {about.cta}
            </a>
          </div>

          <div>
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.35em] uppercase mb-5 sm:mb-6 mt-4 lg:mt-0">{about.values.eyebrow}</p>
            <div className="space-y-3 sm:space-y-4">
              {about.values.items.map(({ title, desc }) => (
                <div key={title} className="bg-white border-l-4 border-[#c9a84c] shadow-sm">
                  <div className="p-4 sm:p-6">
                    <h3 className="font-bold text-[#0f2167] mb-1 sm:mb-1.5 text-sm sm:text-base">{title}</h3>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
