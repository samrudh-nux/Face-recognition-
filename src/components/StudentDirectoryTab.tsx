/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Mail, Calendar, ShieldCheck, Cpu, Lightbulb, TrendingUp, Sparkles, AlertCircle, X } from 'lucide-react';
import { Student, AttendanceRecord, SmartInsightsReport } from '../types';
import { DEPARTMENTS } from '../utils/mockData';

interface StudentDirectoryTabProps {
  students: Student[];
  logs: AttendanceRecord[];
}

export default function StudentDirectoryTab({ students, logs }: StudentDirectoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // AI Generation states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<SmartInsightsReport | null>(null);

  // Search & filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'All' || student.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [students, searchQuery, selectedDept]);

  // Compute stats for the current overlay student
  const studentStats = useMemo(() => {
    if (!selectedStudent) return { total: 0, presentRate: 0, lateCount: 0, history: [] };
    
    const personalLogs = logs.filter(l => l.studentId === selectedStudent.id);
    const present = personalLogs.filter(l => l.status === 'On Time' || l.status === 'Late').length;
    const late = personalLogs.filter(l => l.status === 'Late').length;
    const rates = personalLogs.length > 0 ? (present / personalLogs.length) * 100 : 100; // default 100% boundary

    return {
      total: personalLogs.length,
      presentRate: +rates.toFixed(1),
      lateCount: late,
      history: personalLogs.sort((a, b) => b.date.localeCompare(a.date))
    };
  }, [selectedStudent, logs]);

  const handleGenerateAIInsights = async () => {
    if (!selectedStudent) return;
    setIsGeneratingAI(true);
    setAiReport(null);

    try {
      const studentLogs = logs.filter(l => l.studentId === selectedStudent.id);
      
      const response = await fetch("/api/ai/generate-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: selectedStudent.name,
          department: selectedStudent.department,
          records: studentLogs
        })
      });

      const data = await response.json();
      setAiReport(data);

    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const closeProfileOverlay = () => {
    setSelectedStudent(null);
    setAiReport(null);
    setIsGeneratingAI(false);
  };

  return (
    <div className="space-y-6" id="student_directory_tab_node">
      {/* Filters HUD bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by official name or biometric index..."
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2 px-10 text-xs font-medium outline-none transition focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter className="text-slate-400 size-4.5 flex-shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold text-slate-600 outline-none w-full md:w-56 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStudents.map(student => {
          // calculate simple attendance metric on-card
          const cardLogs = logs.filter(l => l.studentId === student.id);
          const cardPresent = cardLogs.filter(l => l.status === 'On Time' || l.status === 'Late').length;
          const cardRate = cardLogs.length > 0 ? (cardPresent / cardLogs.length) * 100 : 100;

          return (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="bg-white hover:bg-indigo-50/10 rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition duration-300 cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3.5">
                {/* Roster Photo Grid representation */}
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative flex-shrink-0">
                    <img
                      src={student.profileImages.front}
                      alt={student.name}
                      className="w-full h-full object-cover grayscale-xs group-hover:grayscale-0 transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-800 tracking-tight truncate group-hover:text-indigo-600 transition duration-300">{student.name}</h4>
                    <span className="font-mono text-[9px] text-indigo-600 font-bold block mt-0.5">{student.id}</span>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <div className="text-[10px] text-slate-400 font-bold truncate">{student.department}</div>
                  <div className="text-[9px] text-slate-400 font-mono font-medium truncate">{student.email}</div>
                </div>
              </div>

              {/* Attendance quick gauge */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-mono">
                <span className="text-slate-450 font-bold uppercase tracking-wider">MAPPED DISCIPLINE</span>
                <span className={`font-bold ${cardRate >= 90 ? 'text-emerald-600' : cardRate >= 75 ? 'text-amber-600' : 'text-rose-500'}`}>
                  {cardRate.toFixed(1)}% Present
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-150 py-16 text-center text-slate-400 font-medium">
          No authorized biometric personnel match your active filters.
        </div>
      )}

      {/* Floating Detailed Profile Card Modal overlay */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto font-sans"
          >
            {/* Header portion */}
            <div className="bg-white border-b border-slate-150 p-6 rounded-t-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl overflow-hidden border-2 border-indigo-500 bg-slate-50 flex-shrink-0">
                  <img
                    src={selectedStudent.profileImages.front}
                    alt={selectedStudent.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-md sm:text-lg font-black text-slate-800 tracking-tight">{selectedStudent.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] sm:text-xs text-indigo-600 font-mono font-bold">
                    <span>{selectedStudent.id}</span>
                    <span className="text-slate-300 font-normal">|</span>
                    <span className="text-slate-500 font-sans font-bold">{selectedStudent.department}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={closeProfileOverlay}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content portion Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Segment: Biometric credentials and history */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3">Biometric Core Calibration</h4>
                  <div className="bg-[#F8FAFC] border border-slate-200 p-4 rounded-2xl space-y-3 font-mono text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">IRIS ALIGN GAP:</span>
                      <strong className="text-slate-800">{selectedStudent.bioMetrics?.eyeDistance || 63.5} mm</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SYMMETRY CALC:</span>
                      <strong className="text-slate-800">{(selectedStudent.bioMetrics?.faceSymmetry ? selectedStudent.bioMetrics.faceSymmetry * 100 : 97).toFixed(0)}% Good</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CELL CHROMATICITY:</span>
                      <strong className="text-slate-800">{selectedStudent.bioMetrics?.skinToneMatch || "Warm Honey"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">LANDMARK COUNT:</span>
                      <strong className="text-slate-800">{selectedStudent.bioMetrics?.landmarksCount || 124} anchors</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2.5 mt-1.5 font-bold">
                      <span className="text-slate-500 font-extrabold">MUTUAL TRUST INDEX:</span>
                      <strong className="text-emerald-600 font-black">{(selectedStudent.bioMetrics?.confidence ? selectedStudent.bioMetrics.confidence * 100 : 98.2).toFixed(1)}% SECURE</strong>
                    </div>
                  </div>
                </div>

                {/* Calendar log timeline */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-3">Gate Log History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {studentStats.history.map(record => (
                      <div key={record.id} className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="font-mono text-indigo-600 font-bold">{record.time}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500">{record.date}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono font-medium">Gateway: {record.verificationType}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          record.status === 'On Time' ? 'bg-emerald-50 text-emerald-700' :
                          record.status === 'Late' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-750'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    ))}
                    {studentStats.history.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs font-medium">No gate records available for this cycle.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Segment: Smart AI diagnostics */}
              <div className="lg:col-span-7 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-8 pt-6 lg:pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">AI Cognitive Discipline Diagnostic</h4>
                    <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold tracking-widest px-2.5 py-1 rounded font-mono uppercase border border-indigo-100 flex items-center gap-1">
                      <Sparkles className="size-3 animate-spin-slow" />
                      Gemini Secure Proxy
                    </span>
                  </div>

                  {!aiReport && !isGeneratingAI ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200/80 p-8 rounded-2xl text-center space-y-4 flex flex-col items-center justify-center min-h-[240px]">
                      <Cpu className="size-10 stroke-1 text-indigo-500 animate-pulse" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Audit Diagnostics Pipeline Idle</h5>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">Click generate below to model check-in chronologies onto behavioral patterns.</p>
                      </div>
                      <button
                        onClick={handleGenerateAIInsights}
                        className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold tracking-wide rounded-xl shadow-xs cursor-pointer transition active:scale-98"
                      >
                        GENERATE DIAGNOSTIC
                      </button>
                    </div>
                  ) : isGeneratingAI ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[240px] font-mono">
                      <Cpu className="text-indigo-600 animate-spin size-8" />
                      <div className="text-xs text-slate-500 uppercase tracking-widest animate-pulse font-medium">Modeling chronological patterns against liveness aggregates...</div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      
                      {/* Diagnostic Scorecard cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#F8FAFC] border border-slate-200 p-3.5 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase font-mono tracking-wider font-bold">Punctuality Score</span>
                          <span className={`text-sm font-extrabold block mt-1 uppercase ${
                            aiReport.generalPunctualityRating === 'Excellent' || aiReport.generalPunctualityRating === 'Good'
                              ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {aiReport.generalPunctualityRating}
                          </span>
                        </div>
                        <div className="bg-[#F8FAFC] border border-slate-200 p-3.5 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase font-mono tracking-wider font-bold">Stability Index</span>
                          <span className="text-sm font-black text-slate-800 block mt-1">{aiReport.attendanceRate}%</span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="space-y-1 font-mono text-[11px] leading-relaxed">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Synthesized Digest</span>
                        <p className="text-slate-600 normal-case bg-indigo-50/20 p-3.5 rounded-2xl border border-indigo-100 font-sans leading-relaxed font-semibold">{aiReport.summary}</p>
                      </div>

                      {/* Behavior analysis */}
                      <div className="space-y-1 font-mono text-[11px] leading-relaxed">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Empathetic Behavior Audit</span>
                        <p className="text-slate-600 normal-case bg-slate-50 p-3.5 rounded-2xl border border-dotted border-slate-200 leading-relaxed">{aiReport.behaviorAnalysis}</p>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono font-bold block">Concrete Directives</span>
                        <ul className="space-y-1.5">
                          {aiReport.recommendations.map((rec, i) => (
                            <li key={i} className="text-xs text-slate-600 flex gap-2 items-start bg-amber-55/10 px-3 py-1.5 rounded-lg border border-amber-100/30">
                              <Lightbulb className="size-4.5 text-amber-550 fill-amber-300/40 flex-shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Regenerate Trigger */}
                {aiReport && (
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={handleGenerateAIInsights}
                      disabled={isGeneratingAI}
                      className="py-2 px-3 text-[10px] font-bold text-indigo-600 border border-indigo-200 hover:bg-slate-50 font-mono tracking-widest uppercase rounded-lg cursor-pointer transition active:scale-98"
                    >
                      Regenerate Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
