"use client";

import { useState } from "react";

import { sanitizeRedirect } from "@/shared/lib/redirects";

export function LoginForm(params: LoginFormParams): React.JSX.Element {
  const { expired, redirectTo } = params;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);

    let navigating = false;

    try {
      const result = await login(username, password);

      if (result.ok) {
        navigating = true;
        // Hard navigation, not router.push: the unauthenticated prefetch of
        // "/admin" left a stale redirect-to-login entry in the client Router
        // Cache. Only a full document load re-runs the proxy with the fresh
        // session cookie.
        window.location.assign(sanitizeRedirect(redirectTo, window.location.origin));
        return;
      }

      if (result.status === 429) {
        setError("Too many attempts. Please try again later.");
        return;
      }

      setPassword("");
      setError("Invalid username or password.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      if (!navigating) {
        setLoading(false);
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-gray-900">Admin Login</h1>

        {expired && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Your session expired. Please log in again.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoFocus
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}

async function login(username: string, password: string): Promise<LoginResult> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return { ok: response.ok, status: response.status };
}

interface LoginResult {
  ok: boolean;
  status: number;
}

interface LoginFormParams {
  expired: boolean;
  redirectTo: string | undefined;
}
