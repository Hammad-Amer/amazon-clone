import Link from "next/link";

/** Minimal chrome for sign-in and checkout, like Amazon's distraction-free flows. */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main className="flex-1 bg-white">{children}</main>
      <footer className="border-t border-amz-border bg-gradient-to-b from-[#f7f8f8] to-white py-6 text-center text-xs">
        <nav className="flex justify-center gap-6 text-amz-link">
          <Link href="/" className="hover:text-amz-link-hover hover:underline">Home</Link>
          <Link href="/deals" className="hover:text-amz-link-hover hover:underline">Today&apos;s Deals</Link>
          <a href="https://github.com/Hammad-Amer/amazon-clone" className="hover:text-amz-link-hover hover:underline">About</a>
        </nav>
        <p className="mt-2 text-amz-muted">© 2026 amazon.clone — a portfolio demo. Not affiliated with Amazon.</p>
      </footer>
    </>
  );
}
