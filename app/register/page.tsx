"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: undefined },
      });
      if (signUpError) throw signUpError;
      // When email verification is disabled, session is returned immediately
      if (data?.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <div className="rounded-xl border border-aqua-pale/50 bg-white p-8 shadow-sm text-center">
          <h1 className="font-serif text-2xl font-bold text-teal-deep">
            Check your email
          </h1>
          <p className="mt-2 text-gray-600">
            We&apos;ve sent a confirmation link to {email}. Click it to activate
            your account.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-teal-deep hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="rounded-xl border border-aqua-pale/50 bg-white p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-bold text-teal-deep">
          Create account
        </h1>
        <p className="mt-2 text-gray-600">
          Register to access the SafePool dashboard.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-teal-deep"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-teal-deep"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-deep py-2 text-white transition hover:bg-teal-dark disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-deep hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
