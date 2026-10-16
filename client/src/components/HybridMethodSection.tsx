import React from 'react';
import { UserCheck, Bot, BarChart3, CheckCircle2, MessageSquareQuote, ArrowUpRight } from 'lucide-react';
import { useConversationStore } from '../modules/conversation/conversationStore';

export const HybridMethodSection: React.FC = () => {
  const startSession = useConversationStore((s) => s.startSession);
  const status = useConversationStore((s) => s.status);

  const handleStartTutor = () => {
    const el = document.getElementById('start-session-btn');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (status !== 'connected') {
        startSession();
      }
    }
  };

  return (
    <section
      id="hybrid-method-section"
      className="bg-[#FAFAFA] py-16 md:py-24 px-6 border-t border-b border-[#A7C7E7]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A7C7E7]/20 border border-[#A7C7E7] mb-4">
            <span className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#1A3153]">
              The Pedagogical Breakthrough
            </span>
          </div>

          <h2 className="font-montserrat font-extrabold text-3xl sm:text-4xl text-[#1A3153] mb-5 tracking-tight">
            The Hybrid Method: Teacher Ivan + 24/7 AI Voice Tutor
          </h2>

          <p className="font-inter text-base sm:text-lg text-[#4A5568] leading-relaxed">
            Traditional English apps only test pre-recorded answers. Pure human tutoring is limited to once or twice a week. Our <strong className="text-[#1A3153]">Hybrid Model</strong> combines human teaching excellence with unlimited, zero-anxiety AI voice immersion.
          </p>
        </div>

        {/* 3 Core Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Pillar 1: Teacher Ivan */}
          <div className="bg-[#FAFAFA] border border-[#A7C7E7] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#1A3153] text-[#FAFAFA] flex items-center justify-center mb-6 shadow-md">
                <UserCheck size={24} className="text-[#E09B30]" />
              </div>

              <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30] mb-2">
                Pillar 01 • Human Mentorship
              </div>

              <h3 className="font-montserrat font-bold text-xl text-[#1A3153] mb-4">
                Teacher Ivan 1-on-1
              </h3>

              <p className="font-inter text-sm text-[#4A5568] leading-relaxed mb-6">
                Deep pedagogical diagnosis to unlock your confidence, overcome fossilized pronunciation habits, and map out your personalized CEFR or IELTS preparation roadmap.
              </p>

              <ul className="space-y-3 text-xs text-[#4A5568]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                  <span>Targeted accent and intonation coaching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                  <span>Nuanced exam tactics for IELTS Speaking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                  <span>Emotional empathy and fear elimination</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[#A7C7E7]/50 text-xs font-montserrat font-semibold uppercase tracking-[0.15em] text-[#1A3153]">
              Strategy &amp; Guidance
            </div>
          </div>

          {/* Pillar 2: 24/7 AI Voice Immersion */}
          <div className="bg-[#FAFAFA] border-2 border-[#E09B30] rounded-2xl p-8 shadow-md relative flex flex-col justify-between transform md:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E09B30] text-[#1A3153] px-3.5 py-0.5 rounded-full font-montserrat font-extrabold text-[10px] uppercase tracking-[0.15em]">
              Interactive Centerpiece
            </div>

            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E09B30] text-[#1A3153] flex items-center justify-center mb-6 shadow-md">
                <Bot size={24} />
              </div>

              <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#1A3153] mb-2">
                Pillar 02 • Unlimited Practice
              </div>

              <h3 className="font-montserrat font-bold text-xl text-[#1A3153] mb-4">
                24/7 Gemini Live Voice Tutor
              </h3>

              <p className="font-inter text-sm text-[#4A5568] leading-relaxed mb-6">
                Never wait for your next class to practice speaking. Talk naturally at 16k/24k native audio quality with Emma, our conversational AI tutor, with zero fear of making mistakes.
              </p>

              <ul className="space-y-3 text-xs text-[#4A5568]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                  <span>Real-time AudioWorklet low-latency streaming</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                  <span>Instant conversational recasts (no robotic lectures)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                  <span>Interactive barge-in / interruption support</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[#A7C7E7]/50">
              <button
                onClick={handleStartTutor}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-montserrat font-bold text-xs uppercase tracking-[0.15em] bg-[#E09B30] text-[#1A3153] hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all"
              >
                <span>Try Voice Practice</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

          {/* Pillar 3: Pedagogical Reports */}
          <div className="bg-[#FAFAFA] border border-[#A7C7E7] rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#1A3153] text-[#FAFAFA] flex items-center justify-center mb-6 shadow-md">
                <BarChart3 size={24} className="text-[#A7C7E7]" />
              </div>

              <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30] mb-2">
                Pillar 03 • Progress Diagnostics
              </div>

              <h3 className="font-montserrat font-bold text-xl text-[#1A3153] mb-4">
                Instant Session Reports
              </h3>

              <p className="font-inter text-sm text-[#4A5568] leading-relaxed mb-6">
                Every voice session produces a structured diagnostic breakdown of spoken words, estimated WPM, grammar recasts, and actionable follow-up drills.
              </p>

              <ul className="space-y-3 text-xs text-[#4A5568]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                  <span>Exact 'You said' vs. 'More natural' recasts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                  <span>P50 &amp; P95 turn latency benchmarking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-[#E09B30] flex-shrink-0" />
                  <span>1-click follow-up scenario practice</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-[#A7C7E7]/50 text-xs font-montserrat font-semibold uppercase tracking-[0.15em] text-[#1A3153]">
              Measurable Results
            </div>
          </div>
        </div>

        {/* Brand Speech Bubble (Teacher Ivan's Word on the Hybrid Method) */}
        <div className="bg-[#FAFAFA] border border-[#A7C7E7] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#1A3153] flex-shrink-0 flex items-center justify-center text-[#E09B30]">
            <MessageSquareQuote size={28} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="font-montserrat font-bold text-xs uppercase tracking-[0.15em] text-[#E09B30] mb-1">
              Teacher Ivan's Philosophy
            </div>
            <p className="font-inter text-sm sm:text-base text-[#4A5568] italic leading-relaxed">
              "Fluency isn't about memorizing grammar rules from a book—it is muscle memory built through acoustic repetition. With our AI Voice Tutor, my students practice 30 minutes every single day, so our 1-on-1 sessions can focus on high-level expression and exam strategy."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
