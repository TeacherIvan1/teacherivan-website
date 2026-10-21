import React, { useEffect, useState, useCallback } from 'react';
import { CalendarDays, RefreshCw, Download, MessageCircle, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { getApiUrl } from '../config/api';
import { useTranslation } from '../modules/i18n/languageStore';
import { TEACHER_PHONE } from '../config/contact';

interface BookingRecord {
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

export const AdminBookingsTable: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isEs } = useTranslation();

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('/api/bookings/export'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleExportCsv = () => {
    if (bookings.length === 0) return;
    const headers = ['ID', 'Date', 'Day', 'Start Time', 'End Time', 'Student Name', 'Student Email', 'Country', 'Learning Goal', 'Created At'];
    const rows = bookings.map((b) => [
      b.id,
      b.date,
      b.dayOfWeek,
      b.startTime,
      b.endTime,
      `"${b.studentName.replace(/"/g, '""')}"`,
      b.studentEmail,
      `"${b.studentCountry}"`,
      `"${b.learningGoal.replace(/"/g, '""')}"`,
      b.createdAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `teacher_ivan_booked_classes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this class booking from database?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/bookings/${id}`), {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchBookings();
      }
    } catch {}
  };

  return (
    <div
      id="admin-bookings-table-panel"
      className="w-full rounded-2xl bg-[#12223a] border border-[#A7C7E7]/30 p-4 sm:p-6 shadow-xl text-[#FAFAFA]"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#A7C7E7]/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E09B30]/20 border border-[#E09B30] flex items-center justify-center text-[#E09B30]">
            <CalendarDays size={16} />
          </div>
          <div>
            <h3 className="font-montserrat font-bold text-sm text-[#FAFAFA] flex items-center gap-2">
              <span>{isEs ? 'Clases 1-a-1 Agendadas (Dev Mode)' : 'All Booked 1-on-1 Classes (Dev Mode)'}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E09B30] text-[#1A3153] font-mono text-[11px] font-bold">
                {bookings.length}
              </span>
            </h3>
            <p className="text-[11px] text-[#A7C7E7]">
              {isEs ? 'Sincronizado con server/data/bookings.json (14:00 – 20:00)' : 'Synced with server/data/bookings.json (14:00 – 20:00)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={fetchBookings}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-[#A7C7E7]/30 text-xs text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#1A3153] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>{isEs ? 'Actualizar' : 'Refresh'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={bookings.length === 0}
            className="px-3.5 py-1.5 rounded-xl bg-[#E09B30] text-[#1A3153] font-montserrat font-bold text-xs uppercase tracking-wider hover:bg-[#c88624] hover:text-[#FAFAFA] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="my-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#A7C7E7]/20 text-[#A7C7E7] font-montserrat font-bold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Date / Day</th>
              <th className="py-2.5 px-3">Time Slot</th>
              <th className="py-2.5 px-3">Student</th>
              <th className="py-2.5 px-3">Country</th>
              <th className="py-2.5 px-3">Goal</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#A7C7E7]/10 font-inter">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-[#A7C7E7]/70 italic">
                  {isLoading ? 'Loading bookings from server...' : 'No booked classes yet in calendar.'}
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#1A3153]/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-[#FAFAFA]">
                    <div>{b.date}</div>
                    <div className="text-[11px] text-[#E09B30] font-normal">{b.dayOfWeek}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E09B30]/20 text-[#E09B30] font-mono text-[11px] font-bold">
                      <Clock size={11} />
                      <span>{b.startTime}–{b.endTime}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#FAFAFA]">{b.studentName}</div>
                    <div className="text-[11px] text-[#A7C7E7] font-mono">{b.studentEmail}</div>
                  </td>
                  <td className="py-3 px-3 text-[#FAFAFA]">
                    {b.studentCountry || 'Bolivia'}
                  </td>
                  <td className="py-3 px-3 text-[#A7C7E7]">
                    <span className="truncate max-w-[180px] inline-block" title={b.learningGoal}>
                      {b.learningGoal}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`https://wa.me/${TEACHER_PHONE.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hola Teacher Ivan, sobre la clase del ${b.date} a las ${b.startTime} con ${b.studentName}:`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#10b981]/20 text-[#10b981] hover:bg-[#10b981] hover:text-white transition-colors"
                        title="Open WhatsApp chat"
                      >
                        <MessageCircle size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCancel(b.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="Cancel booking"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookingsTable;
