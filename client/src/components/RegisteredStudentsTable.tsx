import React, { useEffect, useState } from 'react';
import { Users, RefreshCw, Mail, Calendar, Globe, Award, Download, CheckCircle2 } from 'lucide-react';
import { getApiUrl } from '../config/api';
import { UserProfile } from '../modules/auth/types';
import { useTranslation } from '../modules/i18n/languageStore';

export const RegisteredStudentsTable: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isEs } = useTranslation();

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl('/api/users/export'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleExportCsv = () => {
    if (users.length === 0) return;
    const headers = ['ID', 'Full Name', 'Email', 'Date of Birth', 'Country', 'Provider', 'CEFR Level', 'Last Score', 'Created At'];
    const rows = users.map((u) => [
      u.id,
      `"${u.fullName.replace(/"/g, '""')}"`,
      u.email,
      u.dateOfBirth,
      `"${u.country}"`,
      u.authProvider,
      u.cefrLevel || 'N/A',
      u.lastScore !== undefined ? u.lastScore : 'N/A',
      u.createdAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `teacher_ivan_students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="registered-students-admin-panel"
      className="w-full rounded-2xl bg-[#12223a] border border-[#A7C7E7]/30 p-4 sm:p-6 shadow-xl text-[#FAFAFA]"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#A7C7E7]/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E09B30]/20 border border-[#E09B30] flex items-center justify-center text-[#E09B30]">
            <Users size={16} />
          </div>
          <div>
            <h3 className="font-montserrat font-bold text-sm text-[#FAFAFA] flex items-center gap-2">
              <span>{isEs ? 'Estudiantes Registrados (Admin)' : 'Registered Students (Admin)'}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E09B30] text-[#1A3153] font-mono text-[11px] font-bold">
                {users.length}
              </span>
            </h3>
            <p className="text-[11px] text-[#A7C7E7]">
              {isEs ? 'Base de datos en servidor /api/users/export' : 'Server database at /api/users/export'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl border border-[#A7C7E7]/30 text-xs text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#1A3153] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>{isEs ? 'Actualizar' : 'Refresh'}</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={users.length === 0}
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
              <th className="py-2.5 px-3">Student</th>
              <th className="py-2.5 px-3">Country</th>
              <th className="py-2.5 px-3">Date of Birth</th>
              <th className="py-2.5 px-3">Auth</th>
              <th className="py-2.5 px-3">Level / Score</th>
              <th className="py-2.5 px-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#A7C7E7]/10 font-inter">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-[#A7C7E7]/70 italic">
                  {isLoading ? 'Loading students from database...' : 'No registered students yet in database.'}
                </td>
              </tr>
            ) : (
              users.map((student) => (
                <tr key={student.id} className="hover:bg-[#1A3153]/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#FAFAFA]">{student.fullName}</div>
                    <div className="text-[11px] text-[#A7C7E7] font-mono">{student.email}</div>
                  </td>
                  <td className="py-3 px-3 text-[#FAFAFA]">
                    {student.country || <span className="text-[#A7C7E7]/50 italic">None</span>}
                  </td>
                  <td className="py-3 px-3 text-[#A7C7E7]">
                    {student.dateOfBirth || <span className="text-[#A7C7E7]/50 italic">None</span>}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      student.authProvider === 'google'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                        : 'bg-[#A7C7E7]/20 text-[#A7C7E7] border border-[#A7C7E7]/30'
                    }`}>
                      {student.authProvider}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {student.cefrLevel ? (
                      <span className="inline-flex items-center gap-1 text-[#E09B30] font-bold">
                        <Award size={12} />
                        <span>{student.cefrLevel}</span>
                        {student.lastScore !== undefined && (
                          <span className="text-[#A7C7E7] text-[10px]">({student.lastScore}pts)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[#A7C7E7]/50 italic">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[#A7C7E7] text-[11px]">
                    {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
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

export default RegisteredStudentsTable;
