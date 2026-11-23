import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Mic, Activity, Award, Volume2, Clock, Zap } from 'lucide-react';
import { RiggedCharacter } from '../RiggedCharacter';
import { useTranslation } from '../../modules/i18n/languageStore';

interface HeroCanvasStageProps {
  onStartVoiceTest: () => void;
}

export const HeroCanvasStage: React.FC<HeroCanvasStageProps> = ({ onStartVoiceTest }) => {
  const { isEs } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3D Tilt & Specular Sheen State
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [sheen, setSheen] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [isDesktop, setIsDesktop] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Cycle through 3 reload variations (persisted in sessionStorage)
  const [activeVariant, setActiveVariant] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('ti_hero_variant');
        if (stored !== null) {
          const next = (parseInt(stored, 10) + 1) % 3;
          sessionStorage.setItem('ti_hero_variant', next.toString());
          return next;
        }
        const initial = Math.floor(Math.random() * 3);
        sessionStorage.setItem('ti_hero_variant', initial.toString());
        return initial;
      } catch {
        return 0;
      }
    }
    return 0;
  });

  // Track cursor position for canvas particle reaction
  const mousePos = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // Responsive & reduced motion listener
  useEffect(() => {
    const checkEnvironment = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setPrefersReducedMotion(
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    };
    checkEnvironment();
    window.addEventListener('resize', checkEnvironment);
    return () => window.removeEventListener('resize', checkEnvironment);
  }, []);

  // Halftone / Dither interactive Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 420);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Grid parameters for halftone / dither points
    const step = 20;
    let time = 0;

    const render = () => {
      time += 0.025;
      ctx.clearRect(0, 0, width, height);

      const mx = mousePos.current.active ? mousePos.current.x : width / 2;
      const my = mousePos.current.active ? mousePos.current.y : height / 2;

      for (let x = step / 2; x < width; x += step) {
        for (let y = step / 2; y < height; y += step) {
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Subtle wave displacement & proximity pull
          const wave = Math.sin(time + x * 0.04 + y * 0.04) * 2;
          const maxInfluence = 120;
          let radius = 1.2;
          let alpha = 0.18;
          let color = '#A7C7E7'; // Soft denim

          if (dist < maxInfluence) {
            const factor = 1 - dist / maxInfluence;
            radius = 1.2 + factor * 2.8;
            alpha = 0.25 + factor * 0.65;
            color = factor > 0.5 ? '#E09B30' : '#A7C7E7'; // Warm amber on focus
          }

          ctx.beginPath();
          ctx.arc(x + wave * 0.4, y + wave * 0.4, Math.max(0.5, radius), 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mousePos.current = { x, y, active: true };

    if (isDesktop && !prefersReducedMotion) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = -((y - centerY) / centerY) * 7;
      const tiltY = ((x - centerX) / centerX) * 7;
      setTilt({
        x: Math.max(-7, Math.min(7, tiltX)),
        y: Math.max(-7, Math.min(7, tiltY)),
      });
      setSheen({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.18,
      });
    }
  };

  const handleMouseLeave = () => {
    mousePos.current.active = false;
    setTilt({ x: 0, y: 0 });
    setSheen((prev) => ({ ...prev, opacity: 0 }));
  };

  const enable3D = isDesktop && !prefersReducedMotion;

  return (
    <div className="perspective-1400 relative w-full max-w-lg mx-auto py-2">
      {/* 3 Floating 3D Depth Badges */}
      {/* Badge 1: >75% Habla Activa */}
      <div
        className="hidden sm:inline-flex items-center gap-1.5 absolute -top-2 left-0 sm:-left-3 z-30 px-3 py-1.5 rounded-full bg-[#1A3153]/95 border border-[#E09B30]/60 text-[#E09B30] text-[11px] font-montserrat font-extrabold uppercase tracking-wider shadow-2xl backdrop-blur-md pointer-events-none transition-transform duration-300"
        style={{
          transform: enable3D ? 'translateZ(40px)' : 'none',
        }}
      >
        <Clock size={13} className="text-[#E09B30]" />
        <span>{isEs ? '>75% HABLA ACTIVA' : '>75% ACTIVE TALK TIME'}</span>
      </div>

      {/* Badge 2: Voice Lab 24/7 */}
      <div
        className="hidden sm:inline-flex items-center gap-1.5 absolute -top-2 right-0 sm:-right-3 z-30 px-3 py-1.5 rounded-full bg-[#1A3153]/95 border border-[#10b981]/50 text-[#10b981] text-[11px] font-montserrat font-extrabold uppercase tracking-wider shadow-2xl backdrop-blur-md pointer-events-none transition-transform duration-300"
        style={{
          transform: enable3D ? 'translateZ(30px)' : 'none',
        }}
      >
        <Zap size={13} className="text-[#10b981]" />
        <span>VOICE LAB 24/7</span>
      </div>

      {/* Badge 3: Recasting en Vivo */}
      <div
        className="hidden sm:inline-flex items-center gap-1.5 absolute -bottom-2.5 left-4 z-30 px-3 py-1.5 rounded-full bg-[#1A3153]/95 border border-[#A7C7E7]/50 text-[#A7C7E7] text-[10px] font-montserrat font-extrabold uppercase tracking-wider shadow-2xl backdrop-blur-md pointer-events-none transition-transform duration-300"
        style={{
          transform: enable3D ? 'translateZ(35px)' : 'none',
        }}
      >
        <Sparkles size={12} className="text-[#E09B30]" />
        <span>{isEs ? 'CORRECCIÓN AL INSTANTE' : 'INSTANT CORRECTIONS'}</span>
      </div>

      {/* Main 3D Tilt Stage Card */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: enable3D ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : 'none',
          transformStyle: 'preserve-3d',
          transition:
            tilt.x === 0 && tilt.y === 0
              ? 'transform 0.5s var(--ease-soft-land)'
              : 'transform 0.1s ease-out',
        }}
        className="relative w-full rounded-3xl bg-gradient-to-b from-[#1A3153]/95 via-[#12223a]/95 to-[#12223a]/95 border border-[#A7C7E7]/30 shadow-2xl p-6 sm:p-7 overflow-hidden backdrop-blur-md group"
      >
        {/* Dynamic Specular Sheen Follow Layer */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${sheen.x}% ${sheen.y}%, rgba(224, 155, 48, ${sheen.opacity}) 0%, transparent 60%)`,
          }}
        />

        {/* Interactive Halftone / Dither Shader Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none w-full h-full opacity-60 transition-opacity group-hover:opacity-85"
        />

        {/* Top Architectural Metadata Strip */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-[#A7C7E7]/20 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#A7C7E7]">
              SYS.HERO // SCENE 0{activeVariant + 1}
            </span>
          </div>

          {/* Variant Manual Selector Pill */}
          <div className="flex items-center gap-1 bg-[#1A3153] border border-[#A7C7E7]/30 rounded-full p-0.5">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveVariant(idx);
                  sessionStorage.setItem('ti_hero_variant', idx.toString());
                }}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeVariant === idx
                    ? 'bg-[#E09B30] text-[#1A3153]'
                    : 'text-[#A7C7E7] hover:text-[#FAFAFA]'
                }`}
                title={`Switch to Scene ${idx + 1}`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCENE VARIATION 1: Live 1-on-1 Coaching (Teacher Ivan Rig + Live Wave)     */}
        {/* ========================================================================= */}
        {activeVariant === 0 && (
          <div className="relative z-10 flex flex-col items-center animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E09B30]/15 border border-[#E09B30]/30 text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider mb-4">
              <Mic size={13} />
              <span>{isEs ? '1. Coaching 1-a-1 en Vivo' : '1. Live 1-on-1 Coaching'}</span>
            </div>

            {/* Teacher Ivan Rigged Mascot */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#1A3153] border-2 border-[#E09B30] p-2 shadow-xl flex items-center justify-center transform group-hover:scale-105 transition-transform overflow-hidden mb-3">
              <RiggedCharacter
                persona="teacher-ivan"
                state="speaking"
                className="w-full h-full"
                alt="Teacher Ivan Live Coach"
              />
            </div>

            <span className="font-montserrat font-bold text-sm text-[#FAFAFA] mb-1">
              Teacher Ivan
            </span>
            <span className="text-[11px] font-mono text-[#A7C7E7] mb-4">
              {isEs ? 'Mentor Pedagógico • 75%+ Habla del Alumno' : 'Pedagogical Mentor • 75%+ Student Talk'}
            </span>

            {/* Live Audio Reactive Waveform */}
            <div className="w-full py-3 px-4 rounded-xl bg-[#1A3153]/80 border border-[#A7C7E7]/25 flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <Volume2 size={15} className="text-[#E09B30]" />
                <span className="text-xs font-inter text-[#FAFAFA]">
                  "Tell me about your target role..."
                </span>
              </div>
              <div className="flex items-center gap-1 h-6" aria-hidden="true">
                {[12, 22, 16, 26, 18, 24, 14].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-[#E09B30]"
                    style={{
                      height: `${h}px`,
                      animation: `soundWavePulse 1.2s ease-in-out infinite alternate ${i * 0.12}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Interactive Prompt */}
            <button
              type="button"
              onClick={onStartVoiceTest}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#E09B30]/20"
            >
              <span>{isEs ? 'Iniciar Diagnóstico de Voz (90s) →' : 'Start 90s Spoken Diagnostic →'}</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENE VARIATION 2: 24/7 AI Recast Wave (Dual Rig: Ivan & Emma)             */}
        {/* ========================================================================= */}
        {activeVariant === 1 && (
          <div className="relative z-10 flex flex-col items-center animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A7C7E7]/20 border border-[#A7C7E7]/40 text-[#A7C7E7] text-xs font-montserrat font-bold uppercase tracking-wider mb-4">
              <Activity size={13} className="text-[#E09B30]" />
              <span>{isEs ? '2. Corrección 24/7 con IA' : '2. 24/7 AI Correction Wave'}</span>
            </div>

            {/* Dual Chibi Avatars with Sound Bridge */}
            <div className="flex items-center justify-center gap-4 py-2 mb-3">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1A3153] border border-[#E09B30] p-1.5 shadow-md flex items-center justify-center overflow-hidden">
                  <RiggedCharacter
                    persona="teacher-ivan"
                    state="speaking"
                    className="w-full h-full"
                    alt="Teacher Ivan"
                  />
                </div>
                <span className="text-[11px] font-montserrat font-bold text-[#E09B30] mt-1.5">
                  Teacher Ivan
                </span>
              </div>

              {/* Connecting Audio Particles */}
              <div className="flex items-center gap-1 h-10 px-1" aria-hidden="true">
                {[14, 24, 38, 20, 32, 40, 22, 16].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 rounded-full bg-gradient-to-t from-[#A7C7E7] to-[#E09B30]"
                    style={{
                      height: `${h}px`,
                      animation: `soundWavePulse 1.0s ease-in-out infinite alternate ${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1A3153] border border-[#A7C7E7] p-1.5 shadow-md flex items-center justify-center overflow-hidden">
                  <RiggedCharacter
                    persona="emma"
                    state="listening"
                    className="w-full h-full"
                    alt="Emma Coach"
                  />
                </div>
                <span className="text-[11px] font-montserrat font-bold text-[#A7C7E7] mt-1.5">
                  Emma Coach
                </span>
              </div>
            </div>

            {/* Real-time Recast Demonstration Box */}
            <div className="w-full py-2.5 px-3.5 rounded-xl bg-[#1A3153]/90 border border-[#A7C7E7]/25 text-left mb-4 space-y-1">
              <div className="text-[10px] font-mono text-[#A7C7E7]">
                {isEs ? 'ALUMNO:' : 'LEARNER:'} <span className="text-[#FAFAFA]">"I am agree with your proposal..."</span>
              </div>
              <div className="text-[10px] font-mono text-[#E09B30]">
                {isEs ? 'CORRECCIÓN IA:' : 'AI CORRECTION:'} <span className="text-[#10b981]">"Exactly, you agree with the proposal! Tell me..."</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartVoiceTest}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#E09B30]/20"
            >
              <span>{isEs ? 'Hablar con Emma & Ivan Ahora →' : 'Speak with Emma & Ivan Now →'}</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCENE VARIATION 3: CEFR B2 / IELTS Mastery Scorecard                      */}
        {/* ========================================================================= */}
        {activeVariant === 2 && (
          <div className="relative z-10 flex flex-col items-center animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-xs font-montserrat font-bold uppercase tracking-wider mb-4">
              <Award size={13} />
              <span>{isEs ? '3. Diagnóstico CEFR & IELTS' : '3. CEFR B2/IELTS Mastery'}</span>
            </div>

            {/* Rigged Avatar + CEFR Score Display */}
            <div className="flex items-center justify-between w-full bg-[#1A3153]/80 border border-[#A7C7E7]/25 rounded-2xl p-3.5 mb-4">
              <div className="w-16 h-16 rounded-xl bg-[#12223a] border border-[#E09B30] p-1 overflow-hidden shrink-0">
                <RiggedCharacter
                  persona="teacher-ivan"
                  state="idle"
                  className="w-full h-full"
                  alt="Teacher Ivan"
                />
              </div>

              <div className="flex-1 px-3 text-left">
                <span className="text-[10px] font-mono text-[#A7C7E7] uppercase block">
                  {isEs ? 'Nivel Diagnosticado:' : 'Target CEFR:'}
                </span>
                <span className="font-montserrat font-extrabold text-base text-[#FAFAFA] block">
                  CEFR B2.2 / IELTS 7.0
                </span>
                <span className="text-[11px] text-[#10b981] font-semibold flex items-center gap-1">
                  Ready for Technical Interviews
                </span>
              </div>
            </div>

            {/* Metric Radar Bars */}
            <div className="w-full space-y-2 mb-4 text-left">
              <div>
                <div className="flex justify-between text-[11px] font-inter text-[#A7C7E7] mb-1">
                  <span>Fluency & Coherence</span>
                  <span className="font-mono text-[#FAFAFA] font-bold">82%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1A3153] rounded-full overflow-hidden">
                  <div className="h-full bg-[#E09B30] rounded-full w-[82%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-inter text-[#A7C7E7] mb-1">
                  <span>Grammar Range & Natural Corrections</span>
                  <span className="font-mono text-[#FAFAFA] font-bold">78%</span>
                </div>
                <div className="h-1.5 w-full bg-[#1A3153] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10b981] rounded-full w-[78%]" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartVoiceTest}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] font-montserrat font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#E09B30]/20"
            >
              <span>{isEs ? 'Obtener mi Diagnóstico CEFR (90s) →' : 'Get My CEFR Diagnostic (90s) →'}</span>
            </button>
          </div>
        )}

        {/* Bottom Subtle Helper Text */}
        <div className="relative z-10 mt-3 pt-3 border-t border-[#A7C7E7]/15 flex items-center justify-center gap-1.5 text-[11px] font-inter text-[#A7C7E7]">
          <Sparkles size={12} className="text-[#E09B30]" />
          <span>
            {isEs
              ? 'Recarga la página para ver variaciones del sistema'
              : 'Reload page to cycle through system variations'}
          </span>
        </div>
      </div>
    </div>
  );
};
