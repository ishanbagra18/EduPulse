export type Role = "admin" | "teacher" | "student";

export interface User {
  id: string;
  full_name?: string;
  email?: string;
  role: Role;
  phone?: string;
  profile_image?: string;
  is_active?: boolean;
  is_blocked?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: string;
  user_id: string;
  admission_number?: string;
  roll_number?: string;
  class_id?: string;
  section?: string;
  gender?: string;
  dob?: string;
  address?: string;
  emergency_contact?: string;
  parent_name?: string;
  parent_phone?: string;
  status?: string;
  photo_url?: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  qualification?: string;
  experience?: number;
  joining_date?: string;
  address?: string;
  photo_url?: string;
  status?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  section?: string;
  class_teacher_id?: string;
  academic_year?: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id?: string;
  teacher_id?: string;
  date: string;
  status: "present" | "absent" | "late" | "half_day";
  remarks?: string;
  synced?: boolean;
  created_at?: string;
}

export interface Fee {
  id: string;
  student_id: string;
  month?: string;
  amount: number;
  due_date?: string;
  status?: "pending" | "paid" | "partial";
}

export interface Payment {
  id: string;
  fee_id: string;
  amount: number;
  payment_method?: string;
  transaction_reference?: string;
  payment_date?: string;
  receipt_url?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  target_role?: Role | "everyone";
  target_class?: string;
  created_by?: string;
  created_at?: string;
}
