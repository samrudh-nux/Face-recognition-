/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, AttendanceRecord } from '../types';

// Let's create beautiful inline SVG colored circles as sample avatars to prevent broken image references
export const createInitialsAvatar = (name: string, bg: string = "#3b82f6") => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" fill="${encodeURIComponent(bg)}"/><text x="50%" y="54%" font-family="'Inter', sans-serif" font-weight="600" font-size="44" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
};

export const MOCK_STUDENTS: Student[] = [
  {
    id: "STU-2026-041",
    name: "Alexander Wright",
    department: "Computer Science",
    email: "alexander.wright@university.edu",
    status: "Active",
    dateEnrolled: "2026-01-15",
    profileImages: {
      front: createInitialsAvatar("Alexander Wright", "#1e1b4b"),
    },
    bioMetrics: {
      eyeDistance: 64.2,
      faceSymmetry: 0.98,
      skinToneMatch: "Neutral Tone 2",
      landmarksCount: 128,
      confidence: 0.992
    }
  },
  {
    id: "STU-2026-115",
    name: "Evelyn Chen",
    department: "Biotechnology",
    email: "evelyn.chen@university.edu",
    status: "Active",
    dateEnrolled: "2026-01-20",
    profileImages: {
      front: createInitialsAvatar("Evelyn Chen", "#064e3b"),
    },
    bioMetrics: {
      eyeDistance: 61.8,
      faceSymmetry: 0.97,
      skinToneMatch: "Warm Ivory",
      landmarksCount: 126,
      confidence: 0.985
    }
  },
  {
    id: "STU-2026-092",
    name: "Marcus Vance",
    department: "Mechanical Engineering",
    email: "marcus.vance@university.edu",
    status: "Active",
    dateEnrolled: "2026-02-02",
    profileImages: {
      front: createInitialsAvatar("Marcus Vance", "#701a75"),
    },
    bioMetrics: {
      eyeDistance: 65.5,
      faceSymmetry: 0.94,
      skinToneMatch: "Rich Bronze",
      landmarksCount: 121,
      confidence: 0.964
    }
  },
  {
    id: "STU-2026-150",
    name: "Sarah Jenkins",
    department: "Business Administration",
    email: "sarah.jenkins@university.edu",
    status: "Active",
    dateEnrolled: "2026-02-10",
    profileImages: {
      front: createInitialsAvatar("Sarah Jenkins", "#7c2d12"),
    },
    bioMetrics: {
      eyeDistance: 62.4,
      faceSymmetry: 0.99,
      skinToneMatch: "Fair Sand",
      landmarksCount: 130,
      confidence: 0.997
    }
  },
  {
    id: "STU-2026-033",
    name: "Jordan Peterson",
    department: "Applied Mathematics",
    email: "jordan.peterson@university.edu",
    status: "Active",
    dateEnrolled: "2026-02-18",
    profileImages: {
      front: createInitialsAvatar("Jordan Peterson", "#0f3e54"),
    },
    bioMetrics: {
      eyeDistance: 63.8,
      faceSymmetry: 0.95,
      skinToneMatch: "Neutral Tone 3",
      landmarksCount: 124,
      confidence: 0.978
    }
  }
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  // June 3rd (Today)
  {
    id: "ATT-1001",
    studentId: "STU-2026-041",
    studentName: "Alexander Wright",
    department: "Computer Science",
    date: "2026-06-03",
    time: "08:42:15",
    status: "On Time",
    verificationConfidence: 0.992,
    verificationType: "Face Scan",
    livenessPassed: true,
    insights: {
      mood: "Attentive",
      expression: "Neutral focus",
      livenessScore: 0.995,
      auditLog: "Mesh validated. Multi-point texture verification complete."
    }
  },
  {
    id: "ATT-1002",
    studentId: "STU-2026-115",
    studentName: "Evelyn Chen",
    department: "Biotechnology",
    date: "2026-06-03",
    time: "08:58:22",
    status: "On Time",
    verificationConfidence: 0.985,
    verificationType: "Face Scan",
    livenessPassed: true,
    insights: {
      mood: "Smiling",
      expression: "Slightly cheerful",
      livenessScore: 0.991,
      auditLog: "Mesh validated. Blink pattern check: PASSED."
    }
  },
  {
    id: "ATT-1003",
    studentId: "STU-2026-092",
    studentName: "Marcus Vance",
    department: "Mechanical Engineering",
    date: "2026-06-03",
    time: "09:12:45",
    status: "Late",
    verificationConfidence: 0.964,
    verificationType: "Face Scan",
    livenessPassed: true,
    insights: {
      mood: "Fatigued",
      expression: "Tired gaze, dark circles detected",
      livenessScore: 0.982,
      auditLog: "Grid matched with 96.4% confidence score."
    }
  },
  
  // June 2nd
  {
    id: "ATT-1004",
    studentId: "STU-2026-041",
    studentName: "Alexander Wright",
    department: "Computer Science",
    date: "2026-06-02",
    time: "08:45:00",
    status: "On Time",
    verificationConfidence: 0.994,
    verificationType: "Face Scan",
    livenessPassed: true,
    insights: { mood: "Neutral", expression: "Attentive focus", livenessScore: 0.996 }
  },
  {
    id: "ATT-1005",
    studentId: "STU-2026-115",
    studentName: "Evelyn Chen",
    department: "Biotechnology",
    date: "2026-06-02",
    time: "09:05:12",
    status: "Late",
    verificationConfidence: 0.982,
    verificationType: "Face Scan",
    livenessPassed: true,
    insights: { mood: "Distracted", expression: "Off-center gaze", livenessScore: 0.989 }
  },
  {
    id: "ATT-1006",
    studentId: "STU-2026-150",
    studentName: "Sarah Jenkins",
    department: "Business Administration",
    date: "2026-06-02",
    time: "08:52:19",
    status: "On Time",
    verificationConfidence: 0.998,
    verificationType: "Face Scan",
    livenessPassed: true,
    insights: { mood: "Smiling", expression: "Engaged focus", livenessScore: 0.998 }
  },
  {
    id: "ATT-1007",
    studentId: "STU-2026-033",
    studentName: "Jordan Peterson",
    department: "Applied Mathematics",
    date: "2026-06-02",
    time: "09:35:00",
    status: "Late",
    verificationConfidence: 0.975,
    verificationType: "Face Scan",
    livenessPassed: true,
    insights: { mood: "Neutral", expression: "Passive orientation", livenessScore: 0.978 }
  },

  // June 1st
  {
    id: "ATT-1008",
    studentId: "STU-2026-041",
    studentName: "Alexander Wright",
    department: "Computer Science",
    date: "2026-06-01",
    time: "08:40:11",
    status: "On Time",
    verificationConfidence: 0.991,
    verificationType: "Face Scan",
    livenessPassed: true,
    insights: { mood: "Attentive", expression: "Focused look", livenessScore: 0.994 }
  },
  {
    id: "ATT-1009",
    studentId: "STU-2026-092",
    studentName: "Marcus Vance",
    department: "Mechanical Engineering",
    date: "2026-06-01",
    time: "08:55:30",
    status: "On Time",
    verificationConfidence: 0.968,
    verificationType: "Face Scan",
    livenessPassed: true,
    insights: { mood: "Neutral", expression: "Engaged orientation", livenessScore: 0.972 }
  },
  {
    id: "ATT-1010",
    studentId: "STU-2026-150",
    studentName: "Sarah Jenkins",
    department: "Business Administration",
    date: "2026-06-01",
    time: "08:41:04",
    status: "On Time",
    verificationConfidence: 0.997,
    verificationType: "Face Scan",
    livenessPassed: true,
    insights: { mood: "Neutral", expression: "High attention", livenessScore: 0.999 }
  },
  {
    id: "ATT-1011",
    studentId: "STU-2026-033",
    studentName: "Jordan Peterson",
    department: "Applied Mathematics",
    date: "2026-06-01",
    time: "12:00:00",
    status: "Absent",
    verificationConfidence: 1.0,
    verificationType: "Manual Bypass"
  }
];

export const DEPARTMENTS = [
  "Computer Science",
  "Biotechnology",
  "Mechanical Engineering",
  "Business Administration",
  "Applied Mathematics"
];
