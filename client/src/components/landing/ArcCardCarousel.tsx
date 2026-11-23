import React, { useState, useRef } from 'react';
import { useTranslation } from '../../modules/i18n/languageStore';

export interface TestimonialItem {
  id: string;
  quoteEs: string;
  quoteEn: string;
  studentName: string;
  tagEs: string;
  tagEn: string;
}

export const STUDENT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'quote-1',
    quoteEs:
      '“Dejé de traducir palabra por palabra en mi cabeza. Después de tres semanas con Emma 24/7 y Teacher Ivan, hablo con reflejos naturales.”',
    quoteEn:
      '“I stopped translating word-for-word in my head. After three weeks with Emma 24/7 and Teacher Ivan, I speak with automatic reflexes.”',
    studentName: 'Camila R. • La Paz',
    tagEs: 'B1 → B2 • Fluidez sin Traducción Mental',
    tagEn: 'B1 → B2 • Zero Mental Translation',
  },
  {
    id: 'quote-2',
    quoteEs:
      '“Aprobé mi entrevista de ingeniería para una startup remota en EE. UU. Practicar arquitectura de sistemas a las 11 PM con Emma fue decisivo.”',
    quoteEn:
      '“I passed my senior engineering interview for a US remote startup. Rehearsing system design at 11 PM with Emma made all the difference.”',
    studentName: 'Rodrigo M. • Santa Cruz',
    tagEs: 'B2 → C1 • Entrevista Tech Remota',
    tagEn: 'B2 → C1 • Remote Tech Interview',
  },
  {
    id: 'quote-3',
    quoteEs:
      '“Me daba pánico equivocarme frente a grupos grandes. En el Laboratorio de Voz 24/7 perdí la vergüenza antes de mis sesiones 1-a-1.”',
    quoteEn:
      '“I used to freeze speaking in front of big groups. In the 24/7 Voice Lab I lost all embarrassment before my live 1-on-1 coaching.”',
    studentName: 'Valeria T. • Sucre',
    tagEs: 'A2 → B1 • Confianza Conversacional',
    tagEn: 'A2 → B1 • Conversational Confidence',
  },
  {
    id: 'quote-4',
    quoteEs:
      '“El recasting en vivo de Teacher Ivan corrige tu frase al instante sin cortar tu idea. Hablás más del 75% de toda la hora.”',
    quoteEn:
      '“Teacher Ivan’s live recasting polishes your phrasing on the spot without breaking your flow. You speak over 75% of every hour.”',
    studentName: 'Andrés V. • Cochabamba',
    tagEs: 'Plan Pro 580 BOB • >75% Habla Activa',
    tagEn: 'Pro Plan 580 BOB • >75% Active Speaking',
  },
  {
    id: 'quote-5',
    quoteEs:
      '“Los micro-sprints de 10 minutos en Mi Ruta caben perfecto en mi agenda laboral. Llevo 5 semanas seguidas sin fallar un solo día.”',
    quoteEn:
      '“The 10-minute daily micro-sprints in My Path fit my work schedule effortlessly. I’ve kept a 5-week streak without missing a day.”',
    studentName: 'Mariana L. • Lima',
    tagEs: '10 min/día • Hábito Semanal D1–D5',
    tagEn: '10 min/day • Weekly Habit Sprint D1–D5',
  },
  {
    id: 'quote-6',
    quoteEs:
      '“El generador de recursos creó guiones exactos para mi defensa de beca internacional y logré Banda 7.5 en IELTS Speaking.”',
    quoteEn:
      '“The custom resource studio built exact scripts for my international scholarship panel and helped me score Band 7.5 in IELTS Speaking.”',
    studentName: 'Diego S. • Bogotá',
    tagEs: 'IELTS 7.5 • Beca Internacional',
    tagEn: 'IELTS 7.5 • International Scholarship',
  },
  {
    id: 'quote-7',
    quoteEs:
      '“Planes claros en bolivianos sin contratos ocultos. Empecé con el diagnóstico de 90 segundos gratis y hoy lidero reuniones en inglés.”',
    quoteEn:
      '“Transparent local plans with zero hidden contracts. I started with the free 90-second diagnostic and now lead meetings in English.”',
    studentName: 'Fernanda C. • Tarija',
    tagEs: 'Plan Executive 850 BOB • Liderazgo Global',
    tagEn: 'Executive Plan 850 BOB • Global Leadership',
  },
];

export interface ArcCardCarouselProps {
  isMobile?: boolean;
  items?: TestimonialItem[];
}

export const ArcCardCarousel: React.FC<ArcCardCarouselProps> = ({
  isMobile = false,
  items = STUDENT_TESTIMONIALS,
}) => {
  const { isEs } = useTranslation();
  const [active, setActive] = useState<number>(() => Math.floor(items.length / 2)); // Starts at index 3
  const touchStartXRef = useRef<number | null>(null);

  const count = items.length;
  const half = Math.floor(count / 2);

  // Exact Auragate Arc Geometry Constants
  const cardW = isMobile ? 230 : 300;
  const cardH = isMobile ? 320 : 420;
  const stepX = isMobile ? 170 : 295;
  const dropY = isMobile ? 34 : 52;
  const tilt = isMobile ? 7 : 8;
  const containerH = isMobile ? 460 : 560;
  const centerBump = isMobile ? 22 : 30;
  const cardRadius = isMobile ? 22 : 28;
  const navBtnSize = isMobile ? 42 : 46;

  const stepCarousel = (dir: -1 | 1) => {
    setActive((prev) => (prev + dir + count) % count);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepCarousel(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepCarousel(1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || !e.changedTouches || e.changedTouches.length === 0) {
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(deltaX) > 36) {
      stepCarousel(deltaX < 0 ? 1 : -1);
    }
  };

  return (
    <div
      id="arc-card-carousel"
      data-testid="arc-card-carousel"
      data-active-index={active}
      tabIndex={0}
      role="region"
      aria-label={isEs ? 'Carrusel de testimonios de estudiantes' : 'Student testimonials carousel'}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        height: containerH,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: isMobile ? 12 : 20,
        marginBottom: 56,
        outline: 'none',
        userSelect: 'none',
      }}
    >
      {items.map((item, idx) => {
        // Signed wrapped position in [-half, +half]
        let pos = (idx - active) % count;
        if (pos > half) pos -= count;
        if (pos < -half) pos += count;

        const abs = Math.abs(pos);
        const isCenter = pos === 0;

        const tx = pos * stepX;
        const ty = abs * dropY + (isCenter ? centerBump : 0);
        const rot = pos * tilt;
        const opacity = isCenter ? 1 : Math.max(0, 0.6 - (abs - 1) * 0.2);
        const zIndex = 100 - abs;

        return (
          <div
            key={item.id}
            data-testid={`arc-card-${idx}`}
            data-is-center={isCenter ? 'true' : 'false'}
            onClick={() => {
              if (!isCenter) setActive(idx);
            }}
            style={{
              position: 'absolute',
              width: cardW,
              height: cardH,
              borderRadius: cardRadius,
              padding: isMobile ? '22px 20px' : '30px 26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transform: `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg)`,
              opacity,
              zIndex,
              pointerEvents: isCenter ? 'auto' : 'none',
              transition:
                'transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease, box-shadow 0.55s ease',
              ...(isCenter
                ? {
                    background: '#FAFAFA',
                    border: '1px solid rgba(255,255,255,0.75)',
                    boxShadow:
                      '0 8px 24px rgba(9,19,38,0.18), 0 0 50px rgba(224,155,48,0.28), 0 0 90px rgba(167,199,231,0.35)',
                  }
                : {
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(167,199,231,0.18) 100%)',
                    backdropFilter: 'blur(18px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(18px) saturate(140%)',
                    border: '1px solid rgba(255,255,255,0.28)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.45)',
                  }),
            }}
          >
            {/* Top Subtle Accent Mark */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: "'Montserrat', 'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: isCenter ? '#9A6515' : 'rgba(250,250,250,0.85)',
                }}
              >
                {isEs ? 'HISTORIA REAL' : 'REAL STORY'}
              </span>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isCenter ? '#E09B30' : 'rgba(250,250,250,0.55)',
                }}
              />
            </div>

            {/* Center Quote Text */}
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: isMobile ? 13.5 : 15.5,
                lineHeight: 1.55,
                color: isCenter ? '#1A3153' : 'rgba(250,250,250,0.90)',
                margin: 'auto 0',
              }}
            >
              {isEs ? item.quoteEs : item.quoteEn}
            </p>

            {/* Bottom Student Name & Metadata Tag */}
            <div
              style={{
                borderTop: isCenter
                  ? '1px solid rgba(26,49,83,0.12)'
                  : '1px solid rgba(255,255,255,0.22)',
                paddingTop: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "'Montserrat', 'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? 12 : 13,
                  color: isCenter ? '#1A3153' : '#FAFAFA',
                }}
              >
                {item.studentName}
              </span>
              <span
                style={{
                  fontFamily: "'Montserrat', 'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 10.5,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isCenter ? '#9A6515' : 'rgba(250,250,250,0.80)',
                }}
              >
                {isEs ? item.tagEs : item.tagEn}
              </span>
            </div>
          </div>
        );
      })}

      {/* Nav Buttons (bottom: -40px, centered, gap: 10px, 46px / 42px mobile) */}
      <div
        style={{
          position: 'absolute',
          bottom: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 120,
        }}
      >
        <button
          id="arc-carousel-prev-btn"
          data-testid="arc-carousel-prev-btn"
          type="button"
          onClick={() => stepCarousel(-1)}
          aria-label={isEs ? 'Testimonio anterior' : 'Previous testimonial'}
          style={{
            width: navBtnSize,
            height: navBtnSize,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.35)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, background 0.2s ease',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FAFAFA"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(250,250,250,0.65))' }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          id="arc-carousel-next-btn"
          data-testid="arc-carousel-next-btn"
          type="button"
          onClick={() => stepCarousel(1)}
          aria-label={isEs ? 'Siguiente testimonio' : 'Next testimonial'}
          style={{
            width: navBtnSize,
            height: navBtnSize,
            borderRadius: '50%',
            background: '#FAFAFA',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 6px 18px rgba(9,19,38,0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, background 0.2s ease',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1A3153"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ArcCardCarousel;
