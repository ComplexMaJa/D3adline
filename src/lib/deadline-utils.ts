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
import { id as localeId } from "date-fns/locale/id";
import { AssignmentStatus } from "@/types/database";
import { Language } from "@/lib/i18n/types";

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
    const d = new Date(`${dueDateStr}T${cleanTime}`);
    if (isNaN(d.getTime())) {
      return parseISO(dueDateStr);
    }
    return d;
  } catch {
    return parseISO(dueDateStr);
  }
}

export function getDeadlineInfo(
  dueDateStr: string,
  dueTimeStr?: string | null,
  statusOrLang?: AssignmentStatus | Language,
  maybeLanguage?: Language
): DeadlineInfo {
  let status: AssignmentStatus | undefined;
  let language: Language = 'en';

  if (statusOrLang === 'en' || statusOrLang === 'id') {
    language = statusOrLang;
  } else {
    status = statusOrLang;
    if (maybeLanguage) {
      language = maybeLanguage;
    }
  }

  const deadline = parseAssignmentDeadline(dueDateStr, dueTimeStr);
  const now = new Date();
  const today = startOfDay(now);
  const deadlineDay = startOfDay(deadline);
  const isId = language === 'id';
  const locale = isId ? localeId : undefined;
  
  const isCompleted = status === 'Completed';
  const daysDiff = differenceInCalendarDays(deadlineDay, today);
  const hoursDiff = differenceInHours(deadline, now);
  const isPast = isBefore(deadline, now) && !isToday(deadline);
  const isOverdue = (status === 'Overdue' || isPast || (isToday(deadline) && isBefore(deadline, now))) && !isCompleted;
  
  const formattedDate = format(deadline, isId ? "d MMM yyyy" : "MMM d, yyyy", { locale });
  const formattedTime = format(deadline, isId ? "HH:mm" : "h:mm a");

  if (isCompleted) {
    return {
      label: isId ? `Selesai · ${formattedDate}` : `Completed · ${formattedDate}`,
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
      label = isId ? `Terlewat · Kemarin` : `Overdue · Yesterday`;
    } else if (daysDiff < 0) {
      const absDays = Math.abs(daysDiff);
      label = isId
        ? `Terlewat · ${absDays} hari lalu`
        : `Overdue · ${absDays} day${absDays > 1 ? 's' : ''} ago`;
    } else {
      label = isId ? `Terlewat · ${formattedTime}` : `Overdue · ${formattedTime}`;
    }
  } else if (isToday(deadline)) {
    urgencyLevel = 'high';
    if (hoursDiff > 0 && hoursDiff <= 3) {
      label = isId
        ? `Tenggat dalam ${hoursDiff} jam · ${formattedTime}`
        : `Due in ${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} · ${formattedTime}`;
    } else {
      label = isId ? `Tenggat hari ini · ${formattedTime}` : `Due today · ${formattedTime}`;
    }
  } else if (isTomorrow(deadline)) {
    urgencyLevel = 'medium';
    label = isId ? `Tenggat besok · ${formattedTime}` : `Due tomorrow · ${formattedTime}`;
  } else if (daysDiff > 1 && daysDiff <= 7) {
    urgencyLevel = daysDiff <= 3 ? 'medium' : 'normal';
    label = isId
      ? `Tenggat dalam ${daysDiff} hari · ${format(deadline, "EEE, d MMM", { locale })}`
      : `Due in ${daysDiff} days · ${format(deadline, "EEE, MMM d")}`;
  } else {
    urgencyLevel = 'normal';
    label = isId ? `Tenggat ${formattedDate}` : `Due ${formattedDate}`;
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

export function formatDeadline(
  dueDateStr: string,
  dueTimeStr?: string | null,
  statusOrLang?: AssignmentStatus | Language,
  maybeLanguage?: Language
) {
  let status: AssignmentStatus | undefined;
  let language: Language = 'en';

  if (statusOrLang === 'en' || statusOrLang === 'id') {
    language = statusOrLang;
  } else {
    status = statusOrLang;
    if (maybeLanguage) {
      language = maybeLanguage;
    }
  }

  const info = getDeadlineInfo(dueDateStr, dueTimeStr, status, language);
  const deadline = parseAssignmentDeadline(dueDateStr, dueTimeStr);
  const isDueSoon = info.isDueThisWeek;
  const isId = language === 'id';
  const locale = isId ? localeId : undefined;

  let relative = info.label;
  if (info.isOverdue) {
    const hours = Math.max(1, Math.abs(differenceInHours(deadline, new Date())));
    if (hours < 24) {
      relative = isId ? `Terlewat · ${hours} jam` : `Overdue · ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      relative = info.label;
    }
  } else if (info.isDueToday) {
    relative = isId ? "Tenggat hari ini" : "Due today";
  } else if (info.isDueTomorrow) {
    relative = isId ? "Tenggat besok" : "Due tomorrow";
  } else if (info.daysRemaining > 0 && info.daysRemaining <= 7) {
    relative = isId ? `Tenggat dalam ${info.daysRemaining} hari` : `Due in ${info.daysRemaining} days`;
  }

  let absolute = format(deadline, isId ? "EEE, d MMM" : "EEE, MMM d", { locale });
  if (info.isDueToday) {
    absolute = isId ? `Hari ini · ${info.formattedTime}` : `Due today · ${info.formattedTime}`;
  } else if (info.isOverdue) {
    absolute = isId
      ? `Terlewat · ${format(deadline, "d MMM yyyy", { locale })}`
      : `Overdue · ${format(deadline, "MMM d, yyyy")}`;
  }

  return {
    relative,
    absolute,
    isOverdue: info.isOverdue,
    isDueToday: info.isDueToday,
    isDueSoon,
    raw: info,
  };
}

