export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AssignmentStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
export type AssignmentPriority = 'Low' | 'Medium' | 'High';

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
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
  created_at: string;
  updated_at: string;
  // Computed / joined fields
  assignments_count?: number;
  completed_count?: number;
  completion_percentage?: number;
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
