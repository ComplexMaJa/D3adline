"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, PlusCircle, Edit3 } from "lucide-react";
import { Assignment } from "@/types/database";
import { formatDistanceToNow, parseISO } from "date-fns";

interface RecentActivityProps {
  assignments: Assignment[];
}

export function RecentActivity({ assignments }: RecentActivityProps) {
  // Derive recent activities from assignment timestamps and statuses
  const activities = React.useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      action: "Completed" | "Created" | "Updated";
      timeAgo: string;
      assignmentId: string;
    }> = [];

    // 1. Completed assignments
    const completed = assignments.filter((a) => a.status === "Completed" || a.progress === 100);
    completed.slice(0, 2).forEach((a) => {
      let timeAgo = "Recently";
      try {
        timeAgo = formatDistanceToNow(parseISO(a.updated_at || a.created_at), { addSuffix: true });
      } catch {}
      list.push({
        id: `comp-${a.id}`,
        title: a.title,
        action: "Completed",
        timeAgo,
        assignmentId: a.id,
      });
    });

    // 2. Newly created / in-progress assignments
    const active = assignments.filter((a) => a.status !== "Completed" && a.progress < 100);
    if (active.length > 0) {
      let timeAgo = "Recently";
      try {
        timeAgo = formatDistanceToNow(parseISO(active[0].created_at), { addSuffix: true });
      } catch {}
      list.push({
        id: `create-${active[0].id}`,
        title: active[0].title,
        action: "Created",
        timeAgo,
        assignmentId: active[0].id,
      });
    }

    if (active.length > 1) {
      let timeAgo = "Recently";
      try {
        timeAgo = formatDistanceToNow(parseISO(active[1].updated_at || active[1].created_at), { addSuffix: true });
      } catch {}
      list.push({
        id: `update-${active[1].id}`,
        title: active[1].title,
        action: "Updated",
        timeAgo,
        assignmentId: active[1].id,
      });
    }

    return list.slice(0, 4);
  }, [assignments]);

  return (
    <div className="rounded-2xl border border-[#181818] bg-[#070707] p-5 space-y-4 hover:border-[#222222] transition-colors h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          <Activity className="h-4 w-4 text-purple-400" />
          <span>Recent Activity</span>
        </div>
        <Link
          href="/assignments"
          className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Activity List */}
      {activities.length === 0 ? (
        <div className="py-6 text-center text-xs text-zinc-500">
          No recent activity logged yet.
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((item) => {
            return (
              <Link
                key={item.id}
                href={`/assignments/${item.assignmentId}`}
                className="flex items-center justify-between gap-3 p-1.5 rounded-lg hover:bg-[#0E0E0E] transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Action Icon */}
                  {item.action === "Completed" ? (
                    <div className="h-6 w-6 rounded-full bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  ) : item.action === "Created" ? (
                    <div className="h-6 w-6 rounded-full bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 shrink-0">
                      <PlusCircle className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0">
                      <Edit3 className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {/* Title */}
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-purple-300 transition-colors truncate">
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Action label */}
                  <span
                    className={`text-[10px] font-semibold ${
                      item.action === "Completed"
                        ? "text-emerald-400"
                        : item.action === "Created"
                        ? "text-blue-400"
                        : "text-purple-400"
                    }`}
                  >
                    {item.action}
                  </span>

                  {/* Relative timestamp */}
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {item.timeAgo}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
