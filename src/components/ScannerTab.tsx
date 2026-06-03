/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, ShieldCheck, ShieldAlert, Cpu, RefreshCw, AlertTriangle, UserCheck, Eye, Sparkles } from 'lucide-react';
import { Student, AttendanceRecord } from '../types';
import { synths } from '../utils/audio';

interface ScannerTabProps {
  students: Student[];
  onAddLog: (log: AttendanceRecord) => void;
}

export default function ScannerTab({ students, onAddLog }: ScannerTabProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedSimStudent, setSelectedSimStudent] = useState<string>('auto'); // 'auto' (camera) or studentId
  
  // Scanned results states
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    student?: Student;
    expression?: string;
    livenessScore?: number;
    auditSummary?: string;
    image?: string;
  } | null>(null);

  // Bio feedback values
  const [bioValues, setBioValues] = useState({
    symmetry: 0.98,
    irisDist: 63.4,
    stability: 0.99,
    confidence: 0
  });

  // Start Camera on load
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const media = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
    } catch (err: any) {
      console.warn("Camera init failed, using mockup state:", err);
      setCameraError(
        "Camera access denied or unavailable. You can still fully operate, test, and run the simulator using registered profiles."
      );
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Simulate scanning radar pulse sound
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(() => {
        synths.playRadarSweep();
        // Slightly randomize live indicators during active scanning
        setBioValues(prev => ({
          symmetry: +(0.95 + Math.random() * 0.04).toFixed(3),
          irisDist: +(61 + Math.random() * 4).toFixed(1),
          stability: +(0.93 + Math.random() * 0.06).toFixed(3),
          confidence: +(Math.random() * 100).toFixed(1)
        }));
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleScanTrigger = async () => {
    if (isScanning) return;
    setScanResult(null);
    setIsScanning(true);
    setScanProgress(5);

    // Animate progress bar
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    // Capture standard or simulated image frame
    let capturedImageBase64 = "";
    if (canvasRef.current && videoRef.current && stream) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          capturedImageBase64 = canvas.toDataURL('image/jpeg', 0.85);
        }
      } catch (e) {
        console.warn("Canvas crop failed, using static generation:", e);
      }
    }

    // Determine target mock student for match
    let matchedStudent: Student | undefined;
    if (selectedSimStudent === 'auto') {
      // Pick a random enrolled student or match if available
      if (students.length > 0) {
        matchedStudent = students[Math.floor(Math.random() * students.length)];
      }
    } else if (selectedSimStudent !== 'guest') {
      matchedStudent = students.find(s => s.id === selectedSimStudent);
    }

    // Call artificial liveness audit endpoint or simulate
    try {
      const payloadImage = capturedImageBase64 || (matchedStudent ? matchedStudent.profileImages.front : "");
      
      const response = await fetch("/api/ai/analyze-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: payloadImage })
      });
      
      const details = await response.json();
      
      clearInterval(interval);
      setScanProgress(100);

      setTimeout(() => {
        setIsScanning(false);
        
        if (selectedSimStudent === 'guest') {
          // Failure Mode
          synths.playError();
          setScanResult({
            success: false,
            expression: "Suspicious",
            livenessScore: 0.32,
            auditSummary: "Biometric analysis alert: Unknown subject coordinates. Matching index is below threshold."
          });
        } else if (matchedStudent) {
          // Success Mode
          synths.playSuccess();
          const today = new Date();
          const scanTime = today.toTimeString().split(' ')[0];
          const scanDate = today.toISOString().split('T')[0];

          // Determine on-time status based on 9:00 AM boundary
          const hour = today.getHours();
          const status = (hour < 9) ? 'On Time' : 'Late';

          const record: AttendanceRecord = {
            id: `ATT-${Date.now().toString().slice(-4)}`,
            studentId: matchedStudent.id,
            studentName: matchedStudent.name,
            department: matchedStudent.department,
            date: scanDate,
            time: scanTime,
            status: status,
            verificationConfidence: details.livenessScore || 0.98,
            verificationType: 'Face Scan',
            scannedImage: payloadImage,
            livenessPassed: details.isGenuineLiveness,
            insights: {
              mood: details.expression,
              expression: details.auditSummary,
              livenessScore: details.livenessScore
            }
          };

          onAddLog(record);

          setScanResult({
            success: true,
            student: matchedStudent,
            expression: details.expression || "Attentive",
            livenessScore: details.livenessScore || 0.98,
            auditSummary: details.auditSummary || "Verification clearance approved.",
            image: payloadImage
          });
        } else {
          // Empty state handling
          synths.playError();
          setScanResult({
            success: false,
            auditSummary: "No enrolled students found. Please register a student first."
          });
        }
      }, 400);

    } catch (err: any) {
      console.error(err);
      setIsScanning(false);
      synths.playError();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="scanner_tab_node">
      {/* Hidden Canvas for Frame Extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Scanner Section */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <Cpu className="text-indigo-600 size-5" />
                Live Biometric Checkpoint
              </h2>
              <p className="text-xs text-slate-400">
                Align subject face into the primary terminal frame boundary.
              </p>
            </div>
            {/* Simulation Controller */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest hidden sm:inline">Profile Mask:</span>
              <select
                value={selectedSimStudent}
                onChange={(e) => setSelectedSimStudent(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <optgroup label="Biometric Source">
                  <option value="auto">📷 Camera / Auto-Mock</option>
                </optgroup>
                <optgroup label="Simulate Registered">
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </optgroup>
                <optgroup label="Simulate Unregistered">
                  <option value="guest">👤 Unknown Subject (Denial Test)</option>
                </optgroup>
              </select>
            </div>
          </div>
 
          {/* Camera Frame Container */}
          <div className="relative aspect-[4/3] w-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
            {/* Corner brackets */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-indigo-500 z-20 rounded-tl-md pointer-events-none" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-indigo-500 z-20 rounded-tr-md pointer-events-none" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-indigo-500 z-20 rounded-bl-md pointer-events-none" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-indigo-500 z-20 rounded-br-md pointer-events-none" />
 
            {/* Simulated Scrolling Scrolling Metrics Layer */}
            <div className="absolute bottom-6 left-6 z-20 font-mono text-[9px] text-slate-700 bg-white/90 p-3 rounded-xl border border-slate-200 shadow-sm space-y-1 backdrop-blur-md pointer-events-none max-w-[210px] hidden sm:block">
              <div>BIO_SYMMETRY: {bioValues.symmetry}</div>
              <div>PUPIL_INDEX: {bioValues.irisDist}mm</div>
              <div>STABILITY_RATIO: {bioValues.stability}</div>
              <div className="flex items-center gap-1.5 text-indigo-600 font-bold mt-1 pt-1 border-t border-slate-100">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                MESH GRID ACTIVE
              </div>
            </div>
 
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover z-10"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center space-y-4">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl text-indigo-500 animate-pulse shadow-xs">
                  <Camera className="size-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700">Enabling Optical Hub...</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {cameraError || "Requesting secure browser hardware access to initiate pixel scanner."}
                  </p>
                </div>
              </div>
            )}
 
            {/* Target Reticle / Target Scanner overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className={`relative w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-dashed text-indigo-400 opacity-75 flex items-center justify-center transition-all duration-300 ${isScanning ? 'scale-105 border-indigo-500 animate-spin-slow' : 'border-slate-300'}`}>
                {/* Horizontal & vertical hash lines */}
                <div className="absolute top-1/2 left-0 right-0 border-t border-indigo-500/20" />
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-indigo-500/20" />
                {/* Scanner Target Circle */}
                <div className="w-20 h-20 rounded-full border-2 border-indigo-500/45" />
              </div>
            </div>
 
            {/* Scanning Laser Line Sweeper */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] z-30 pointer-events-none"
                />
              )}
            </AnimatePresence>
 
            {/* Processing Overlay Progress bar */}
            <AnimatePresence>
              {isScanning && (
                <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-6 backdrop-blur-md font-mono">
                  <Cpu className="text-indigo-600 size-10 animate-spin mb-4" />
                  <div className="text-xs text-slate-800 tracking-widest uppercase font-bold mb-1">Mapping Facial Vectors</div>
                  <div className="text-xs text-indigo-600 font-bold mb-3">{scanProgress}%</div>
                  <div className="w-48 bg-slate-100 rounded-full h-1 overflow-hidden">
                    <motion.div
                      className="bg-indigo-600 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
 
          <div className="flex justify-center pt-2">
            <button
              onClick={handleScanTrigger}
              disabled={isScanning}
              className={`relative px-8 py-4 px-10 rounded-xl text-xs font-bold tracking-widest shadow-xs transition-all flex items-center justify-center gap-3 w-full sm:w-auto ${
                isScanning
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow-md active:scale-98'
              }`}
            >
              <Cpu className={`size-4.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? "Processing Facial Vectors..." : "SCAN & VERIFY BIOMETRIC"}
            </button>
          </div>
        </div>
      </div>

      {/* Result Verification Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col h-full justify-between min-h-[420px] text-slate-800">
          <div>
            <h3 className="font-mono text-[10px] text-indigo-600 tracking-widest uppercase mb-4 flex items-center gap-2 font-bold">
              <ShieldCheck className="size-4 text-indigo-600" />
              Biometric Authorization
            </h3>

            <AnimatePresence mode="wait">
              {!scanResult ? (
                <motion.div
                  key="no-result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center text-slate-400"
                >
                  <Eye className="size-12 stroke-1 text-slate-300 mb-4 animate-pulse" />
                  <p className="text-xs font-semibold leading-relaxed">Optical Node ready. Please prompt a biometric face recognition scan from the control portal.</p>
                </motion.div>
              ) : scanResult.success ? (
                <motion.div
                  key="matched"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Portrait scan badge */}
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <div className="relative size-16 rounded-xl overflow-hidden bg-slate-200 border-2 border-indigo-505/20 flex-shrink-0">
                      <img
                        src={scanResult.image || scanResult.student?.profileImages.front}
                        alt="Scan portrait"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1 right-1 bg-emerald-500 p-0.5 rounded-full">
                        <UserCheck className="size-3 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-slate-800 truncate">{scanResult.student?.name}</div>
                      <div className="text-[11px] text-indigo-600 truncate font-mono mt-0.5 font-bold">{scanResult.student?.id}</div>
                      <div className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{scanResult.student?.department}</div>
                    </div>
                  </div>

                  {/* Verification reports */}
                  <div className="space-y-3 font-mono">
                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80">
                      <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Biometric Match Confidence</div>
                      <div className="text-xl font-black text-emerald-600 mt-1">
                        {(scanResult.livenessScore ? scanResult.livenessScore * 100 : 98.4).toFixed(1)}%
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80">
                      <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Facial Mood Descriptor</div>
                      <div className="text-sm font-extrabold text-indigo-700 mt-1 flex items-center gap-1.5 font-semibold">
                        <Sparkles className="size-3.5 text-indigo-500 animate-pulse" />
                        {scanResult.expression}
                      </div>
                    </div>

                    {scanResult.auditSummary && (
                      <div className="text-[11px] text-slate-600 leading-relaxed bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 font-sans">
                        <span className="text-emerald-700 font-extrabold uppercase mr-1">Verdict:</span>
                        {scanResult.auditSummary}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="denied"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-rose-50/70 border border-rose-100 text-center text-rose-700 space-y-3">
                    <AlertTriangle className="size-10 text-rose-500" />
                    <div>
                      <h4 className="text-sm font-bold text-rose-800">Biometric Verification Refused</h4>
                      <p className="text-[11px] text-rose-600 font-medium mt-1 leading-relaxed">{scanResult.auditSummary}</p>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80 flex justify-between items-center">
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Liveness Status</div>
                        <div className="text-xs text-rose-600 font-black mt-1">FAILED / REJECTED</div>
                      </div>
                      <ShieldAlert className="size-5 text-rose-500" />
                    </div>

                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/80">
                      <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Suggested Remedy</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-sans font-medium">
                        Ensure the student registry contains clear template files or enroll the profile as a new student inside the register hub.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-400 font-mono text-center space-y-1 font-medium">
            <div>BIOMETRIC TERMINAL ID: KIOSK-CS-02</div>
            <div>VERIFICATION MECHANISM: COMS-X-LIVENESS-G3</div>
          </div>
        </div>
      </div>
    </div>
  );
}
