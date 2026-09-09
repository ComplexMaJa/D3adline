export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AssignmentStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
export type AssignmentPriority = 'Low' | 'Medium' | 'High';
export type UserRole = 'student' | 'teacher' | 'admin';
export type EnrollmentStatus = 'active' | 'archived' | 'dropped';

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  institution?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  instructor: string | null;
  description: string | null;
  color: string;
  join_code?: string | null;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  // Computed / joined fields
  assignments_count?: number;
  completed_count?: number;
  overdue_count?: number;
  completion_percentage?: number;
  enrolled_students_count?: number;
  is_enrolled?: boolean;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  enrolled_at: string;
  status: EnrollmentStatus;
  // Joined relation
  course?: Course;
  student?: Profile;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: AssignmentStatus;
  progress: number;
  submission_note: string | null;
  submitted_at: string | null;
  grade: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation
  assignment?: Assignment;
  student?: Profile;
}

export interface Assignment {
  id: string;
  course_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  progress: number;
  due_date: string; // YYYY-MM-DD
  due_time: string | null; // HH:mm:ss
  created_at: string;
  updated_at: string;
  // Joined relation
  course?: Course | null;
  subtasks?: Subtask[];
  attachments?: Attachment[];
  submissions?: AssignmentSubmission[];
}

export interface Subtask {
  id: string;
  assignment_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  assignment_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string | null;
  created_at: string;
}

export interface AssignmentFilterOptions {
  search?: string;
  courseId?: string;
  status?: AssignmentStatus | 'all';
  priority?: AssignmentPriority | 'all';
  dateRange?: 'all' | 'today' | 'this_week' | 'next_week' | 'overdue' | 'upcoming';
  sortBy?: 'deadline_asc' | 'deadline_desc' | 'priority' | 'created_desc' | 'progress';
}

export interface DashboardMetrics {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  overdueAssignments: number;
  dueThisWeek: number;
  completionPercentage: number;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Course>;
      };
      assignments: {
        Row: Assignment;
        Insert: Omit<Assignment, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Assignment>;
      };
      course_enrollments: {
        Row: CourseEnrollment;
        Insert: Omit<CourseEnrollment, 'id' | 'enrolled_at'> & {
          id?: string;
          enrolled_at?: string;
        };
        Update: Partial<CourseEnrollment>;
      };
      assignment_submissions: {
        Row: AssignmentSubmission;
        Insert: Omit<AssignmentSubmission, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<AssignmentSubmission>;
      };
      assignment_subtasks: {
        Row: Subtask;
        Insert: Omit<Subtask, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Subtask>;
      };
      assignment_attachments: {
        Row: Attachment;
        Insert: Omit<Attachment, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Attachment>;
      };
    };
    Functions: {
      generate_course_join_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
    };
  };
};
