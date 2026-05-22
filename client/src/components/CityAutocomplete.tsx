import { useState, useRef, useEffect, useId, type ChangeEvent, type KeyboardEvent } from 'react';
import { INDIAN_CITIES } from '../data/indianCities';

interface Props {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

function getMatches(query: string): string[] {
  if (!query) return [];
  const q = query.toLowerCase();
  const starts = INDIAN_CITIES.filter((c) => c.toLowerCase().startsWith(q));
  const contains = INDIAN_CITIES.filter(
    (c) => !c.toLowerCase().startsWith(q) && c.toLowerCase().includes(q),
  );
  return [...starts, ...contains].slice(0, 8);
}

export default function CityAutocomplete({ id, value, onChange, placeholder, error, disabled }: Props) {
  const [inputVal, setInputVal] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-list`;

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);
    onChange(val);
    const matches = getMatches(val);
    setSuggestions(matches);
    setOpen(matches.length > 0);
    setActiveIdx(-1);
  };

  const select = (city: string) => {
    setInputVal(city);
    onChange(city);
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0) {
        e.preventDefault();
        select(suggestions[activeIdx]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        id={inputId}
        type="text"
        value={inputVal}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (inputVal) { setSuggestions(getMatches(inputVal)); setOpen(true); } }}
        placeholder={placeholder ?? 'Type a city…'}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={activeIdx >= 0 ? `${listId}-${activeIdx}` : undefined}
        className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors bg-white ${
          error
            ? 'border-red-400 focus:border-red-500'
            : 'border-gray-200 focus:border-[#c9a84c]'
        } disabled:bg-gray-50 disabled:cursor-not-allowed`}
      />

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="City suggestions"
          className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border border-gray-200 shadow-xl max-h-56 overflow-y-auto"
        >
          {suggestions.map((city, i) => (
            <li
              key={city}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={() => select(city)}
              className={`px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2 ${
                i === activeIdx
                  ? 'bg-[#0f2167] text-white'
                  : 'text-gray-700 hover:bg-[#0f2167]/5'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 shrink-0 opacity-50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {city}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
