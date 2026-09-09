"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  School,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/database";

export default function RegisterPage() {
  const [role, setRole] = React.useState<UserRole>("student");
  const [displayName, setDisplayName] = React.useState("");
  const [institution, setInstitution] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            role: role,
            institution: institution.trim() || null,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // If user session is established immediately
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      console.error("Register error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden py-12">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in">
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 shadow-purple-glow mb-1">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create Your Account
          </h1>
          <p className="text-xs text-zinc-400">
            Join Deadline to organize courses, manage assignments, and conquer deadlines.
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-[#202020] bg-[#090909]/95 shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-zinc-100">Sign Up</CardTitle>
            <CardDescription>
              Select your academic role and enter your details
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 text-center space-y-3 animate-fade-in">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/40 border border-emerald-800/50 text-emerald-400 mx-auto">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-emerald-300">
                  Account Created Successfully!
                </h4>
                <p className="text-xs text-zinc-400">
                  Your {role === "teacher" ? "teacher/instructor" : "student"} account is ready.
                  You can now sign in with your email and password.
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full mt-2"
                >
                  Go to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-400 flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Role Selector Cards */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-2">
                    I am registering as:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Student Card */}
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={cn(
                        "flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer relative",
                        role === "student"
                          ? "border-purple-500/70 bg-purple-950/30 text-white shadow-purple-glow-sm"
                          : "border-[#1E1E1E] bg-[#050505] text-zinc-400 hover:border-[#2C2C2C] hover:bg-[#0A0A0A]"
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <div
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg border",
                            role === "student"
                              ? "bg-purple-600/30 border-purple-500/50 text-purple-300"
                              : "bg-[#111111] border-[#222222] text-zinc-500"
                          )}
                        >
                          <GraduationCap className="h-4 w-4" />
                        </div>
                        {role === "student" && (
                          <span className="h-2 w-2 rounded-full bg-purple-400 shadow-sm" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-zinc-100">
                        Student
                      </span>
                      <span className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        Track deadlines & coursework
                      </span>
                    </button>

                    {/* Teacher Card */}
                    <button
                      type="button"
                      onClick={() => setRole("teacher")}
                      className={cn(
                        "flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer relative",
                        role === "teacher"
                          ? "border-emerald-500/70 bg-emerald-950/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                          : "border-[#1E1E1E] bg-[#050505] text-zinc-400 hover:border-[#2C2C2C] hover:bg-[#0A0A0A]"
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <div
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg border",
                            role === "teacher"
                              ? "bg-emerald-600/30 border-emerald-500/50 text-emerald-300"
                              : "bg-[#111111] border-[#222222] text-zinc-500"
                          )}
                        >
                          <School className="h-4 w-4" />
                        </div>
                        {role === "teacher" && (
                          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-zinc-100">
                        Teacher / Instructor
                      </span>
                      <span className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        Create classes & assign tasks
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Full Name / Display Name
                  </label>
                  <Input
                    placeholder={
                      role === "teacher"
                        ? "e.g. Prof. Robert Hoffman"
                        : "e.g. Kidung Mahadewa"
                    }
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    leftIcon={<User className="h-4 w-4" />}
                    required
                    autoFocus
                  />
                </div>

                {role === "teacher" && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      University / School / Institution (Optional)
                    </label>
                    <Input
                      placeholder="e.g. Faculty of Engineering or Stanford"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      leftIcon={<Building2 className="h-4 w-4" />}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder={
                      role === "teacher"
                        ? "instructor@university.edu"
                        : "student@university.edu"
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="h-4 w-4" />}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="h-4 w-4" />}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Confirm
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      leftIcon={<Lock className="h-4 w-4" />}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className={cn(
                    "w-full mt-2 transition-all duration-200",
                    role === "teacher" &&
                      "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-500/40 text-white"
                  )}
                  isLoading={isLoading}
                >
                  <span>
                    {role === "teacher"
                      ? "Create Teacher Account"
                      : "Create Student Account"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center gap-2 border-t border-[#161616] text-xs text-zinc-400">
            <div>
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
