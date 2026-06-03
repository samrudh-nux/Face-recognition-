/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck, Download, AlertTriangle, UserCheck, Calendar, Clock, Unlock, Check } from 'lucide-react';
import { AttendanceRecord, Student, AttendanceStatus } from '../types';

interface LogsTabProps {
  logs: AttendanceRecord[];
  students: Student[];
  onManualBypass: (record: AttendanceRecord) => void;
}

export default function LogsTab({ logs, students, onManualBypass }: LogsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Manual bypass popup state
  const [showBypassModal, setShowBypassModal] = useState(false);
  const [selectedBypassStudent, setSelectedBypassStudent] = useState('');
  const [bypassStatus, setBypassStatus] = useState<AttendanceStatus>('On Time');

  // Filter logs chronologically
  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        const matchesSearch = log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.studentId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  }, [logs, searchQuery, statusFilter]);

  const [exportSuccess, setExportSuccess] = useState(false);

  // Export logs to standard CSV spreadsheet
  const handleExportCSV = () => {
    try {
      const headers = ["Record ID", "Student ID", "Student Name", "Department", "Date", "Punch Time", "Status", "Confidence", "Method"];
      const rows = filteredLogs.map(l => [
        l.id,
        l.studentId,
        l.studentName,
        l.department,
        l.date,
        l.time,
        l.status,
        `${(l.verificationConfidence * 100).toFixed(1)}%`,
        l.verificationType
      ]);

      // Properly escape double quotes for CSV standard
      const csvString = [
        headers.join(","),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      ].join("\r\n");

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Attendance_Export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Temporary success state for visual feedback
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e) {
      console.warn("CSV construction failed:", e);
    }
  };

  const triggerManualBypass = () => {
    if (!selectedBypassStudent) {
      alert("Please select an authorized catalog profile first.");
      return;
    }

    const tStudent = students.find(s => s.id === selectedBypassStudent);
    if (tStudent) {
      const todayStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toTimeString().split(' ')[0];

      const bypassRecord: AttendanceRecord = {
        id: `ATT-${Date.now().toString().slice(-4)}`,
        studentId: tStudent.id,
        studentName: tStudent.name,
        department: tStudent.department,
        date: todayStr,
        time: timeStr,
        status: bypassStatus,
        verificationConfidence: 1.0,
        verificationType: 'Manual Bypass',
        livenessPassed: true,
        insights: {
          mood: "Neutral Override",
          expression: "Supervisor bypass certificate provided.",
          livenessScore: 1.0
        }
      };

      onManualBypass(bypassRecord);
      setShowBypassModal(false);
      setSelectedBypassStudent('');
    }
  };

  return (
    <div className="space-y-6" id="logs_tab_node">
      {/* Logs Controls Nav Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records ledger by student parameters..."
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2 px-10 text-xs font-medium outline-none transition focus:ring-1 focus:ring-indigo-500 animate-fade-in"
          />
        </div>

        {/* Filter Selection states */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="text-slate-400 size-4.5 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs font-semibold text-slate-600 outline-none w-full md:w-44 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All statuses</option>
            <option value="On Time">On Time</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="Excused">Excused</option>
          </select>

          {/* Action: Manual override & csv */}
          <button
            onClick={() => setShowBypassModal(true)}
            className="py-2.5 px-3.5 bg-slate-800 border-none hover:bg-slate-950 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition flex-shrink-0"
          >
            <Unlock className="size-4" />
            <span className="hidden sm:inline">Manual Bypass</span>
          </button>

          <button
            onClick={handleExportCSV}
            className={`py-2.5 px-3.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-300 flex-shrink-0 ${
              exportSuccess
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 scale-102 shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
            }`}
          >
            {exportSuccess ? <Check className="size-4" /> : <Download className="size-4" />}
            <span className="hidden sm:inline">{exportSuccess ? "Exported!" : "CSV Export"}</span>
          </button>
        </div>
      </div>

      {/* Primary Logs list View */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 tracking-wider font-mono">
                <th className="py-4 px-6 uppercase">Time Coordinates</th>
                <th className="py-4 px-6 uppercase">Biometric Candidate</th>
                <th className="py-4 px-6 uppercase">Department Anchor</th>
                <th className="py-4 px-6 uppercase text-center">Status Flag</th>
                <th className="py-4 px-6 uppercase">System Gate</th>
                <th className="py-4 px-6 uppercase text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-slate-400" />
                      <span>{log.date}</span>
                      <span className="text-slate-300">|</span>
                      <Clock className="size-3.5 text-slate-400" />
                      <span>{log.time}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      {log.scannedImage && (
                        <div className="size-8 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 group relative cursor-pointer shadow-2xs">
                          <img
                            src={log.scannedImage}
                            alt="Log snapshot"
                            className="w-full h-full object-cover group-hover:scale-115 transition"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div>
                        <span className="text-slate-800 font-extrabold block">{log.studentName}</span>
                        <span className="text-[9px] font-mono text-indigo-600 font-bold block">{log.studentId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="text-slate-500 font-semibold">{log.department}</span>
                  </td>
                  <td className="py-3.5 px-6 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black tracking-wide uppercase ${
                      log.status === 'On Time' ? 'bg-emerald-50 text-emerald-700' :
                      log.status === 'Late' ? 'bg-amber-50 text-amber-700' :
                      log.status === 'Absent' ? 'bg-rose-50 text-rose-700' :
                      'bg-indigo-50 text-indigo-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono text-[10px]">
                    <span className="flex items-center gap-1.5 font-bold">
                      {log.verificationType === 'Face Scan' ? (
                        <ShieldCheck className="size-3.5 text-indigo-500" />
                      ) : (
                        <AlertTriangle className="size-3.5 text-amber-500" />
                      )}
                      {log.verificationType}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono text-[11px] font-bold">
                    <span className={log.verificationConfidence >= 0.9 ? 'text-emerald-600' : 'text-amber-600'}>
                      {(log.verificationConfidence * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-mono text-xs">
                    No matching gate log records logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Override modal sheet */}
      {showBypassModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-md shadow-2xl space-y-5 animate-fade-in">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <Unlock className="text-indigo-600 size-5" />
                Administrative Manual Override
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Settle manual punctuality states for authorized roster personnel here.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1.5">Roster Profile Select</label>
                <select
                  value={selectedBypassStudent}
                  onChange={(e) => setSelectedBypassStudent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Choose student --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono mb-1.5">Override Target Status</label>
                <select
                  value={bypassStatus}
                  onChange={(e) => setBypassStatus(e.target.value as AttendanceStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="On Time">On Time</option>
                  <option value="Late">Late</option>
                  <option value="Excused">Excused</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowBypassModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={triggerManualBypass}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition shadow-xs active:scale-98"
              >
                COMMIT VERDICT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
