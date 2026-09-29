"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";
import { Toaster } from "sonner";
import { cn } from "@/lib/cn";
import { THEME_STORAGE_KEY as STORAGE_KEY, type Theme } from "@/lib/theme";

function storedTheme(): Theme | null {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

function preferredTheme(): Theme {
  return storedTheme() ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

const applyTheme = (t: Theme) => document.documentElement.setAttribute("data-theme", t);

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** True while dark mode is on. Server render and hydration assume light. */
export function useIsDark() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.getAttribute("data-theme") === "dark",
    () => false,
  );
}

/**
 * Keeps <html data-theme> right after hydration: React's dev remount clears attributes the
 * inline script set, and the theme follows the system while the shopper hasn't picked one.
 */
export function ThemeSync() {
  useLayoutEffect(() => {
    applyTheme(preferredTheme());
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (!storedTheme()) applyTheme(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);
  return null;
}

/** Sun/moon button that switches themes and remembers the choice. */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useIsDark();
  return (
    <button
      type="button"
      onClick={() => {
        const next: Theme = dark ? "light" : "dark";
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {}
        applyTheme(next);
      }}
      aria-label="Dark mode"
      aria-pressed={dark}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex items-center justify-center rounded-full p-2 text-white transition-colors hover:bg-white/10",
        className,
      )}
    >
      <Moon size={20} className="dark:hidden" aria-hidden />
      <Sun size={20} className="hidden text-amz-search dark:block" aria-hidden />
    </button>
  );
}

/** Toasts styled for the current theme. */
export function ThemedToaster() {
  const dark = useIsDark();
  return <Toaster position="top-center" richColors closeButton theme={dark ? "dark" : "light"} />;
}
