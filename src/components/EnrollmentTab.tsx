/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Camera, UserPlus, Fingerprint, ShieldCheck, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { Student } from '../types';
import { synths } from '../utils/audio';
import { createInitialsAvatar, DEPARTMENTS } from '../utils/mockData';

interface EnrollmentTabProps {
  onAddStudent: (student: Student) => void;
  students: Student[];
}

export default function EnrollmentTab({ onAddStudent, students }: EnrollmentTabProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Form states
  const [uuid, setUuid] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [email, setEmail] = useState('');

  // Dual camera captures
  const [captures, setCaptures] = useState<{
    front?: string;
    left?: string;
    right?: string;
  }>({});

  const [enrollStep, setEnrollStep] = useState<'details' | 'mapping' | 'success'>('details');
  const [mappingProgress, setMappingProgress] = useState(0);
  const [mappedBio, setMappedBio] = useState<any>(null);

  // Auto-generate standard ID
  useEffect(() => {
    const randomId = `STU-2026-${Math.floor(100 + Math.random() * 900)}`;
    setUuid(randomId);
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const media = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
    } catch (err) {
      console.warn("Enrollment camera failed:", err);
      setCameraError("Camera unavailable. Using advanced procedural initial vectors as bypass.");
    }
  };

  const handleCapture = (angle: 'front' | 'left' | 'right') => {
    if (canvasRef.current && videoRef.current && stream) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, 320, 240);
          const base64 = canvas.toDataURL('image/jpeg');
          setCaptures(prev => ({ ...prev, [angle]: base64 }));
          synths.playRadarSweep();
        }
      } catch (e) {
        console.warn("Capture frame failed", e);
      }
    } else {
      // Fallback procedural avatar capture
      const colorMap: Record<string, string> = { front: "#2563eb", left: "#4f46e5", right: "#7c3aed" };
      const fallbackUrl = createInitialsAvatar(fullName || "New Enrollee", colorMap[angle] || "#3b82f6");
      setCaptures(prev => ({ ...prev, [angle]: fallbackUrl }));
      synths.playRadarSweep();
    }
  };

  const handleResetForm = () => {
    const randomId = `STU-2026-${Math.floor(100 + Math.random() * 900)}`;
    setUuid(randomId);
    setFullName('');
    setDepartment(DEPARTMENTS[0]);
    setEmail('');
    setCaptures({});
    setEnrollStep('details');
    setMappingProgress(0);
    setMappedBio(null);
  };

  const triggerFeatureExtraction = () => {
    if (!fullName || !email) {
      alert("Please fill out complete profile name and official email coordinates.");
      return;
    }
    // Check if front photo captured
    if (!captures.front) {
      alert("Biometric alignment error: Please snap at least the Front Profile biometric frame.");
      return;
    }

    setEnrollStep('mapping');
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setMappingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Procedurally define biometric landmark signature for realistic inspection card
        const calculatedBio = {
          eyeDistance: +(60 + Math.random() * 6).toFixed(1),
          faceSymmetry: +(0.93 + Math.random() * 0.06).toFixed(2),
          skinToneMatch: ["Warm Honey", "Fair Sand", "Cool Bronze", "Deep Ebony", "Warm Ivory", "Neutral Alabaster"][Math.floor(Math.random() * 6)],
          landmarksCount: Math.floor(120 + Math.random() * 15),
          confidence: +(0.95 + Math.random() * 0.049).toFixed(3)
        };

        const newStudent: Student = {
          id: uuid,
          name: fullName,
          department: department,
          email: email,
          status: 'Active',
          dateEnrolled: new Date().toISOString().split('T')[0],
          profileImages: {
            front: captures.front,
            left: captures.left,
            right: captures.right
          },
          bioMetrics: calculatedBio
        };

        setMappedBio(calculatedBio);
        onAddStudent(newStudent);
        synths.playSuccess();
        setEnrollStep('success');
      }
    }, 120);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-4xl mx-auto" id="enrollment_tab_node">
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
        <UserPlus className="text-indigo-600 size-6" />
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Biometric Registry Core</h2>
          <p className="text-xs text-slate-400">Register new physical profiles and calibrate landmark meshes.</p>
        </div>
      </div>

      {enrollStep === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Form Inputs */}
          <div className="md:col-span-7 space-y-5">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider font-mono text-[10px] text-indigo-600">1. Metadata Credentials</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase font-mono text-[10px]">Biometric ID</label>
                <input
                  type="text"
                  value={uuid}
                  readOnly
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-500 cursor-not-allowed uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase font-mono text-[10px]">Status Status</label>
                <span className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl py-2.5 px-3.5 text-xs font-bold flex items-center gap-1.5 justify-center uppercase font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  STABLE ACTIVE
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase font-mono text-[10px]">Subject Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Arthur Pendragon"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-medium text-slate-800 outline-none transition focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase font-mono text-[10px]">Department Anchor</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-700 outline-none transition focus:ring-1 focus:ring-indigo-500"
                >
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase font-mono text-[10px]">Official Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-medium text-slate-800 outline-none transition focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Right Camera Snapshot capture */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider font-mono text-[10px] text-indigo-600">2. Spatial Capture</h3>

            {/* Video preview / Snapshot list */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs font-semibold text-balance">
                  {cameraError || " optical hardware inactive"}
                </div>
              )}
              {/* Overlaid capturing brackets */}
              <div className="absolute inset-4 border border-indigo-500/20 rounded-xl border-dashed pointer-events-none" />
            </div>

            {/* Snapshot Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCapture('front')}
                className={`py-2 px-1 text-[10px] font-mono tracking-wider font-bold uppercase rounded-lg border transition text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  captures.front
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Camera className="size-4" />
                Front View
              </button>
              <button
                type="button"
                onClick={() => handleCapture('left')}
                className={`py-2 px-1 text-[10px] font-mono tracking-wider font-bold uppercase rounded-lg border transition text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  captures.left
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Camera className="size-4" />
                Left View
              </button>
              <button
                type="button"
                onClick={() => handleCapture('right')}
                className={`py-2 px-1 text-[10px] font-mono tracking-wider font-bold uppercase rounded-lg border transition text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  captures.right
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Camera className="size-4" />
                Right View
              </button>
            </div>
          </div>

          <div className="md:col-span-12 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              onClick={handleResetForm}
              className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer transition active:scale-98"
            >
              CLEAR INPUTS
            </button>
            <button
              onClick={triggerFeatureExtraction}
              className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold tracking-wide flex items-center gap-2 cursor-pointer transition shadow-xs active:scale-98"
            >
              <Fingerprint className="size-4.5" />
              CALIBRATE & COMMENCE REGISTER
            </button>
          </div>
        </div>
      )}

      {/* Mapping Landmarks Extraction State */}
      {enrollStep === 'mapping' && (
        <div className="flex flex-col items-center justify-center py-16 font-mono text-center space-y-6">
          <Layers className="size-12 text-indigo-600 animate-bounce mb-2" />
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-700">Calibrating Orthogonal Projection Mesh</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">Generating vector descriptor arrays and mapping facial contours...</p>
          </div>
          <div className="w-64 bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-100" style={{ width: `${mappingProgress}%` }} />
          </div>
          <div className="text-xs font-bold text-indigo-600">{mappingProgress}% Complete</div>
        </div>
      )}

      {/* Complete Success Screen */}
      {enrollStep === 'success' && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-fade-in">
          <div className="bg-emerald-50 p-4 rounded-full border border-emerald-200 text-emerald-600 animate-pulse">
            <CheckCircle2 className="size-12" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Biometric Calibrated Securely!</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
              Subject <b>{fullName}</b> calibrated onto server catalog. Vector landmarks indexed securely under <b>{uuid}</b>.
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-200 p-6 rounded-3xl w-full max-w-md font-mono text-left text-xs text-slate-600 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">EYE INDEX DISPARITY</span>
              <span className="font-semibold text-slate-800">{mappedBio?.eyeDistance} mm</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">FACIAL SYMMETRY GAP</span>
              <span className="font-semibold text-slate-800">{(mappedBio?.faceSymmetry * 100).toFixed(0)}% Match</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">CHROMATIC LANDMARK</span>
              <span className="font-semibold text-slate-800">{mappedBio?.skinToneMatch}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">REGISTRATION CONFIDENCE</span>
              <span className="font-semibold text-emerald-600">{(mappedBio?.confidence * 100).toFixed(1)}% Ready</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={handleResetForm}
              className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition shadow-xs active:scale-98"
            >
              ENROLL ANOTHER PROFILE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
