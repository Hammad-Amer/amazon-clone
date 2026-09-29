"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { SORT_OPTIONS, type SortKey } from "@/lib/search";

export function SortSelect({ value, hrefs }: { value: SortKey; hrefs: Record<SortKey, string> }) {
  const router = useRouter();
  return (
    <label className="relative flex items-center gap-1 rounded-full bg-sky-tint px-3 py-1.5 text-[13px] ring-1 ring-[#bcd6f7] hover:ring-brand">
      <span className="text-amz-text">Sort by:</span>
      <span className="font-bold text-brand">{SORT_OPTIONS[value]}</span>
      <ChevronDown size={14} className="text-brand" />
      <select
        aria-label="Sort by"
        value={value}
        onChange={(e) => router.push(hrefs[e.target.value as SortKey])}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {Object.entries(SORT_OPTIONS).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** On small screens the (server-rendered) filter sidebar lives in a drawer. */
export function MobileFilters({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-[#bcd6f7] lg:hidden"
      >
        <SlidersHorizontal size={15} /> Filters{count > 0 && <span className="font-bold text-brand">({count})</span>}
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} label="Filters">
        <div className="flex items-center justify-between border-b border-amz-border px-5 py-3.5">
          <h2 className="text-lg font-bold">Filters</h2>
        </div>
        {/* Any link click inside navigates; close the drawer so results are visible. */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {children}
        </div>
      </Drawer>
    </>
  );
}
