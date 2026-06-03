/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, UserPlus, FileSpreadsheet, ChartColumn, Users, Radio, Activity, Clock, ShieldAlert, Laptop, Sparkles } from 'lucide-react';
import { Student, AttendanceRecord } from './types';
import { MOCK_STUDENTS, MOCK_ATTENDANCE } from './utils/mockData';

// Tabs components
import ScannerTab from './components/ScannerTab';
import EnrollmentTab from './components/EnrollmentTab';
import LogsTab from './components/LogsTab';
import AnalyticsTab from './components/AnalyticsTab';
import StudentDirectoryTab from './components/StudentDirectoryTab';

type ActiveTab = 'scanner' | 'enrollment' | 'logs' | 'analytics' | 'students';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  
  // Roster lists & Attendance Logs
  const [students, setStudents] = useState<Student[]>([]);
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);

  // Local clock state in header
  const [currentTime, setCurrentTime] = useState(new Date());

  // Initialize and synchronize with local storage
  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem('biometric_students');
      const savedLogs = localStorage.getItem('biometric_logs');

      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      } else {
        setStudents(MOCK_STUDENTS);
        localStorage.setItem('biometric_students', JSON.stringify(MOCK_STUDENTS));
      }

      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      } else {
        setLogs(MOCK_ATTENDANCE);
        localStorage.setItem('biometric_logs', JSON.stringify(MOCK_ATTENDANCE));
      }
    } catch (e) {
      console.warn("Local storage state load failed, utilizing mock structures:", e);
      setStudents(MOCK_STUDENTS);
      setLogs(MOCK_ATTENDANCE);
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update lists
  const handleAddStudent = (newStudent: Student) => {
    const updated = [newStudent, ...students];
    setStudents(updated);
    localStorage.setItem('biometric_students', JSON.stringify(updated));
  };

  const handleAddLog = (newLog: AttendanceRecord) => {
    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem('biometric_logs', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col" id="app_root_node">
      
      {/* Top Biometric Banner Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4.5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-xs">
              <Fingerprint className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                VISAGE<span className="text-indigo-600">SECURE</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">
                Attendance Management Engine
              </p>
            </div>
          </div>

          {/* Clock Feed & Metrics */}
          <div className="flex items-center gap-6 text-xs font-mono bg-slate-50 p-2.5 px-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
              <Clock className="size-4 text-indigo-600 animate-spin-slow" />
              <span className="text-slate-700 tabular-nums font-bold">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-emerald-500 animate-pulse" />
              <span className="text-slate-400 text-[10px] font-semibold">LIVE LOGS:</span>
              <span className="text-emerald-600 font-bold">{logs.length}</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Grid Layout Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar Drawer */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-3 lg:pb-4">
            
            <button
              onClick={() => setActiveTab('scanner')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide flex items-center gap-3 transition-all flex-shrink-0 cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-indigo-50/60 hover:text-indigo-600'
              }`}
            >
              <Radio className="size-4 flex-shrink-0" />
              <span>Camera Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab('enrollment')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide flex items-center gap-3 transition-all flex-shrink-0 cursor-pointer ${
                activeTab === 'enrollment'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-indigo-50/60 hover:text-indigo-600'
              }`}
            >
              <UserPlus className="size-4 flex-shrink-0" />
              <span>Enroll Subject</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide flex items-center gap-3 transition-all flex-shrink-0 cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-indigo-50/60 hover:text-indigo-600'
              }`}
            >
              <FileSpreadsheet className="size-4 flex-shrink-0" />
              <span>Security Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide flex items-center gap-3 transition-all flex-shrink-0 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-indigo-50/60 hover:text-indigo-600'
              }`}
            >
              <ChartColumn className="size-4 flex-shrink-0" />
              <span>Analytics Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide flex items-center gap-3 transition-all flex-shrink-0 cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-indigo-50/60 hover:text-indigo-600'
              }`}
            >
              <Users className="size-4 flex-shrink-0" />
              <span>Roster Database</span>
            </button>

          </nav>
        </aside>

        {/* Dynamic Tab Panel */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'scanner' && (
                <ScannerTab students={students} onAddLog={handleAddLog} />
              )}
              {activeTab === 'enrollment' && (
                <EnrollmentTab students={students} onAddStudent={handleAddStudent} />
              )}
              {activeTab === 'logs' && (
                <LogsTab logs={logs} students={students} onManualBypass={handleAddLog} />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsTab students={students} logs={logs} />
              )}
              {activeTab === 'students' && (
                <StudentDirectoryTab students={students} logs={logs} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Footer copyright system tags */}
      <footer className="bg-white border-t border-slate-200 px-6 py-5 mt-12 text-slate-400 font-sans text-[10px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 items-center">
            <span className="font-semibold uppercase tracking-wider text-slate-500">AES-256 SECURED</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold uppercase tracking-wider text-slate-500">LOCAL GRID 02</span>
            <span className="text-slate-300">|</span>
            <span>LATENCY: 14MS</span>
          </div>
          <div className="flex gap-2 items-center">
            <span>© 2026 VISAGE SECURE TECHNOLOGIES • v2.4.0-CORE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
