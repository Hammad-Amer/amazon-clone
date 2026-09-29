import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell>
      <SignInForm />
    </AuthShell>
  );
}
