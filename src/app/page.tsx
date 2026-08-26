import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  BookOpen,
  Shield,
  Layers,
  Flame,
  Zap,
} from "lucide-react";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black text-[#F5F5F5] flex flex-col selection:bg-purple-600/30 selection:text-purple-200">
      {/* Top Navigation */}
      <nav className="border-b border-[#141414] bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 shadow-purple-glow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Deadline
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                <span>Get Started Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center relative overflow-hidden">
        {/* Glowing purple backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/50 border border-purple-800/40 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Academic Workload & Deadline Hub</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Never miss an assignment deadline again.
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Deadline organizes your university courses, problem sets, exams, and projects into a high-contrast AMOLED dashboard with intelligent deadline alerts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                <span>Start Managing Deadlines</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 text-left relative z-10">
          <div className="rounded-2xl border border-[#1C1C1C] bg-[#080808] p-6 space-y-3 hover:border-purple-900/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">
              Courses & Subjects Hub
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Group assignments by subject with custom accent colors, instructor details, and calculated completion percentages.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1C1C1C] bg-[#080808] p-6 space-y-3 hover:border-purple-900/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-400">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">
              Intelligent Deadlines
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Live countdown timers and urgency badges (&quot;Due tomorrow &middot; 11:59 PM&quot;, &quot;Overdue &middot; 2 days&quot;) keep priorities crystal clear.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1C1C1C] bg-[#080808] p-6 space-y-3 hover:border-purple-900/40 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">
              Interactive Calendar & Files
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Monthly deadline views, subtasks breakdown checklists, and file attachments backed by Supabase PostgreSQL.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#141414] py-6 text-center text-xs text-zinc-600">
        <p>Deadline &copy; {new Date().getFullYear()} &mdash; Production Student Assignment &amp; Deadline Manager</p>
      </footer>
    </div>
  );
}
