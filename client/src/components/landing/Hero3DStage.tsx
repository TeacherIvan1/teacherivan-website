import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Mic, ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import gsap from 'gsap';
import { ChibiAvatar } from '../ChibiAvatar';
import { useTranslation } from '../../modules/i18n/languageStore';
import { getGeneralWhatsAppUrl, handleWhatsAppClick } from '../../utils/whatsapp';

// Desktop-only lazy-loaded Three.js / img2threejs 3D AI Voice Waveform Slab
const LazyHeroVoiceSlab3D = React.lazy(() => import('../HeroVoiceSlab3D'));

interface Hero3DStageProps {
  onStartVoiceTest: () => void;
}

/**
 * Pure CSS + SVG static/mobile/reduced-motion fallback slab (0 KB of Three.js downloaded on mobile)
 */
export const HeroVoiceSlabStaticFallback: React.FC = () => {
  const heights = [26, 42, 64, 52, 78, 92, 68, 86, 94, 72, 84, 60, 76, 48, 36, 24];
  return (
    <div
      id="hero-voice-slab-static-fallback"
      data-testid="hero-voice-slab-static-fallback"
      className="w-full h-[92px] rounded-xl bg-[#091326] border border-[#A7C7E7]/30 px-3 py-2 flex items-center justify-between gap-1 shadow-inner"
      aria-hidden="true"
    >
      {heights.map((h, idx) => {
        const isAmber = idx % 3 !== 2;
        return (
          <span
            key={idx}
            className="flex-1 rounded-full transition-transform duration-300"
            style={{
              height: `${Math.max(18, Math.round((h / 100) * 64))}px`,
              backgroundColor: isAmber ? '#E09B30' : '#A7C7E7',
              opacity: isAmber ? 0.95 : 0.78,
            }}
          />
        );
      })}
    </div>
  );
};

export const Hero3DStage: React.FC<Hero3DStageProps> = ({ onStartVoiceTest }) => {
  const { isEs } = useTranslation();
  const slabRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Strict Desktop (>= 1024px) & No-Reduced-Motion Gate for lazy 3D chunk
  const [canMountDesktop3D, setCanMountDesktop3D] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return (
      window.matchMedia('(min-width: 1024px)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const desktopMq = window.matchMedia('(min-width: 1024px)');
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const evaluateGate = () => {
      setCanMountDesktop3D(desktopMq.matches && !reducedMq.matches);
    };

    evaluateGate();
    desktopMq.addEventListener('change', evaluateGate);
    reducedMq.addEventListener('change', evaluateGate);

    return () => {
      desktopMq.removeEventListener('change', evaluateGate);
      reducedMq.removeEventListener('change', evaluateGate);
    };
  }, []);

  // GSAP quickTo 3D cursor tilt (±6deg) strictly guarded on Desktop (>= 1024px)
  useEffect(() => {
    const slab = slabRef.current;
    const container = containerRef.current;
    if (!slab || !container) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const setRotateX = gsap.quickTo(slab, 'rotationX', { duration: 0.5, ease: 'power2.out' });
      const setRotateY = gsap.quickTo(slab, 'rotationY', { duration: 0.5, ease: 'power2.out' });

      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        setRotateX(-y * 12); // ±6 deg
        setRotateY(x * 12);  // ±6 deg
      };

      const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
      };

      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section
      id="chapter-0-hero"
      className="relative w-full pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-12 border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-primary)] select-none overflow-hidden"
    >
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column (col-span-5): Narrative & Action */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-montserrat font-bold tracking-[0.15em] text-[#9A6515] dark:text-[#E09B30] uppercase whitespace-nowrap">
            <span className="w-8 h-[1px] bg-[#9A6515]/50 dark:bg-[#E09B30]/50 inline-block" />
            <span className="whitespace-nowrap">
              {isEs ? 'MÉTODO BICRÓNICO • COACHING 1-A-1 + IA 24/7' : 'BICHRONOUS METHOD • 1-ON-1 COACHING + 24/7 AI'}
            </span>
          </div>

          {/* Two-Tone H1 */}
          <h1 className="font-montserrat font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.08] tracking-tight">
            <span className="text-[var(--text-primary)] block">
              {isEs ? 'Hablá inglés con fluidez' : 'Speak English fluently'}
            </span>
            <span className="text-[var(--text-secondary)] block font-bold">
              {isEs ? 'y sin bloqueos al conversar.' : 'without freezing in conversations.'}
            </span>
          </h1>

          {/* Concise Subcopy */}
          <p className="font-sans text-base sm:text-lg text-[var(--text-secondary)] max-w-[44ch] leading-relaxed">
            {isEs
              ? 'Mentoría 1-a-1 en vivo (>75% habla activa) + Laboratorio de Voz 24/7 con Teacher Ivan y Emma.'
              : 'Live 1-on-1 human coaching (>75% student talking time) + 24/7 Voice Lab with Teacher Ivan & Emma.'}
          </p>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2">
            <button
              id="hero-primary-cta-btn"
              type="button"
              onClick={onStartVoiceTest}
              className="btn-3d-amber w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full text-xs sm:text-sm font-montserrat font-bold uppercase tracking-wider cursor-pointer shadow-lg whitespace-nowrap h-12"
            >
              <Mic size={18} />
              <span>{isEs ? 'PROBAR MI NIVEL EN 90S GRATIS →' : 'TEST MY LEVEL IN 90S FREE →'}</span>
            </button>

            <a
              id="hero-direct-whatsapp-btn"
              href={getGeneralWhatsAppUrl(isEs ? 'es' : 'en')}
              onClick={() => handleWhatsAppClick('hero')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-montserrat font-bold text-[#1A3153] dark:text-[#FAFAFA] bg-white dark:bg-[#132642] hover:bg-slate-50 dark:hover:bg-[#1E3A5F] border border-[var(--border-hairline)] transition-all cursor-pointer shadow-sm whitespace-nowrap h-12"
            >
              <MessageCircle size={17} className="text-[#E09B30]" />
              <span>WhatsApp +591 72878330</span>
            </a>
          </div>

          {/* Trust Microcopy */}
          <p className="text-[13px] text-[var(--text-secondary)] font-medium flex items-center gap-2 pt-1">
            <CheckCircle2 size={15} className="text-[#10B981] shrink-0" />
            <span>
              {isEs
                ? 'Diagnóstico hablado gratuito de 90 segundos • Sin tarjeta • Reporte MCER al instante.'
                : 'Free 90-second spoken diagnostic • No credit card required • Instant CEFR report.'}
            </span>
          </p>
        </div>

        {/* Right Column (col-span-7): Lit 3D Glassmorphic AI Voice Waveform Slab */}
        <div
          ref={containerRef}
          className="lg:col-span-7 flex justify-center items-center w-full"
          style={{ perspective: 1400 }}
        >
          <div
            ref={slabRef}
            className="w-full max-w-[560px] rounded-[28px] p-6 sm:p-7 relative transition-shadow duration-300 transform-gpu"
            style={{
              background: 'var(--glass-slab-bg)',
              border: '1.5px solid rgba(167, 199, 231, 0.30)',
              boxShadow: 'var(--shadow-slab-3d)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Top-right subtle radial Warm Amber rim light */}
            <div
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(224, 155, 48, 0.22) 0%, transparent 70%)',
              }}
            />

            {/* Top Status Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--rule-dark)] text-xs text-[#A7C7E7] font-montserrat font-bold uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981] shrink-0" />
                <span className="text-[#FAFAFA] whitespace-nowrap text-[10px] sm:text-xs">VOICE LAB 24/7 • EN VIVO</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-[#A7C7E7]/15 text-[#A7C7E7] border border-[#A7C7E7]/30 text-[10px] whitespace-nowrap">
                CEFR A1 → C1
              </span>
            </div>

            {/* Center Dual Stage: Ivan & Emma flanking 16-Bar 3D Acoustic Waveform Slab */}
            <div className="py-6 flex items-center justify-between gap-4">
              {/* Ivan */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-navy-surface/80 border border-current/20 flex items-center justify-center overflow-hidden p-1 shadow-md">
                  <ChibiAvatar character="ivan" state="speaking" className="w-24 h-24" />
                </div>
                <span className="text-[11px] font-montserrat font-bold text-[#FAFAFA]">Teacher Ivan</span>
                <span className="text-[9px] text-amber-brand font-inter font-semibold uppercase">
                  {isEs ? 'Coach 1-a-1' : '1-on-1 Coach'}
                </span>
              </div>

              {/* Desktop Lazy 3D img2threejs Waveform Slab vs Mobile/Reduced-Motion Static Fallback */}
              <div className="flex-1 flex flex-col items-center justify-center px-2 min-w-0">
                {canMountDesktop3D ? (
                  <Suspense fallback={<HeroVoiceSlabStaticFallback />}>
                    <LazyHeroVoiceSlab3D />
                  </Suspense>
                ) : (
                  <HeroVoiceSlabStaticFallback />
                )}
                <span className="text-xs text-[#A7C7E7] font-inter font-semibold tracking-widest uppercase mt-1.5">
                  {isEs ? 'AUDIO EN VIVO' : 'LIVE VOICE'}
                </span>
              </div>

              {/* Emma */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-navy-surface/80 border border-current/20 flex items-center justify-center overflow-hidden p-1 shadow-md">
                  <ChibiAvatar character="emma" state="listening" className="w-24 h-24" />
                </div>
                <span className="text-[11px] font-montserrat font-bold text-[#FAFAFA]">Emma IA</span>
                <span className="text-[9px] text-[#A7C7E7] font-inter font-semibold uppercase">
                  {isEs ? 'Tutora IA 24/7' : '24/7 AI Tutor'}
                </span>
              </div>
            </div>

            {/* Floating Pop-Out Proof Pill (translateZ: 36px) */}
            <div
              className="mt-4 p-3.5 rounded-2xl bg-[#091326]/90 border border-[#E09B30]/40 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-[var(--shadow-float-dark)]"
              style={{
                transform: 'translateZ(36px)',
              }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-center sm:text-left">
                <span className="text-xs sm:text-sm font-bold text-red-300 line-through">
                  &ldquo;I have 25 years&rdquo;
                </span>
                <ArrowRight size={12} className="text-amber-brand hidden sm:inline" />
                <span className="text-xs sm:text-sm font-bold text-amber-brand inline-flex items-center gap-1">
                  <span>&ldquo;I am 25 years old&rdquo;</span>
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-brand/20 text-amber-brand text-[10px] font-montserrat font-extrabold uppercase tracking-wider whitespace-nowrap tabular-nums">
                &gt;75% HABLA ACTIVA
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
