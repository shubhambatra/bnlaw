import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import content from '../content.json';

const { navbar, site } = content;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const onQueryPage = pathname === '/query';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navBg = onQueryPage || scrolled ? 'bg-[#080f3a] shadow-xl py-3' : 'bg-transparent py-5';
  const linkHref = (hash: string) => (onQueryPage ? `/${hash}` : hash);

  return (
    <nav aria-label="Main navigation" className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" aria-label={`${site.name} – Home`}>
          <svg viewBox="0 0 32 32" className="w-8 h-8 fill-[#c9a84c]" aria-hidden="true">
            <path d="M16 2L4 8v3h24V8L16 2zM4 27h24v2H4v-2zM7 13v12H5v2h22v-2h-2V13h-2v12h-4V13h-2v12h-4V13H7z" />
          </svg>
          <div className="leading-none">
            <span className="text-white font-bold text-lg tracking-widest">{site.brandName}</span>
            <span className="text-[#c9a84c] font-light text-lg tracking-widest">{site.brandSuffix}</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navbar.links.map(({ label, hash }) => (
            <a key={label} href={linkHref(hash)} className="text-white/75 hover:text-[#c9a84c] transition-colors text-sm font-medium tracking-wider uppercase">
              {label}
            </a>
          ))}
          <Link to="/query" className="ml-2 bg-[#c9a84c] hover:bg-[#a08030] text-[#080f3a] font-bold px-6 py-2.5 text-sm tracking-widest uppercase transition-colors">
            {navbar.cta}
          </Link>
        </div>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#080f3a] px-4 pb-4 border-t border-white/10 mt-2">
          {navbar.links.map(({ label, hash }) => (
            <a key={label} href={linkHref(hash)} onClick={() => setMenuOpen(false)}
              className="block py-3 text-white/80 hover:text-[#c9a84c] text-sm font-medium tracking-wider uppercase border-b border-white/5 last:border-none">
              {label}
            </a>
          ))}
          <Link to="/query" onClick={() => setMenuOpen(false)}
            className="mt-4 block text-center bg-[#c9a84c] text-[#080f3a] font-bold py-3 text-sm tracking-widest uppercase">
            {navbar.cta}
          </Link>
        </div>
      )}
    </nav>
  );
}
