import content from '../content.json';

const { footer, site } = content;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#080f3a] text-white/65" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-10 md:mb-12">
          <div className="col-span-2">
            <a href="#home" className="flex items-center gap-3 mb-4 sm:mb-5" aria-label={`${site.name} – Home`}>
              <svg viewBox="0 0 32 32" className="w-7 h-7 sm:w-8 sm:h-8 fill-[#c9a84c]" aria-hidden="true">
                <path d="M16 2L4 8v3h24V8L16 2zM4 27h24v2H4v-2zM7 13v12H5v2h22v-2h-2V13h-2v12h-4V13h-2v12h-4V13H7z" />
              </svg>
              <div>
                <span className="text-white font-bold text-base sm:text-lg tracking-widest">{site.brandName}</span>
                <span className="text-[#c9a84c] font-light text-base sm:text-lg tracking-widest">{site.brandSuffix}</span>
              </div>
            </a>
            <p className="text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 max-w-sm">{footer.brand.description}</p>
            <p className="text-xs text-white/35 border-t border-white/10 pt-4 sm:pt-6 leading-relaxed">
              <strong className="text-white/50">{footer.brand.disclaimerLabel}</strong> {footer.brand.disclaimer}
            </p>
          </div>

          <nav aria-label="Footer quick links">
            <h3 className="text-white text-xs font-bold tracking-widest uppercase mb-4 sm:mb-6">{footer.quickLinks.heading}</h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {footer.quickLinks.items.map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-xs sm:text-sm hover:text-[#c9a84c] transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer practice areas">
            <h3 className="text-white text-xs font-bold tracking-widest uppercase mb-4 sm:mb-6">{footer.practiceAreas.heading}</h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {footer.practiceAreas.items.map((area) => (
                <li key={area}>
                  <a href="#expertise" className="text-xs sm:text-sm hover:text-[#c9a84c] transition-colors">{area}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <p className="text-xs">© {year} {footer.copyright}</p>
          <p className="text-xs text-center sm:text-right">{site.barInfo}</p>
        </div>
      </div>
    </footer>
  );
}
