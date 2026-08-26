"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-[#202020] bg-[#090909]/95 shadow-2xl backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg text-zinc-100">Sign In</CardTitle>
        <CardDescription>
          Enter your student credentials to access your dashboard
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-400 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

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
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Password
              </label>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            <span>Sign In to Deadline</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-center justify-center gap-2 border-t border-[#161616] text-xs text-zinc-400">
        <div>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
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
            Welcome to Deadline
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in to manage your university courses and conquer deadlines.
          </p>
        </div>

        <React.Suspense
          fallback={
            <div className="rounded-xl border border-[#202020] bg-[#090909] p-8 text-center text-zinc-500 flex items-center justify-center gap-2 text-xs">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              <span>Loading login...</span>
            </div>
          }
        >
          <LoginForm />
        </React.Suspense>

        {/* Quick Tips */}
        <p className="text-center text-[11px] text-zinc-600">
          Protected by Supabase Auth & PostgreSQL Row Level Security.
        </p>
      </div>
    </div>
  );
}
