import {
  differenceInCalendarDays,
  differenceInHours,
  format,
  isBefore,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
  startOfDay,
} from "date-fns";
import { AssignmentStatus } from "@/types/database";

export interface DeadlineInfo {
  label: string;
  isOverdue: boolean;
  isDueToday: boolean;
  isDueTomorrow: boolean;
  isDueThisWeek: boolean;
  daysRemaining: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'normal' | 'completed';
  formattedDate: string;
  formattedTime: string;
}

export function parseAssignmentDeadline(dueDateStr: string, dueTimeStr?: string | null): Date {
  if (!dueDateStr) return new Date();
  
  const time = dueTimeStr || "23:59:00";
  // Clean time format to ensure HH:mm:ss
  const cleanTime = time.length === 5 ? `${time}:00` : time;
  
  try {
    return new Date(`${dueDateStr}T${cleanTime}`);
  } catch {
    return parseISO(dueDateStr);
  }
}

export function getDeadlineInfo(
  dueDateStr: string,
  dueTimeStr?: string | null,
  status?: AssignmentStatus
): DeadlineInfo {
  const deadline = parseAssignmentDeadline(dueDateStr, dueTimeStr);
  const now = new Date();
  const today = startOfDay(now);
  const deadlineDay = startOfDay(deadline);
  
  const isCompleted = status === 'Completed';
  const daysDiff = differenceInCalendarDays(deadlineDay, today);
  const hoursDiff = differenceInHours(deadline, now);
  const isPast = isBefore(deadline, now) && !isToday(deadline);
  const isOverdue = (status === 'Overdue' || isPast || (isToday(deadline) && isBefore(deadline, now))) && !isCompleted;
  
  const formattedDate = format(deadline, "MMM d, yyyy");
  const formattedTime = format(deadline, "h:mm a");

  if (isCompleted) {
    return {
      label: `Completed · ${formattedDate}`,
      isOverdue: false,
      isDueToday: false,
      isDueTomorrow: false,
      isDueThisWeek: false,
      daysRemaining: daysDiff,
      urgencyLevel: 'completed',
      formattedDate,
      formattedTime,
    };
  }

  let label = "";
  let urgencyLevel: 'critical' | 'high' | 'medium' | 'normal' | 'completed' = 'normal';

  if (isOverdue) {
    urgencyLevel = 'critical';
    if (isYesterday(deadline)) {
      label = `Overdue · Yesterday`;
    } else if (daysDiff < 0) {
      const absDays = Math.abs(daysDiff);
      label = `Overdue · ${absDays} day${absDays > 1 ? 's' : ''} ago`;
    } else {
      label = `Overdue · ${formattedTime}`;
    }
  } else if (isToday(deadline)) {
    urgencyLevel = 'high';
    if (hoursDiff > 0 && hoursDiff <= 3) {
      label = `Due in ${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} · ${formattedTime}`;
    } else {
      label = `Due today · ${formattedTime}`;
    }
  } else if (isTomorrow(deadline)) {
    urgencyLevel = 'medium';
    label = `Due tomorrow · ${formattedTime}`;
  } else if (daysDiff > 1 && daysDiff <= 7) {
    urgencyLevel = daysDiff <= 3 ? 'medium' : 'normal';
    label = `Due in ${daysDiff} days · ${format(deadline, "EEE, MMM d")}`;
  } else {
    urgencyLevel = 'normal';
    label = `Due ${formattedDate}`;
  }

  return {
    label,
    isOverdue,
    isDueToday: isToday(deadline),
    isDueTomorrow: isTomorrow(deadline),
    isDueThisWeek: daysDiff >= 0 && daysDiff <= 7,
    daysRemaining: daysDiff,
    urgencyLevel,
    formattedDate,
    formattedTime,
  };
}

export function getStatusBadgeStyle(status: AssignmentStatus) {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
    case 'In Progress':
      return 'bg-blue-950/60 text-blue-400 border-blue-800/50';
    case 'Overdue':
      return 'bg-red-950/60 text-red-400 border-red-800/50';
    case 'Not Started':
    default:
      return 'bg-zinc-900 text-zinc-400 border-zinc-800';
  }
}

export function getPriorityBadgeStyle(priority: string) {
  switch (priority) {
    case 'High':
      return 'bg-rose-950/50 text-rose-300 border-rose-800/40';
    case 'Medium':
      return 'bg-amber-950/50 text-amber-300 border-amber-800/40';
    case 'Low':
    default:
      return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/30';
  }
}
