'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/server/supabase-browser';

type AuthPanelProps = {
  initialUserEmail: string | null;
  redirectPath: string;
};

export function AuthPanel({ initialUserEmail, redirectPath }: AuthPanelProps) {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    setIsLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        throw error;
      }

      setStatusMessage(`Magic link sent to ${email}.`);
      setEmail('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send magic link.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignOut() {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUserEmail(null);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (userEmail) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold">Signed in</h2>
        <p className="mt-2 text-sm text-slate-600">{userEmail}</p>
        <button
          className="mt-4 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 disabled:opacity-60"
          disabled={isLoading}
          onClick={() => void handleSignOut()}
          type="button"
        >
          Sign out
        </button>
        {errorMessage ? <p className="mt-3 text-sm text-amber-700">{errorMessage}</p> : null}
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold">Sign in</h2>
      <p className="mt-2 text-sm text-slate-600">
        Use a Supabase magic link so progress and review scheduling persist between sessions.
      </p>
      <form className="mt-4 space-y-3" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block text-sm font-medium text-slate-900" htmlFor="email">
          Email
        </label>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          id="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
        <button
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={isLoading || email.trim() === ''}
          type="submit"
        >
          Send magic link
        </button>
      </form>
      {statusMessage ? <p className="mt-3 text-sm text-emerald-700">{statusMessage}</p> : null}
      {errorMessage ? <p className="mt-3 text-sm text-amber-700">{errorMessage}</p> : null}
    </section>
  );
}
