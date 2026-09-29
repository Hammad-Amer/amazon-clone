"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/** Left slide-in panel with dimmed backdrop, Escape to close, and body scroll lock. */
export function Drawer({
  open,
  onClose,
  label,
  children,
  side = "left",
  className,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-black/80 animate-fade-in" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "absolute top-0 flex h-full w-[85vw] max-w-[365px] flex-col bg-surface outline-none",
          side === "left" ? "left-0 animate-slide-in" : "right-0",
          className,
        )}
      >
        {children}
      </div>
      <button
        onClick={onClose}
        aria-label="Close menu"
        className={cn(
          "absolute top-2.5 p-1 text-white",
          side === "left" ? "left-[min(85vw,365px)] ml-3" : "right-[min(85vw,365px)] mr-3",
        )}
      >
        <X size={30} />
      </button>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "sm",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          "relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg bg-surface shadow-2xl animate-fade-in",
          size === "lg" ? "max-w-xl" : "max-w-sm",
        )}
      >
        <div className="flex items-center justify-between border-b border-amz-border bg-sky px-5 py-3">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-amz-muted hover:text-amz-text">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
