import content from '../content.json';

const { testimonials } = content;

export default function Testimonials() {
  return (
    <section id="testimonials" aria-label="Client testimonials" className="py-14 md:py-24 bg-[#f8f7f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.35em] uppercase mb-3 sm:mb-4">{testimonials.eyebrow}</p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f2167] mb-4 sm:mb-5">{testimonials.heading}</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">{testimonials.description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-8">
          {testimonials.items.map(({ name, role, text, rating }) => (
            <blockquote key={name} className="bg-white p-5 sm:p-8 shadow-sm border-t-4 border-[#c9a84c] flex flex-col">
              <div className="flex gap-1 mb-4 sm:mb-5" aria-label={`${rating} out of 5 stars`}>
                {Array.from({ length: rating }).map((_, i) => (
                  <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#c9a84c]" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <svg viewBox="0 0 40 28" className="w-8 h-5 sm:w-9 sm:h-6 fill-[#c9a84c]/20 mb-3 sm:mb-4 shrink-0" aria-hidden="true">
                <path d="M0 28V17.652C0 7.891 6.052 1.196 18.156 0l1.5 2.845C12.24 4.29 8.705 7.42 8.705 12.174h7.295V28H0zm21 0V17.652C21 7.891 27.052 1.196 39.156 0l1.5 2.845C33.24 4.29 29.705 7.42 29.705 12.174H37V28H21z" />
              </svg>
              <p className="text-gray-600 text-sm leading-relaxed italic flex-1">{text}</p>
              <footer className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-100">
                <p className="font-bold text-[#0f2167] text-sm sm:text-base">{name}</p>
                <p className="text-gray-400 text-xs tracking-wide uppercase mt-0.5">{role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
