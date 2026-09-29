"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { SORT_OPTIONS, type SortKey } from "@/lib/search";

export function SortSelect({ value, hrefs }: { value: SortKey; hrefs: Record<SortKey, string> }) {
  const router = useRouter();
  return (
    <label className="relative flex items-center gap-1 rounded-lg border border-amz-border bg-[#f0f2f2] px-2.5 py-1 text-[13px] shadow-sm hover:bg-[#e3e6e6]">
      <span className="text-amz-text">Sort by:</span>
      <span>{SORT_OPTIONS[value]}</span>
      <ChevronDown size={14} />
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
        className="flex items-center gap-1.5 rounded-lg border border-amz-border bg-white px-3 py-1.5 text-sm shadow-sm lg:hidden"
      >
        <SlidersHorizontal size={15} /> Filters{count > 0 && <span className="text-amz-link">({count})</span>}
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
