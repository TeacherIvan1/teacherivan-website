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
    return {
      dateStr: iso,
      dayName: isEs ? dayNamesEs[i] : dayNamesEn[i],
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
      <div className="py-12 px-4 max-w-4xl mx-auto w-full text-center space-y-4">
        <div className="p-8 rounded-3xl bg-[#12223a] border border-[#A7C7E7]/30 shadow-xl space-y-4">
          <CalendarDays size={48} className="mx-auto text-[#E09B30]" />
          <h2 className="font-montserrat font-extrabold text-2xl text-[#FAFAFA]">
            {t.scheduling.title}
          </h2>
          <p className="font-inter text-sm text-[#A7C7E7] max-w-md mx-auto">
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

  // Find user's active booking for this week
  const normUserEmail = user.email.toLowerCase().trim();
  const myBooking = bookings.find(
    (b) => b.studentId === user.id || b.studentEmail.toLowerCase().trim() === normUserEmail
  );

  const handleBookSlot = async (dateStr: string, startTime: string) => {
    setActionError(null);
    setActionSuccess(null);

    if (myBooking) {
      setActionError(
        isEs
          ? `Ya tienes una clase agendada el ${myBooking.date} a las ${myBooking.startTime}. Reprograma primero si deseas cambiar de horario.`
          : `You already have a class on ${myBooking.date} at ${myBooking.startTime}. Reschedule it first to pick another slot.`
      );
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

  return (
    <div
      id="class-scheduler-view"
      className="py-6 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6 animate-in fade-in duration-200"
    >
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#12223a] to-[#1A3153] border-2 border-[#E09B30]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E09B30]/20 border border-[#E09B30] text-[#E09B30] text-xs font-montserrat font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>1-on-1 Bichronous Coaching</span>
          </div>
          <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#FAFAFA] tracking-tight">
            {t.scheduling.title}
          </h1>
          <p className="font-inter text-xs sm:text-sm text-[#A7C7E7] max-w-2xl leading-relaxed">
            {t.scheduling.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#FAFAFA] pt-1">
            <span className="flex items-center gap-1.5 text-[#E09B30] font-semibold">
              <Clock size={14} />
              <span>{t.scheduling.boliviaTimeNotice}</span>
            </span>
            <span className="flex items-center gap-1 text-[#A7C7E7]">
              <ShieldCheck size={14} />
              <span>Limit: 1 active class / week</span>
            </span>
          </div>
        </div>

        {/* Week Switcher Navigation */}
        <div className="flex items-center gap-2 bg-[#1A3153] p-1.5 rounded-2xl border border-[#A7C7E7]/30 shadow-inner self-stretch md:self-auto justify-between">
          <button
            type="button"
            id="scheduler-prev-week-btn"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset(0)}
            className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
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
            className={`px-3.5 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
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
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-400/40 text-red-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs underline hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Student Booking Highlight Card */}
      {myBooking ? (
        <div
          id="student-active-booking-card"
          className="p-5 rounded-3xl bg-gradient-to-r from-[#E09B30]/20 via-[#1A3153] to-[#12223a] border-2 border-[#E09B30] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#E09B30] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider">
                {t.scheduling.yourClass}
              </span>
              <span className="text-xs text-[#FAFAFA] font-bold">
                {myBooking.date} ({myBooking.dayOfWeek})
              </span>
            </div>
            <p className="font-montserrat font-extrabold text-lg text-[#FAFAFA] flex items-center gap-2">
              <Clock size={18} className="text-[#E09B30]" />
              <span>{myBooking.startTime} – {myBooking.endTime} (Bolivia Time)</span>
            </p>
            <p className="text-xs text-[#A7C7E7]">
              Goal: <span className="text-[#FAFAFA] font-semibold">{myBooking.learningGoal}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <a
              id="confirm-booking-whatsapp-btn"
              href={getWhatsAppConfirmationUrl(myBooking)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none px-5 py-2.5 rounded-full bg-[#10b981] hover:bg-[#059669] text-white font-montserrat font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>{t.scheduling.confirmWhatsApp}</span>
              <ExternalLink size={12} />
            </a>

            <button
              id="reschedule-booking-btn"
              type="button"
              onClick={() => handleCancelBooking(myBooking.id)}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-full bg-[#FAFAFA]/10 hover:bg-red-500/20 text-red-300 border border-red-400/30 font-montserrat font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              {t.scheduling.reschedule}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#12223a] border border-[#A7C7E7]/25 text-xs text-[#A7C7E7] flex items-center gap-2.5">
          <Clock size={16} className="text-[#E09B30] shrink-0" />
          <span>{t.scheduling.noBookingYet}</span>
        </div>
      )}

      {/* Monday–Friday Interactive Weekly Schedule Grid */}
      <div className="rounded-3xl bg-[#12223a] border border-[#A7C7E7]/30 shadow-2xl p-4 sm:p-6 overflow-x-auto">
        <div className="min-w-[680px]">
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
