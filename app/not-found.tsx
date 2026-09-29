import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-16 text-center">
      <Logo dark />
      <p className="mt-10 text-7xl font-extrabold text-amz-search">404</p>
      <h1 className="mt-2 text-2xl font-bold">Sorry, we couldn&apos;t find that page</h1>
      <p className="mt-2 max-w-md text-sm text-amz-muted">
        The link may be broken, or the product may no longer be available. Try the homepage or today&apos;s deals.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="rounded-full bg-amz-yellow px-5 py-2 text-sm hover:bg-amz-yellow-hover">
          Go to homepage
        </Link>
        <Link href="/deals" className="rounded-full border border-amz-border px-5 py-2 text-sm hover:bg-gray-50">
          See today&apos;s deals
        </Link>
      </div>
    </main>
  );
}
