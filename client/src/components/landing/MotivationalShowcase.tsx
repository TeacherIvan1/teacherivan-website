import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../modules/i18n/languageStore';
import { useTheme } from '../../modules/theme/ThemeContext';

export interface MotivationalCard {
  id: string;
  image: string;
  altEs: string;
  altEn: string;
  tagEs: string;
  tagEn: string;
  titleEs: string;
  titleEn: string;
  copyEs: string;
  copyEn: string;
}

export const MOTIVATIONAL_CARDS: MotivationalCard[] = [
  {
    id: 'global-career',
    image: '/assets/motivation/global-career.webp',
    altEs: 'Profesional latinoamericana trabajando de forma remota en laptop frente a un ventanal al atardecer',
    altEn: 'Latin American professional working remotely on a laptop at a sunlit architectural desk',
    tagEs: 'SALARIO GLOBAL',
    tagEn: 'GLOBAL SALARY',
    titleEs: 'Carreras Globales y Trabajo Remoto',
    titleEn: 'Global Careers & Remote Work',
    copyEs: 'Multiplica tus oportunidades profesionales trabajando para empresas internacionales desde donde estés.',
    copyEn: 'Multiply your career opportunities working for international companies from anywhere.',
  },
  {
    id: 'job-interview',
    image: '/assets/motivation/job-interview.webp',
    altEs: 'Profesional sonriendo con seguridad durante una entrevista técnica por videollamada',
    altEn: 'Confident professional smiling during a live video interview from a modern studio',
    tagEs: 'ENTREVISTAS EN VIVO',
    tagEn: 'LIVE INTERVIEWS',
    titleEs: 'Entrevistas Técnicas sin Miedo',
    titleEn: 'Fearless Job Interviews',
    copyEs: 'Responde con claridad y naturalidad cuando llegue la entrevista que cambiará tu carrera.',
    copyEn: 'Answer clearly and naturally when the interview that transforms your career arrives.',
  },
  {
    id: 'borderless-travel',
    image: '/assets/motivation/borderless-travel.webp',
    altEs: 'Viajera sonriendo con mochila caminando por un aeropuerto internacional iluminado por el sol',
    altEn: 'Joyful traveler walking through a sunlit international airport concourse',
    tagEs: 'LIBERTAD REAL',
    tagEn: 'REAL FREEDOM',
    titleEs: 'Viajes Sin Barreras',
    titleEn: 'Borderless Travel',
    copyEs: 'Conecta con personas, culturas y ciudades alrededor del mundo sin depender de traductores.',
    copyEn: 'Connect with people, cultures, and cities worldwide without relying on translation apps.',
  },
  {
    id: 'international-scholarship',
    image: '/assets/motivation/international-scholarship.webp',
    altEs: 'Estudiante de posgrado caminando con cuaderno por el patio histórico de una universidad extranjera',
    altEn: 'Graduate student walking across a historic stone university campus in golden sunlight',
    tagEs: 'B2 – C1 / IELTS',
    tagEn: 'B2 – C1 / IELTS',
    titleEs: 'Becas y Posgrados Internacionales',
    titleEn: 'International Scholarships',
    copyEs: 'Prepárate para admisiones, IELTS y universidades en el extranjero con dominio oral real.',
    copyEn: 'Prepare for admissions, IELTS, and global universities with genuine spoken fluency.',
  },
  {
    id: 'everyday-confidence',
    image: '/assets/motivation/everyday-confidence.webp',
    altEs: 'Dos amigos conversando y riendo con naturalidad frente a un café en una terraza soleada',
    altEn: 'Two friends laughing and conversing naturally over coffee on a sunny urban terrace',
    tagEs: '>75% HABLA ACTIVA',
    tagEn: '>75% ACTIVE TALK',
    titleEs: 'Seguridad al Conversar',
    titleEn: 'Everyday Confidence',
    copyEs: 'Deja atrás el miedo al error y disfruta pensar y expresarte directamente en inglés.',
    copyEn: 'Leave fear of mistakes behind and enjoy thinking and speaking directly in English.',
  },
];

export interface MotivationalShowcaseProps {
  isMobile: boolean;
}

export const MotivationalShowcase: React.FC<MotivationalShowcaseProps> = ({ isMobile }) => {
  const { isEs } = useTranslation();
  const { isDark } = useTheme();
  const total = MOTIVATIONAL_CARDS.length;
  const [active, setActive] = useState<number>(() => (isMobile ? 0 : 2));
  const [announcement, setAnnouncement] = useState<string>('');
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const pointerStartX = useRef<number | null>(null);

  const announceSlide = useCallback(
    (idx: number) => {
      const card = MOTIVATIONAL_CARDS[idx];
      const title = isEs ? card.titleEs : card.titleEn;
      setAnnouncement(
        isEs
          ? `Oportunidad ${idx + 1} de ${total}: ${title}`
          : `Opportunity ${idx + 1} of ${total}: ${title}`
      );
    },
    [isEs, total]
  );

  const scrollMobileTrackTo = useCallback((idx: number) => {
    const track = mobileTrackRef.current;
    if (!track) return;
    const slideEl = track.children[idx] as HTMLElement | undefined;
    if (!slideEl) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const targetLeft = slideEl.offsetLeft - (track.clientWidth - slideEl.clientWidth) / 2;
    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      const next = ((idx % total) + total) % total;
      setActive(next);
      announceSlide(next);
      if (isMobile) {
        scrollMobileTrackTo(next);
      }
    },
    [total, announceSlide, isMobile, scrollMobileTrackTo]
  );

  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);
  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);

  // Sync active index on mobile native scroll-snap track (throttled via rAF)
  useEffect(() => {
    if (!isMobile) return;
    const track = mobileTrackRef.current;
    if (!track) return;
    let rafId = 0;

    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const center = track.scrollLeft + track.clientWidth / 2;
        let closestIdx = 0;
        let closestDist = Infinity;
        Array.from(track.children).forEach((child, i) => {
          const el = child as HTMLElement;
          const elCenter = el.offsetLeft + el.clientWidth / 2;
          const dist = Math.abs(elCenter - center);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        });
        setActive((prev) => (prev === closestIdx ? prev : closestIdx));
      });
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  // =========================================================================
  // MOBILE VIEW (< 768px): Native CSS Scroll-Snap Horizontal Deck (Zero 3D Clutter)
  // =========================================================================
  if (isMobile) {
    return (
      <div
        id="motivational-showcase-carousel"
        data-testid="motivational-showcase-carousel"
        data-active-index={active}
        role="region"
        aria-roledescription="carousel"
        aria-label={isEs ? 'Oportunidades reales con el inglés' : 'Real-world English opportunities'}
        onKeyDown={handleKeyDown}
        className="w-full mt-6"
      >
        {/* Native Horizontal Scroll-Snap Track with overscroll-behavior-x: contain */}
        <div
          ref={mobileTrackRef}
          className="motivation-snap-track"
          role="group"
          aria-label={isEs ? 'Tarjetas de oportunidades' : 'Opportunity cards'}
        >
          {MOTIVATIONAL_CARDS.map((card, i) => (
            <article
              key={card.id}
              role="group"
              aria-roledescription="slide"
              aria-label={isEs ? `${i + 1} de ${total}` : `${i + 1} of ${total}`}
              data-testid={`motivation-card-${i}`}
              className="relative shrink-0 overflow-hidden rounded-[24px] shadow-xl"
              style={{
                width: '82vw',
                maxWidth: 330,
                height: 390,
                scrollSnapAlign: 'center',
                border: '1px solid rgba(167, 199, 231, 0.30)',
                background: '#091326',
              }}
            >
              <img
                src={card.image}
                alt={isEs ? card.altEs : card.altEn}
                width={720}
                height={960}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* High-Contrast Dark Bottom Scrim (>10:1 WCAG AAA in Light & Night Modes) */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(9,19,38,0.12) 0%, rgba(9,19,38,0.88) 76%, rgba(9,19,38,0.97) 100%)',
                }}
              />
              <div className="relative z-10 h-full flex flex-col justify-end p-5 text-left gap-2">
                <span className="inline-block self-start px-3 py-1 rounded-full bg-[#E09B30] text-[#091326] font-montserrat font-extrabold text-[11px] uppercase tracking-[0.12em]">
                  {isEs ? card.tagEs : card.tagEn}
                </span>
                <h3 className="font-montserrat font-bold text-xl leading-snug text-[#FAFAFA]">
                  {isEs ? card.titleEs : card.titleEn}
                </h3>
                <p className="font-inter text-base leading-relaxed text-[#FAFAFA]/95">
                  {isEs ? card.copyEs : card.copyEn}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Accessible 44x44px Mobile Prev / Dots / Next Controls */}
        <div className="flex items-center justify-center gap-3 mt-4 px-4">
          <button
            id="motivation-carousel-prev-btn"
            type="button"
            onClick={goPrev}
            aria-label={isEs ? 'Oportunidad anterior' : 'Previous opportunity'}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
              isDark
                ? 'bg-[#132642] text-[#FAFAFA] border-[#A7C7E7]/35 hover:bg-[#E09B30] hover:text-[#091326]'
                : 'bg-[#FFFFFF] text-[#1A3153] border-[#1A3153]/25 hover:bg-[#1A3153] hover:text-[#FAFAFA]'
            }`}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          <nav
            aria-label={isEs ? 'Elegir tarjeta' : 'Choose slide'}
            className="flex items-center gap-1"
          >
            {MOTIVATIONAL_CARDS.map((card, i) => {
              const isSelected = active === i;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={
                    isEs
                      ? `Ir a tarjeta ${i + 1}: ${card.titleEs}`
                      : `Go to slide ${i + 1}: ${card.titleEn}`
                  }
                  aria-current={isSelected ? 'true' : undefined}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-transparent border-0 cursor-pointer p-0"
                >
                  <span
                    className={`block rounded-full transition-all duration-200 ${
                      isSelected
                        ? 'w-7 h-2.5 bg-[#E09B30] ring-2 ring-[#1A3153]/25'
                        : isDark
                        ? 'w-2.5 h-2.5 bg-[#A7C7E7]/50'
                        : 'w-2.5 h-2.5 bg-[#1A3153]/35'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <button
            id="motivation-carousel-next-btn"
            type="button"
            onClick={goNext}
            aria-label={isEs ? 'Siguiente oportunidad' : 'Next opportunity'}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
              isDark
                ? 'bg-[#132642] text-[#FAFAFA] border-[#A7C7E7]/35 hover:bg-[#E09B30] hover:text-[#091326]'
                : 'bg-[#FFFFFF] text-[#1A3153] border-[#1A3153]/25 hover:bg-[#1A3153] hover:text-[#FAFAFA]'
            }`}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>

        <p className="visually-hidden" role="status" aria-live="polite">
          {announcement}
        </p>
      </div>
    );
  }

  // =========================================================================
  // DESKTOP VIEW (>= 768px): Editorial Fanned Arc Card Deck with Real Photography
  // =========================================================================
  const cardW = 300;
  const cardH = 420;
  const stepX = 295;
  const dropY = 52;
  const tilt = 8;
  const containerH = 540;
  const centerBump = 30;

  return (
    <div
      id="motivational-showcase-carousel"
      data-testid="motivational-showcase-carousel"
      data-active-index={active}
      role="region"
      aria-roledescription="carousel"
      aria-label={isEs ? 'Oportunidades reales con el inglés' : 'Real-world English opportunities'}
      onKeyDown={handleKeyDown}
      onPointerDown={(e) => {
        pointerStartX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (pointerStartX.current === null) return;
        const dx = e.clientX - pointerStartX.current;
        pointerStartX.current = null;
        if (Math.abs(dx) > 45) {
          if (dx < 0) goNext();
          else goPrev();
        }
      }}
      className="relative w-full select-none"
      style={{
        height: containerH,
        marginTop: 28,
        overflow: 'visible',
      }}
    >
      {/* Fanned Cards Stage */}
      <div
        className="relative w-full h-full"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {MOTIVATIONAL_CARDS.map((card, i) => {
          let d = i - active;
          if (d > total / 2) d -= total;
          if (d < -total / 2) d += total;
          const absD = Math.abs(d);
          const isCenter = d === 0;
          const isVisible = absD <= 2;

          const x = d * stepX;
          const y = absD * absD * dropY - (isCenter ? centerBump : 0);
          const rot = d * tilt;
          const scale = isCenter ? 1.06 : Math.max(0.84, 1 - absD * 0.08);
          const opacity = absD > 2 ? 0 : isCenter ? 1 : Math.max(0.55, 1 - absD * 0.22);

          return (
            <article
              key={card.id}
              role="group"
              aria-roledescription="slide"
              aria-label={isEs ? `${i + 1} de ${total}` : `${i + 1} of ${total}`}
              data-testid={`motivation-card-${i}`}
              onClick={() => goTo(i)}
              style={{
                position: 'absolute',
                width: cardW,
                height: cardH,
                borderRadius: 24,
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#091326',
                border: isCenter
                  ? '2px solid rgba(224, 155, 48, 0.90)'
                  : '1px solid rgba(167, 199, 231, 0.30)',
                boxShadow: isCenter
                  ? '0 34px 68px rgba(9, 19, 38, 0.58), 0 0 36px rgba(224, 155, 48, 0.24)'
                  : '0 22px 44px rgba(9, 19, 38, 0.38)',
                transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`,
                opacity,
                zIndex: 10 - absD,
                pointerEvents: isVisible ? 'auto' : 'none',
                transition: 'transform 0.72s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease',
              }}
            >
              <img
                src={card.image}
                alt={isEs ? card.altEs : card.altEn}
                width={720}
                height={960}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Dark Bottom Gradient Scrim (>10:1 WCAG AAA Contrast in Both Modes) */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(9,19,38,0.12) 0%, rgba(9,19,38,0.88) 78%, rgba(9,19,38,0.96) 100%)',
                }}
              />
              <div className="relative z-10 h-full flex flex-col justify-end p-6 text-left gap-2.5">
                <span className="inline-block self-start px-3 py-1 rounded-full bg-[#E09B30] text-[#091326] font-montserrat font-extrabold text-[11px] uppercase tracking-[0.14em]">
                  {isEs ? card.tagEs : card.tagEn}
                </span>
                <h3 className="font-montserrat font-bold text-xl leading-snug text-[#FAFAFA]">
                  {isEs ? card.titleEs : card.titleEn}
                </h3>
                <p className="font-inter text-sm leading-relaxed text-[#FAFAFA]/95">
                  {isEs ? card.copyEs : card.copyEn}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Desktop Circular Prev / Next Controls (44x44px) */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center gap-4"
        style={{ bottom: 6, zIndex: 25 }}
      >
        <button
          id="motivation-carousel-prev-btn"
          type="button"
          onClick={goPrev}
          aria-label={isEs ? 'Oportunidad anterior' : 'Previous opportunity'}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg border ${
            isDark
              ? 'bg-[#132642]/95 text-[#FAFAFA] border-[#A7C7E7]/35 hover:bg-[#E09B30] hover:text-[#091326]'
              : 'bg-[#FFFFFF] text-[#1A3153] border-[#1A3153]/25 hover:bg-[#1A3153] hover:text-[#FAFAFA]'
          }`}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <nav
          aria-label={isEs ? 'Elegir tarjeta' : 'Choose slide'}
          className="flex items-center gap-1"
        >
          {MOTIVATIONAL_CARDS.map((card, i) => {
            const isSelected = active === i;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={
                  isEs
                    ? `Ir a tarjeta ${i + 1}: ${card.titleEs}`
                    : `Go to slide ${i + 1}: ${card.titleEn}`
                }
                aria-current={isSelected ? 'true' : undefined}
                className="min-w-[36px] min-h-[44px] flex items-center justify-center bg-transparent border-0 cursor-pointer p-0"
              >
                <span
                  className={`block rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'w-7 h-2.5 bg-[#E09B30] ring-2 ring-[#091326]/20'
                      : isDark
                      ? 'w-2.5 h-2.5 bg-[#A7C7E7]/50'
                      : 'w-2.5 h-2.5 bg-[#1A3153]/40'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        <button
          id="motivation-carousel-next-btn"
          type="button"
          onClick={goNext}
          aria-label={isEs ? 'Siguiente oportunidad' : 'Next opportunity'}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg border ${
            isDark
              ? 'bg-[#132642]/95 text-[#FAFAFA] border-[#A7C7E7]/35 hover:bg-[#E09B30] hover:text-[#091326]'
              : 'bg-[#FFFFFF] text-[#1A3153] border-[#1A3153]/25 hover:bg-[#1A3153] hover:text-[#FAFAFA]'
          }`}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
};

export default MotivationalShowcase;
