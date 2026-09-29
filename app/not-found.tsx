import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-sky px-6 py-16 text-center">
      <Logo dark />
      <p className="mt-10 bg-gradient-to-br from-strong to-brand bg-clip-text text-8xl font-extrabold tracking-tight text-transparent">404</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Sorry, we couldn&apos;t find that page</h1>
      <p className="mt-2 max-w-md text-sm text-amz-muted">
        The link may be broken, or the product may no longer be available. Try the homepage or today&apos;s deals.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white shadow-[0_2px_8px_rgba(47,128,237,0.28)] hover:bg-brand-hover">
          Go to homepage
        </Link>
        <Link href="/deals" className="rounded-full bg-surface px-5 py-2 text-sm ring-1 ring-rim hover:bg-sky-tint hover:text-brand">
          See today&apos;s deals
        </Link>
      </div>
    </main>
  );
}
