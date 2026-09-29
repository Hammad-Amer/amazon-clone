"use client";

import { CircleAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { useAuth } from "@/store/auth";
import { signInDemo } from "@/store/demo";
import { useHydrated } from "@/store/StoreHydrator";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only allow same-site relative redirects. */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function useAfterAuth() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  return (name: string) => {
    toast.success(`Welcome, ${name.split(" ")[0]}!`);
    router.replace(next);
  };
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div role="alert" className="mb-4 flex gap-3 rounded-lg border border-amz-deal p-4 shadow-[inset_0_0_0_4px_#fcf4f4]">
      <CircleAlert className="shrink-0 text-amz-deal" />
      <div>
        <p className="font-bold text-amz-deal">There was a problem</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

function DemoButton() {
  const done = useAfterAuth();
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    await signInDemo();
    done("Demo Shopper");
  };

  // "/signin?demo=1" (from the homepage card) signs in straight away.
  const params = useSearchParams();
  const hydrated = useHydrated();
  const started = useRef(false);
  useEffect(() => {
    if (hydrated && params.get("demo") === "1" && !started.current) {
      started.current = true;
      run();
    }
  });

  return (
    <div className="mt-5 rounded-lg bg-[#f0f7f8] p-4 text-center">
      <p className="flex items-center justify-center gap-1.5 text-sm font-bold">
        <Sparkles size={16} className="text-[#e47911]" /> Reviewing this project?
      </p>
      <p className="mt-1 text-xs text-amz-muted">Skip sign-up and explore with a pre-filled demo account.</p>
      <Button variant="dark" size="sm" className="mt-3 w-full" onClick={run} disabled={busy}>
        {busy ? "Signing in…" : "Use demo account"}
      </Button>
    </div>
  );
}

export function SignInForm() {
  const signIn = useAuth((s) => s.signIn);
  const done = useAfterAuth();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address";
    if (!password) next.password = "Enter your password";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const err = await signIn(email, password);
    setBusy(false);
    if (err) setFormError(err);
    else done(useAuth.getState().user!.name);
  };

  return (
    <>
      {formError && <ErrorBox message={formError} />}
      <div className="rounded-lg border border-amz-border p-6">
        <h1 className="text-[28px] font-normal leading-tight">Sign in</h1>
        <form onSubmit={onSubmit} noValidate className="mt-4 space-y-3.5">
          <Field label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoFocus />
          <Field label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
          <Button type="submit" size="sm" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Continue"}
          </Button>
        </form>
        <p className="mt-4 text-xs">
          By continuing, you agree to amazon.clone&apos;s <span className="text-amz-link">Conditions of Use</span> and{" "}
          <span className="text-amz-link">Privacy Notice</span>.
        </p>
        <DemoButton />
      </div>
      <div className="relative mt-6 text-center text-xs text-amz-muted">
        <span className="absolute inset-x-0 top-1/2 h-px bg-amz-border" />
        <span className="relative bg-white px-2">New to amazon.clone?</span>
      </div>
      <Link
        href={`/register${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`}
        className="mt-3 block rounded-full border border-amz-border py-1.5 text-center text-[13px] shadow-sm hover:bg-gray-50"
      >
        Create your amazon.clone account
      </Link>
    </>
  );
}

export function RegisterForm() {
  const register = useAuth((s) => s.register);
  const done = useAfterAuth();
  const params = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Enter your name";
    if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email address";
    if (form.password.length < 6) next.password = "Minimum 6 characters required";
    if (form.confirm !== form.password) next.confirm = "Passwords must match";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const err = await register(form.name, form.email, form.password);
    setBusy(false);
    if (err) setFormError(err);
    else done(form.name);
  };

  return (
    <>
      {formError && <ErrorBox message={formError} />}
      <div className="rounded-lg border border-amz-border p-6">
        <h1 className="text-[28px] font-normal leading-tight">Create account</h1>
        <form onSubmit={onSubmit} noValidate className="mt-4 space-y-3.5">
          <Field label="Your name" name="name" autoComplete="name" placeholder="First and last name" value={form.name} onChange={set("name")} error={errors.name} autoFocus />
          <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
          <Field label="Password" name="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" hint="Passwords must be at least 6 characters." value={form.password} onChange={set("password")} error={errors.password} />
          <Field label="Re-enter password" name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={set("confirm")} error={errors.confirm} />
          <Button type="submit" size="sm" className="w-full" disabled={busy}>
            {busy ? "Creating account…" : "Create your amazon.clone account"}
          </Button>
        </form>
        <p className="mt-4 text-xs text-amz-muted">
          This is a demo store: your account is saved only in this browser. Please don&apos;t reuse a real password.
        </p>
        <hr className="my-4 border-amz-border" />
        <p className="text-[13px]">
          Already have an account?{" "}
          <Link
            href={`/signin${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`}
            className="text-amz-link hover:text-amz-link-hover hover:underline"
          >
            Sign in ›
          </Link>
        </p>
      </div>
    </>
  );
}
