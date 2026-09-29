import { Suspense } from "react";
import { Logo } from "@/components/layout/Logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[350px] px-4 pb-10 pt-4">
      <div className="mb-4 flex justify-center">
        <Logo dark />
      </div>
      <Suspense>{children}</Suspense>
    </div>
  );
}
