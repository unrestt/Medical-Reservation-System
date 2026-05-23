export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
}

export interface DoctorProfile {
  id: number;
  userId: number;
  specialty: string;
  city: string;
  bio?: string | null;
  profilePicture?: string | null;
}

export interface Availability {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  dateTime: string;
  status: 'CONFIRMED' | 'CANCELLED';
  description: string;
  patient?: Partial<User>;
  doctor?: Partial<User> & { doctorProfile?: DoctorProfile | null };
}

export interface AuthResponse {
  token: string;
  role: UserRole;
  userId: number;
  name: string;
  email: string;
}