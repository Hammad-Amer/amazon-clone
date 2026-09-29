import { Suspense } from "react";
import { Logo } from "@/components/layout/Logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[380px] px-4 pb-12 pt-6">
      <div className="mb-5 flex justify-center">
        <Logo dark />
      </div>
      <Suspense>{children}</Suspense>
    </div>
  );
}
