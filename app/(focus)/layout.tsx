import Link from "next/link";
import { ThemeToggle } from "@/components/layout/Theme";

/** Minimal chrome for sign-in and checkout, like Amazon's distraction-free flows. */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main className="flex-1 bg-sky">{children}</main>
      <footer className="border-t border-amz-border bg-surface py-6 text-center text-xs">
        <nav className="flex items-center justify-center gap-6 font-medium text-brand">
          <Link href="/" className="hover:text-brand-hover hover:underline">Home</Link>
          <Link href="/deals" className="hover:text-brand-hover hover:underline">Today&apos;s Deals</Link>
          <a href="https://github.com/Hammad-Amer/amazon-clone" className="hover:text-brand-hover hover:underline">About</a>
          <ThemeToggle className="p-1.5 text-amz-text hover:bg-sky-tint" />
        </nav>
        <p className="mt-2 text-amz-muted">© 2026 amazon.clone — a portfolio demo. Not affiliated with Amazon.</p>
      </footer>
    </>
  );
}
