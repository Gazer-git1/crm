import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";

export function VerifyEmailPage() {
  const { user, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  if (user?.email_verified) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error(await res.text());
      await refresh();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      setNotice("A new code has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend the code");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`Enter the 6-digit code we sent to ${user?.email ?? "your email"}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="text-center text-lg tracking-[0.5em]"
        />

        {error && <p className="text-sm text-rose-600">{error}</p>}
        {notice && <p className="text-sm text-emerald-600">{notice}</p>}

        <Button type="submit" disabled={submitting || code.length !== 6} className="w-full justify-center">
          {submitting ? "Verifying…" : "Verify"}
        </Button>
      </form>

      <button
        onClick={handleResend}
        disabled={resending}
        className="mt-4 w-full text-center text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
      >
        {resending ? "Sending…" : "Resend code"}
      </button>

      <button
        onClick={() => logout().then(() => navigate("/login", { replace: true }))}
        className="mt-6 w-full text-center text-sm text-slate-400 hover:underline"
      >
        Log out
      </button>
    </AuthLayout>
  );
}
