import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  RefreshCw,
  Sparkles,
  UserCheck,
  CalendarDays,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../modules/auth/authStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { getApiUrl } from '../config/api';
import { TEACHER_PHONE } from '../config/contact';

export const VALID_HOURS = [
  { start: '14:00', end: '15:00', label: '14:00 – 15:00' },
  { start: '15:00', end: '16:00', label: '15:00 – 16:00' },
  { start: '16:00', end: '17:00', label: '16:00 – 17:00' },
  { start: '17:00', end: '18:00', label: '17:00 – 18:00' },
  { start: '18:00', end: '19:00', label: '18:00 – 19:00' },
  { start: '19:00', end: '20:00', label: '19:00 – 20:00' },
] as const;

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCountry: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  learningGoal: string;
  createdAt: string;
}

export function getMondayOfWeek(offsetWeeks = 0): Date {
  const now = new Date();
  // Bolivia is UTC-4: compute UTC-4 date
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const boliviaDate = new Date(utc - 4 * 3600000);

  const day = boliviaDate.getDay(); // 0 is Sun, 1 is Mon
  const diff = boliviaDate.getDate() - day + (day === 0 ? -6 : 1) + offsetWeeks * 7;
  const monday = new Date(boliviaDate.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const ClassSchedulerView: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const { t, isEs } = useTranslation();

  const [weekOffset, setWeekOffset] = useState<number>(0); // 0 = current, 1 = next
  const [selectedMobileDayIndex, setSelectedMobileDayIndex] = useState<number>(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const mondayDate = getMondayOfWeek(weekOffset);
  const mondayIso = formatIsoDate(mondayDate);

  // Generate Mon-Fri days
  const weekDays = [0, 1, 2, 3, 4].map((i) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const iso = formatIsoDate(d);
    const dayNamesEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dayNamesEs = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const shortNamesEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const shortNamesEs = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
    return {
      dateStr: iso,
      dayName: isEs ? dayNamesEs[i] : dayNamesEn[i],
      shortName: isEs ? shortNamesEs[i] : shortNamesEn[i],
      displayDate: `${d.getDate()}/${d.getMonth() + 1}`,
    };
  });

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await fetch(getApiUrl(`/api/bookings?weekStart=${mondayIso}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err: unknown) {
      console.error('[ClassSchedulerView] Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [mondayIso]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (!isAuthenticated || !user) {
    return (
      <div className="py-8 sm:py-12 px-3 sm:px-4 max-w-4xl mx-auto w-full text-center space-y-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12223a] border border-[#A7C7E7]/30 shadow-xl space-y-4">
          <CalendarDays size={44} className="mx-auto text-[#E09B30]" />
          <h2 className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#FAFAFA]">
            {t.scheduling.title}
          </h2>
          <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] max-w-md mx-auto">
            {t.scheduling.subtitle}
          </p>
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className="px-6 py-3 rounded-full bg-[#E09B30] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-[#c88624] hover:text-[#FAFAFA] transition-all cursor-pointer shadow-lg"
          >
            {isEs ? 'Registrarse Gratis para Agendar' : 'Sign Up Free to Book Class'}
          </button>
        </div>
      </div>
    );
  }

  // Determine user's plan and weekly limits
  const userPlan = user.plan || (user.role === 'admin' ? 'executive' : 'free');
  const maxWeeklyClasses =
    user.role === 'admin'
      ? 3
      : user.maxWeeklyClasses !== undefined
      ? user.maxWeeklyClasses
      : userPlan === 'executive'
      ? 3
      : userPlan === 'pro'
      ? 2
      : userPlan === 'essential'
      ? 1
      : 0;

  // Find user's active bookings for this week
  const normUserEmail = user.email.toLowerCase().trim();
  const myBookings = bookings.filter(
    (b) => b.studentId === user.id || b.studentEmail.toLowerCase().trim() === normUserEmail
  );

  const getPlanBadgeLabel = () => {
    switch (userPlan) {
      case 'essential':
        return isEs ? 'Plan Essential (1 clase/sem)' : 'Essential Plan (1 class/wk)';
      case 'pro':
        return isEs ? 'Plan Pro (2 clases/sem)' : 'Pro Plan (2 classes/wk)';
      case 'executive':
        return isEs ? 'Plan Executive (3 clases/sem)' : 'Executive Plan (3 classes/wk)';
      default:
        return isEs ? 'Plan Gratuito (0 clases en vivo)' : 'Free Plan (0 live classes)';
    }
  };

  const handleBookSlot = async (dateStr: string, startTime: string) => {
    setActionError(null);
    setActionSuccess(null);

    // If Free Plan, prompt student to activate plan via WhatsApp
    if (maxWeeklyClasses === 0 || userPlan === 'free') {
      const upgradeMsg = isEs
        ? 'El Plan Gratuito incluye 5 sesiones diarias de Simulador IA, pero no incluye clases en vivo 1 a 1. ¡Escríbele a Teacher Ivan por WhatsApp para activar tu plan Essential, Pro o Executive!'
        : 'The Free Plan includes 5 daily AI Simulator sessions, but does not include 1-on-1 live classes. Message Teacher Ivan on WhatsApp to activate your Essential, Pro, or Executive plan!';
      setActionError(upgradeMsg);
      return;
    }

    // Check if user already booked maximum allowed classes for this week
    if (myBookings.length >= maxWeeklyClasses) {
      const limitMsg = isEs
        ? `Has alcanzado tu límite semanal (${myBookings.length}/${maxWeeklyClasses} clases agendadas). Reprograma una clase existente si deseas cambiar de horario.`
        : `You have reached your weekly limit (${myBookings.length}/${maxWeeklyClasses} classes booked). Reschedule an existing booking to pick a different time.`;
      setActionError(limitMsg);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(getApiUrl('/api/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          studentName: user.fullName,
          studentEmail: user.email,
          studentCountry: user.country || 'Bolivia',
          date: dateStr,
          startTime,
          learningGoal: user.learningGoals?.primaryGoal || 'Tech & Job Interviews',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to book slot.');
      }

      setActionSuccess(t.scheduling.bookedSuccess);
      await fetchBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setActionError(null);
    setActionSuccess(null);

    const confirmCancel = window.confirm(
      isEs
        ? '¿Estás seguro de que deseas cancelar o reprogramar tu clase?'
        : 'Are you sure you want to cancel or reschedule your class?'
    );
    if (!confirmCancel) return;

    try {
      setIsLoading(true);
      const res = await fetch(getApiUrl(`/api/bookings/${bookingId}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          studentEmail: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to cancel booking.');
      }

      setActionSuccess(t.scheduling.cancelSuccess);
      await fetchBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // WhatsApp confirmation url builder
  const getWhatsAppConfirmationUrl = (booking: Booking): string => {
    const rawMsg = isEs
      ? `Hola Teacher Ivan! Confirmo mi clase semanal 1 a 1 de inglés para el ${booking.date} (${booking.dayOfWeek}) de ${booking.startTime} a ${booking.endTime} (Hora Bolivia). Mi meta de aprendizaje es: "${booking.learningGoal}". Estudiante: ${booking.studentName}. ¡Nos vemos!`
      : `Hello Teacher Ivan! I confirm my 1-on-1 English class scheduled for ${booking.date} (${booking.dayOfWeek}) from ${booking.startTime} to ${booking.endTime} (Bolivia Time). My learning goal is: "${booking.learningGoal}". Student: ${booking.studentName}. See you then!`;
    const cleanPhone = TEACHER_PHONE.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMsg)}`;
  };

  const selectedMobileDay = weekDays[selectedMobileDayIndex] || weekDays[0];

  return (
    <div
      id="class-scheduler-view"
      className="py-4 sm:py-6 px-3 sm:px-6 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-5 sm:gap-6 animate-in fade-in duration-200 overflow-hidden"
    >
      {/* Header Banner */}
      <div className="p-4 sm:p-7 rounded-3xl bg-gradient-to-r from-[#12223a] to-[#1A3153] border-2 border-[#E09B30]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E09B30]/20 border border-[#E09B30] text-[#E09B30] text-[11px] font-montserrat font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>1-on-1 Bichronous Coaching</span>
          </div>
          <h1 className="font-montserrat font-extrabold text-xl sm:text-3xl text-[#FAFAFA] tracking-tight">
            {t.scheduling.title}
          </h1>
          <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] max-w-2xl leading-relaxed">
            {t.scheduling.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#FAFAFA] pt-1">
            <span className="flex items-center gap-1.5 text-[#E09B30] font-semibold">
              <Clock size={14} />
              <span>{t.scheduling.boliviaTimeNotice}</span>
            </span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1A3153] border border-[#A7C7E7]/30 text-[#A7C7E7]">
              <ShieldCheck size={13} className="text-[#E09B30]" />
              <span className="font-bold text-[#FAFAFA]">{getPlanBadgeLabel()}</span>
            </span>
            <span className="text-[11px] text-[#A7C7E7]">
              {myBookings.length} / {maxWeeklyClasses} {isEs ? 'clases agendadas' : 'classes booked'}
            </span>
          </div>
        </div>

        {/* Week Switcher Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1A3153] p-1.5 rounded-2xl border border-[#A7C7E7]/30 shadow-inner self-stretch md:self-auto justify-between">
          <button
            type="button"
            id="scheduler-prev-week-btn"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center gap-1 transition-all cursor-pointer ${
              weekOffset === 0
                ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
                : 'text-[#A7C7E7] hover:text-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={14} />
            <span>{t.scheduling.currentWeek}</span>
          </button>

          <button
            type="button"
            id="scheduler-next-week-btn"
            disabled={weekOffset === 1}
            onClick={() => setWeekOffset(1)}
            className={`px-3 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center gap-1 transition-all cursor-pointer ${
              weekOffset === 1
                ? 'bg-[#E09B30] text-[#1A3153] shadow-md'
                : 'text-[#A7C7E7] hover:text-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <span>{t.scheduling.nextWeek}</span>
            <ChevronRight size={14} />
          </button>

          <button
            type="button"
            onClick={fetchBookings}
            disabled={isLoading}
            className="p-2 rounded-xl text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/10 transition-colors cursor-pointer"
            title="Refresh schedule"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Free Plan Activation Banner (If user has 0 weekly classes) */}
      {maxWeeklyClasses === 0 && (
        <div
          id="free-plan-upgrade-banner"
          className="p-4 sm:p-5 rounded-2xl bg-[#E09B30]/15 border-2 border-[#E09B30] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-in fade-in"
        >
          <div className="space-y-1">
            <h3 className="font-montserrat font-extrabold text-sm sm:text-base text-[#FAFAFA] flex items-center gap-2">
              <Sparkles size={16} className="text-[#E09B30]" />
              <span>{isEs ? 'Activa tu Plan para Agendar Clases en Vivo' : 'Activate a Plan to Book Live Classes'}</span>
            </h3>
            <p className="text-xs text-[#A7C7E7] max-w-xl">
              {isEs
                ? 'Tu cuenta gratuita incluye 5 sesiones diarias de Simulador IA. Para reservar clases semanales 1 a 1 de 1 hora (14:00–20:00 Bolivia), activa tu plan Essential, Pro o Executive vía WhatsApp.'
                : 'Your free account includes 5 daily AI Simulator sessions. To book weekly 1-hour live classes (14:00–20:00 Bolivia), activate your Essential, Pro, or Executive plan via WhatsApp.'}
            </p>
          </div>
          <a
            id="scheduler-activate-whatsapp-btn"
            href="https://wa.me/59172878330?text=Hola%20Teacher%20Ivan!%20Deseo%20activar%20mi%20plan%20de%20clases%20en%20vivo%201%20a%201."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full bg-[#10b981] hover:bg-[#059669] text-white font-montserrat font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shrink-0 cursor-pointer"
          >
            <MessageCircle size={15} />
            <span>{isEs ? 'Activar Plan por WhatsApp' : 'Activate Plan on WhatsApp'}</span>
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Notifications / Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-xs underline hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-400/40 text-red-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {(maxWeeklyClasses === 0 || userPlan === 'free') && (
              <a
                href="https://wa.me/59172878330?text=Hola%20Teacher%20Ivan!%20Quiero%20activar%20mi%20plan%20de%20clases%20de%20ingl%C3%A9s."
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full bg-[#10b981] text-white font-montserrat font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <MessageCircle size={12} />
                <span>WhatsApp</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="text-xs underline hover:text-white cursor-pointer px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Active Student Booking Highlight Cards */}
      {myBookings.length > 0 ? (
        <div className="space-y-3">
          {myBookings.map((booking) => (
            <div
              key={booking.id}
              id={`student-active-booking-${booking.id}`}
              className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#E09B30]/20 via-[#1A3153] to-[#12223a] border-2 border-[#E09B30] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E09B30] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider">
                    {t.scheduling.yourClass}
                  </span>
                  <span className="text-xs text-[#FAFAFA] font-bold">
                    {booking.date} ({booking.dayOfWeek})
                  </span>
                </div>
                <p className="font-montserrat font-extrabold text-base sm:text-lg text-[#FAFAFA] flex items-center gap-2">
                  <Clock size={18} className="text-[#E09B30]" />
                  <span>{booking.startTime} – {booking.endTime} (Bolivia Time)</span>
                </p>
                <p className="text-xs text-[#A7C7E7]">
                  Goal: <span className="text-[#FAFAFA] font-semibold">{booking.learningGoal}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <a
                  id={`confirm-booking-whatsapp-btn-${booking.id}`}
                  href={getWhatsAppConfirmationUrl(booking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none px-5 py-2.5 rounded-full bg-[#10b981] hover:bg-[#059669] text-white font-montserrat font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>{t.scheduling.confirmWhatsApp}</span>
                  <ExternalLink size={12} />
                </a>

                <button
                  id={`reschedule-booking-btn-${booking.id}`}
                  type="button"
                  onClick={() => handleCancelBooking(booking.id)}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-full bg-[#FAFAFA]/10 hover:bg-red-500/20 text-red-300 border border-red-400/30 font-montserrat font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {t.scheduling.reschedule}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#12223a] border border-[#A7C7E7]/25 text-xs text-[#A7C7E7] flex items-center gap-2.5">
          <Clock size={16} className="text-[#E09B30] shrink-0" />
          <span>{t.scheduling.noBookingYet}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE DAY SELECTOR PILL BAR (<768px): ZERO HORIZONTAL OVERFLOW            */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Day Selector Pill Bar (Mon | Tue | Wed | Thu | Fri) */}
        <div
          id="mobile-scheduler-day-pills"
          className="flex items-center justify-between gap-1 p-1 bg-[#1A3153] rounded-2xl border border-[#A7C7E7]/25 w-full"
        >
          {weekDays.map((d, idx) => {
            const isSelected = selectedMobileDayIndex === idx;
            return (
              <button
                key={d.dateStr}
                type="button"
                id={`mobile-day-pill-${idx}`}
                onClick={() => setSelectedMobileDayIndex(idx)}
                className={`flex-1 py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E09B30] text-[#1A3153] font-bold shadow-md'
                    : 'text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#FAFAFA]/5'
                }`}
              >
                <div className="text-xs font-montserrat font-extrabold truncate">
                  {d.shortName}
                </div>
                <div className="text-[10px] opacity-80 font-mono mt-0.5">
                  {d.displayDate}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Header */}
        <div className="flex items-center justify-between px-1 text-xs text-[#FAFAFA]">
          <span className="font-montserrat font-bold text-[#E09B30]">
            {selectedMobileDay.dayName} ({selectedMobileDay.displayDate})
          </span>
          <span className="text-[11px] text-[#A7C7E7]">14:00 – 20:00 Bolivia</span>
        </div>

        {/* 6 Time Slots Vertical List for the Selected Day */}
        <div className="space-y-2.5">
          {VALID_HOURS.map((hour) => {
            const existingBooking = bookings.find(
              (b) => b.date === selectedMobileDay.dateStr && b.startTime === hour.start
            );
            const isMySlot = Boolean(
              existingBooking &&
                (existingBooking.studentId === user.id ||
                  existingBooking.studentEmail.toLowerCase().trim() === normUserEmail)
            );
            const isBookedByOther = Boolean(existingBooking && !isMySlot);

            if (isMySlot) {
              return (
                <div
                  key={`mobile-${selectedMobileDay.dateStr}-${hour.start}`}
                  id={`mobile-slot-${selectedMobileDay.dateStr}-${hour.start.replace(':', '')}`}
                  className="p-3.5 rounded-2xl bg-[#E09B30] text-[#1A3153] border-2 border-[#FAFAFA] shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck size={16} />
                    <span className="font-montserrat font-extrabold text-xs">{hour.label}</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {t.scheduling.yourClass}
                  </span>
                </div>
              );
            }

            if (isBookedByOther) {
              return (
                <div
                  key={`mobile-${selectedMobileDay.dateStr}-${hour.start}`}
                  id={`mobile-slot-${selectedMobileDay.dateStr}-${hour.start.replace(':', '')}`}
                  className="p-3.5 rounded-2xl bg-[#1A3153]/40 border border-[#A7C7E7]/15 text-[#A7C7E7]/40 flex items-center justify-between select-none"
                >
                  <span className="font-montserrat font-semibold text-xs">{hour.label}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {t.scheduling.bookedSlot}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={`mobile-${selectedMobileDay.dateStr}-${hour.start}`}
                id={`mobile-slot-${selectedMobileDay.dateStr}-${hour.start.replace(':', '')}`}
                type="button"
                disabled={isLoading}
                onClick={() => handleBookSlot(selectedMobileDay.dateStr, hour.start)}
                className="w-full p-3.5 rounded-2xl bg-[#FAFAFA] text-[#1A3153] hover:bg-[#E09B30] hover:text-[#1A3153] border border-[#A7C7E7]/40 transition-all flex items-center justify-between cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon size={14} className="text-[#E09B30]" />
                  <span className="text-xs font-montserrat font-bold">{hour.label}</span>
                </div>
                <span className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-[#4A5568]">
                  {t.scheduling.availableSlot}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP 5-COLUMN SCHEDULE GRID (>=768px): FULL WEEK VIEW                   */}
      {/* ========================================================================= */}
      <div className="hidden md:block rounded-3xl bg-[#12223a] border border-[#A7C7E7]/30 shadow-2xl p-6 overflow-hidden">
        <div>
          {/* Day Columns Header */}
          <div className="grid grid-cols-5 gap-3 pb-4 border-b border-[#A7C7E7]/20 text-center">
            {weekDays.map((d) => (
              <div key={d.dateStr} className="p-3 rounded-2xl bg-[#1A3153]/80 border border-[#A7C7E7]/25">
                <div className="font-montserrat font-extrabold text-sm text-[#FAFAFA]">
                  {d.dayName}
                </div>
                <div className="font-inter text-xs text-[#E09B30] font-semibold mt-0.5">
                  {d.displayDate}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots Rows */}
          <div className="space-y-3 pt-4">
            {VALID_HOURS.map((hour) => (
              <div key={hour.start} className="grid grid-cols-5 gap-3">
                {weekDays.map((day) => {
                  const existingBooking = bookings.find(
                    (b) => b.date === day.dateStr && b.startTime === hour.start
                  );
                  const isMySlot = Boolean(
                    existingBooking &&
                      (existingBooking.studentId === user.id ||
                        existingBooking.studentEmail.toLowerCase().trim() === normUserEmail)
                  );
                  const isBookedByOther = Boolean(existingBooking && !isMySlot);

                  if (isMySlot) {
                    return (
                      <div
                        key={`${day.dateStr}-${hour.start}`}
                        id={`slot-${day.dateStr}-${hour.start.replace(':', '')}`}
                        className="p-3.5 rounded-2xl bg-[#E09B30] text-[#1A3153] border-2 border-[#FAFAFA] shadow-md flex flex-col justify-between transition-all"
                      >
                        <div className="flex items-center justify-between text-xs font-montserrat font-extrabold">
                          <span>{hour.label}</span>
                          <UserCheck size={14} />
                        </div>
                        <div className="text-[11px] font-bold mt-2 truncate">
                          {t.scheduling.yourClass}
                        </div>
                      </div>
                    );
                  }

                  if (isBookedByOther) {
                    return (
                      <div
                        key={`${day.dateStr}-${hour.start}`}
                        id={`slot-${day.dateStr}-${hour.start.replace(':', '')}`}
                        className="p-3.5 rounded-2xl bg-[#1A3153]/40 border border-[#A7C7E7]/15 text-[#A7C7E7]/40 flex flex-col justify-between cursor-not-allowed select-none"
                        title={t.scheduling.bookedSlot}
                      >
                        <div className="text-xs font-montserrat font-semibold">
                          {hour.label}
                        </div>
                        <div className="text-[10px] uppercase font-bold tracking-wider mt-2">
                          {t.scheduling.bookedSlot}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={`${day.dateStr}-${hour.start}`}
                      id={`slot-${day.dateStr}-${hour.start.replace(':', '')}`}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleBookSlot(day.dateStr, hour.start)}
                      className="p-3.5 rounded-2xl bg-[#FAFAFA] text-[#1A3153] hover:bg-[#E09B30] hover:text-[#1A3153] border border-[#A7C7E7]/40 transition-all duration-150 flex flex-col justify-between cursor-pointer group shadow-sm hover:shadow-md hover:scale-[1.02]"
                      title={`Book ${day.dayName} at ${hour.label}`}
                    >
                      <div className="text-xs font-montserrat font-bold flex items-center justify-between w-full">
                        <span>{hour.label}</span>
                        <CalendarIcon size={12} className="opacity-40 group-hover:opacity-100" />
                      </div>
                      <div className="text-[10px] font-montserrat font-bold uppercase tracking-wider text-[#4A5568] group-hover:text-[#1A3153] mt-2">
                        {t.scheduling.availableSlot}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSchedulerView;
