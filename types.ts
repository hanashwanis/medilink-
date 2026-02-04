
export type UserRole = 'MIGRANT' | 'DOCTOR' | 'GOVERNMENT';
export type Theme = 'light' | 'dark';

export interface MigrantProfile {
  id: string;
  name: string;
  age: number;
  nativeState: string;
  nativeCity: string;
  residingCity: string;
  aadharNo: string;
  dob: string;
  contactNumber: string;
  mobileNumber: string;
  emergencyMobileNumber: string;
  bloodGroup: string;
  medicalReports: string[]; // Base64 or URLs
  username: string;
  password?: string;
  voiceNote?: string; // Translated text from last recording
}

export interface Consultation {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  date: string;
  patientAge: number;
  diagnosis: string;
  causeOfIllness: string;
  prescription: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  username: string;
  password?: string;
  specialization: string;
  patientsTreated: number;
}
