"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Sparkles, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [displayName, setDisplayName] = React.useState("");
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
      setError("Please fill in all fields.");
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
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
            Start organizing your courses and tracking assignments today.
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-[#202020] bg-[#090909]/95 shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-zinc-100">Sign Up</CardTitle>
            <CardDescription>
              Enter your student details to get started
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

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Full Name / Display Name
                  </label>
                  <Input
                    placeholder="e.g. Kidung Mahadewa"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    leftIcon={<User className="h-4 w-4" />}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="student@university.edu"
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
                  className="w-full mt-2"
                  isLoading={isLoading}
                >
                  <span>Create Student Account</span>
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
