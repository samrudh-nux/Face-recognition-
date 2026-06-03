/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string; // Unique student identifier, e.g. "STU-2026-001"
  name: string;
  department: string;
  email: string;
  status: 'Active' | 'Inactive';
  dateEnrolled: string;
  profileImages: {
    front: string; // base64 representation of camera snapshot
    left?: string;
    right?: string;
  };
  bioMetrics?: {
    eyeDistance: number;
    faceSymmetry: number;
    skinToneMatch: string;
    landmarksCount: number;
    confidence: number;
  };
}

export type AttendanceStatus = 'On Time' | 'Late' | 'Absent' | 'Excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  status: AttendanceStatus;
  verificationConfidence: number; // 0.0 to 1.0 (e.g. 0.98 for 98% confidence)
  verificationType: 'Face Scan' | 'Manual Bypass' | 'Remote';
  scannedImage?: string; // Optional captured base64 frame
  livenessPassed?: boolean;
  insights?: {
    mood?: string;
    expression?: string;
    livenessScore?: number;
    auditLog?: string;
  };
}

export interface SmartInsightsReport {
  studentId?: string;
  studentName?: string;
  summary: string;
  generalPunctualityRating: string; // "Excellent" | "Good" | "Needs Attention" | "Critical"
  attendanceRate: number;
  behaviorAnalysis: string;
  recommendations: string[];
  timestamp: string;
}

export interface DepartmentStats {
  name: string;
  present: number;
  late: number;
  absent: number;
  total: number;
  rate: number;
}
