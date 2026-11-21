import React, { useEffect, useState } from 'react';
import { Users, RefreshCw, Mail, Calendar, Globe, Award, Download, CheckCircle2, Phone, Sparkles, FileSpreadsheet } from 'lucide-react';
import { getApiUrl } from '../config/api';
import { UserProfile, StudentPlan } from '../modules/auth/types';
import { useAuthStore } from '../modules/auth/authStore';
import { useTranslation } from '../modules/i18n/languageStore';
import { syncAndHealAdminData, saveAdminRosterVault } from '../modules/auth/vaultSync';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell, Badge, Button } from '../design-system/astryx';

export const RegisteredStudentsTable: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [successUserId, setSuccessUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheetsStatus, setSheetsStatus] = useState<{
    configured: boolean;
    sheetId?: string;
    mode: string;
    totalSynced: number;
    lastSyncTime?: string;
  } | null>(null);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsNotice, setSheetsNotice] = useState<string | null>(null);
  const { isEs } = useTranslation();
  const updateUserPlan = useAuthStore((s) => s.updateUserPlan);
  const currentUser = useAuthStore((s) => s.user);

  const fetchSheetsStatus = async () => {
    try {
      const res = await fetch(getApiUrl('/api/sheets/status'));
      if (res.ok) {
        const data = await res.json();
        setSheetsStatus(data);
      }
    } catch {}
  };

  const handleSyncGoogleSheets = async () => {
    setIsSyncingSheets(true);
    setSheetsNotice(null);
    try {
      const res = await fetch(getApiUrl('/api/sheets/sync'), {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setSheetsNotice(
          isEs
            ? `Sincronizados ${data.synced} estudiantes con Google Sheets (${data.mode})`
            : `Synced ${data.synced} students with Google Sheets (${data.mode})`
        );
        fetchSheetsStatus();
      } else {
        const err = await res.text();
        setSheetsNotice(isEs ? `Aviso de sincronización: ${err}` : `Sync notice: ${err}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSheetsNotice(`Error syncing: ${msg}`);
    } finally {
      setIsSyncingSheets(false);
      setTimeout(() => setSheetsNotice(null), 5000);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Additive Union Sync: reads local vault, merges with server, self-heals server if needed
      const { users: merged } = await syncAndHealAdminData();
      setUsers(merged);
      fetchSheetsStatus();
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

  const handlePlanChange = async (userId: string, newPlan: StudentPlan) => {
    setUpdatingUserId(userId);
    setError(null);
    try {
      const updatedUser = await updateUserPlan(userId, newPlan);
      const updatedList = users.map((u) => {
        if (u.id !== userId) return u;
        const maxDaily = newPlan === 'essential' ? 10 : newPlan === 'free' ? 5 : -1;
        const maxWeekly = newPlan === 'executive' ? 5 : newPlan === 'pro' ? 3 : 0;
        return {
          ...u,
          plan: newPlan,
          maxDailySessions: maxDaily,
          maxWeeklyClasses: maxWeekly,
          planUpdatedAt: updatedUser?.planUpdatedAt || new Date().toISOString(),
          planNotificationPending: newPlan !== 'free',
        };
      });

      setUsers(updatedList);
      if (currentUser?.role === 'admin') {
        saveAdminRosterVault(updatedList);
      }

      setSuccessUserId(userId);
      setTimeout(() => {
        setSuccessUserId((curr) => (curr === userId ? null : curr));
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to update plan: ${msg}`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleExportCsv = () => {
    if (users.length === 0) return;
    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone Number',
      'Date of Birth',
      'Country',
      'Plan',
      'Weekly Classes',
      'Daily AI Quota',
      'CEFR Level',
      'Learning Goal',
      'Personal Objective',
      'Last Score',
      'Created At',
    ];
    const rows = users.map((u) => [
      u.id,
      `"${u.fullName.replace(/"/g, '""')}"`,
      u.email,
      `"${u.phoneNumber || ''}"`,
      u.dateOfBirth,
      `"${u.country}"`,
      u.plan || 'free',
      u.maxWeeklyClasses !== undefined ? u.maxWeeklyClasses : 0,
      u.maxDailySessions !== undefined ? u.maxDailySessions : 5,
      u.cefrLevel || 'N/A',
      `"${(u.learningGoals?.primaryGoal || 'N/A').replace(/"/g, '""')}"`,
      `"${(u.learningGoals?.personalObjective || '').replace(/"/g, '""')}"`,
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

  const getPlanBadgeClass = (plan?: string) => {
    switch (plan) {
      case 'essential':
        return 'bg-blue-500/20 text-blue-300 border border-blue-400/40';
      case 'pro':
        return 'bg-[#E09B30]/20 text-[#E09B30] border border-[#E09B30]/50 font-bold';
      case 'executive':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-black';
      default:
        return 'bg-[#A7C7E7]/15 text-[#A7C7E7] border border-[#A7C7E7]/30';
    }
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
              <span>{isEs ? 'Base de Datos de Estudiantes (Admin)' : 'Registered Students Database (Admin)'}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#E09B30] text-[#1A3153] font-mono text-[11px] font-bold">
                {users.length}
              </span>
            </h3>
            <p className="text-[11px] text-[#A7C7E7]">
              {isEs
                ? 'Asignación manual de planes luego de pago por WhatsApp'
                : 'Manual plan assignment after manual WhatsApp payment'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Google Sheets Sync Button */}
          <button
            type="button"
            onClick={handleSyncGoogleSheets}
            disabled={isSyncingSheets || users.length === 0}
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
              sheetsStatus?.configured
                ? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-[#A7C7E7]/30 text-[#A7C7E7] hover:text-[#FAFAFA] hover:bg-[#1A3153]'
            }`}
            title={
              sheetsStatus?.configured
                ? `Google Sheets (${sheetsStatus.mode}): ${sheetsStatus.sheetId || 'Active'}`
                : 'Google Sheets integration active in local buffer mode'
            }
          >
            <FileSpreadsheet size={13} className={isSyncingSheets ? 'animate-spin text-emerald-400' : 'text-emerald-400'} />
            <span>
              {isSyncingSheets
                ? (isEs ? 'Sincronizando...' : 'Syncing...')
                : sheetsStatus?.configured
                ? (isEs ? 'Sincronizar Sheets' : 'Sync Sheets')
                : (isEs ? 'Google Sheets' : 'Google Sheets')}
            </span>
          </button>

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

      {sheetsNotice && (
        <div className="my-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <span>{sheetsNotice}</span>
          {sheetsStatus?.sheetId && sheetsStatus.sheetId !== 'AppsScriptWebhook' && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${sheetsStatus.sheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-300 underline font-bold ml-2 hover:text-white"
            >
              {isEs ? 'Abrir Google Sheet ↗' : 'Open Google Sheet ↗'}
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="my-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="mt-4 overflow-x-auto">
        <Table className="w-full text-left text-xs border-collapse min-w-[760px]">
          <TableHeader>
            <TableRow isHoverable={false}>
              <TableHeaderCell className="py-2.5 px-3">Student</TableHeaderCell>
              <TableHeaderCell className="py-2.5 px-3">Phone Number</TableHeaderCell>
              <TableHeaderCell className="py-2.5 px-3">Country</TableHeaderCell>
              <TableHeaderCell className="py-2.5 px-3">CEFR Goal</TableHeaderCell>
              <TableHeaderCell className="py-2.5 px-3">Current Plan</TableHeaderCell>
              <TableHeaderCell className="py-2.5 px-3">Assign Plan (Saves Instantly)</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow isHoverable={false}>
                <TableCell colSpan={6} className="py-8 text-center text-xs text-[#A7C7E7]/70 italic">
                  {isLoading ? 'Loading students from database...' : 'No registered students yet in database.'}
                </TableCell>
              </TableRow>
            ) : (
              users.map((student) => {
                const isUpdating = updatingUserId === student.id;
                const isSuccess = successUserId === student.id;
                const currentPlan: StudentPlan = student.plan || (student.role === 'admin' ? 'executive' : 'free');

                return (
                  <TableRow key={student.id} className="hover:bg-[#1A3153]/40 transition-colors">
                    {/* Student Full Name & Email */}
                    <TableCell className="py-3 px-3">
                      <div className="font-semibold text-[#FAFAFA] flex items-center gap-1.5">
                        <span>{student.fullName}</span>
                        {student.role === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded bg-[#E09B30] text-[#1A3153] text-[9px] font-black uppercase">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#A7C7E7] font-mono">{student.email}</div>
                    </TableCell>

                    {/* Phone Number */}
                    <TableCell className="py-3 px-3">
                      {student.phoneNumber ? (
                        <a
                          href={`https://wa.me/${student.phoneNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#10b981] hover:underline flex items-center gap-1 font-mono text-[11px]"
                          title="Open WhatsApp chat with student"
                        >
                          <Phone size={11} />
                          <span>{student.phoneNumber}</span>
                        </a>
                      ) : (
                        <span className="text-[#A7C7E7]/50 italic text-[11px]">N/A</span>
                      )}
                    </TableCell>

                    {/* Country */}
                    <TableCell className="py-3 px-3 text-[#FAFAFA]">
                      {student.country || <span className="text-[#A7C7E7]/50 italic">None</span>}
                    </TableCell>

                    {/* CEFR Goal & Primary Goal */}
                    <TableCell className="py-3 px-3">
                      <div className="space-y-0.5">
                        <div className="inline-flex items-center gap-1 text-[#E09B30] font-bold text-xs">
                          <Award size={12} />
                          <span>{student.cefrLevel || student.learningGoals?.targetLevel || 'Pending'}</span>
                          {student.lastScore !== undefined && (
                            <span className="text-[#A7C7E7] text-[10px]">({student.lastScore}pts)</span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#A7C7E7] truncate max-w-[170px]" title={student.learningGoals?.primaryGoal || 'No goal'}>
                          {student.learningGoals?.primaryGoal || 'Tech & Job Interviews'}
                        </div>
                      </div>
                    </TableCell>

                    {/* Current Plan Badge */}
                    <TableCell className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${getPlanBadgeClass(currentPlan)}`}>
                        {currentPlan}
                      </span>
                    </TableCell>

                    {/* Interactive Plan Dropdown */}
                    <TableCell className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <select
                          id={`plan-select-${student.id}`}
                          disabled={isUpdating}
                          value={currentPlan}
                          onChange={(e) => handlePlanChange(student.id, e.target.value as StudentPlan)}
                          className="bg-[#1A3153] text-[#FAFAFA] text-xs rounded-xl border border-[#A7C7E7]/30 px-2.5 py-1.5 focus:outline-none focus:border-[#E09B30] cursor-pointer disabled:opacity-50"
                        >
                          <option value="free">{isEs ? 'Gratis (5/día)' : 'Free (5/day)'}</option>
                          <option value="essential">{isEs ? 'Essential (0 clases/sem)' : 'Essential (0 classes/wk)'}</option>
                          <option value="pro">{isEs ? 'Pro (3 clases/sem)' : 'Pro (3 classes/wk)'}</option>
                          <option value="executive">{isEs ? 'Executive (5 clases/sem)' : 'Executive (5 classes/wk)'}</option>
                        </select>

                        {isUpdating && (
                          <RefreshCw size={12} className="animate-spin text-[#E09B30]" />
                        )}
                        {isSuccess && (
                          <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold animate-in fade-in">
                            <CheckCircle2 size={13} />
                            <span>Saved</span>
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RegisteredStudentsTable;
