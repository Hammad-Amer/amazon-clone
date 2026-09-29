"use client";

import { ChevronDown, Clock, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { DEPARTMENTS, departmentOf, filterLabel } from "@/lib/departments";
import { cn } from "@/lib/cn";
import { withParsedQuery } from "@/lib/query";
import { searchHref as buildSearchHref } from "@/lib/url";
import type { Suggestion } from "@/lib/types";

const RECENT_KEY = "amz-recent-searches";

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6)));
  } catch {}
}

type Option = { key: string; label: React.ReactNode; href: string; recent?: string };

function SearchForm({ initialK, initialC }: { initialK: string; initialC: string }) {
  const router = useRouter();
  const listId = useId();
  const [k, setK] = useState(initialK);
  const [c, setC] = useState(initialC);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced autocomplete fetch.
  useEffect(() => {
    const q = k.trim();
    if (!q) return; // empty input shows recent searches instead
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then(setSuggestions)
        .catch(() => {});
    }, 150);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [k]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const searchHref = (text: string, cat = c) => {
    const params = { k: text.trim() || undefined, c: cat || undefined };
    // Go straight to the parsed URL ("shoes under 50" -> k=shoes&max=50); the results
    // page does the same for links and no-JS submits.
    return buildSearchHref(withParsedQuery(params) ?? params);
  };

  const go = (href: string, text?: string) => {
    if (text?.trim()) {
      const next = [text.trim(), ...readRecent().filter((r) => r !== text.trim())];
      writeRecent(next);
    }
    setOpen(false);
    inputRef.current?.blur();
    router.push(href);
  };

  const options: Option[] = k.trim()
    ? suggestions.map((s, i) => ({
        key: `${i}-${s.text}`,
        href: s.productId ? `/dp/${s.productId}` : searchHref(s.text, s.category?.slug ?? c),
        label: s.category ? (
          <>
            <Highlight text={s.text} q={k} />{" "}
            <span className="text-amz-link">in {s.category.label}</span>
          </>
        ) : (
          <Highlight text={s.text} q={k} />
        ),
      }))
    : recent.map((r) => ({ key: `r-${r}`, href: searchHref(r), label: r, recent: r }));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? options.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && options.length > 0;

  return (
    <>
      {/* Amazon dims the page while the search box is focused. */}
      {showDropdown && <div className="fixed inset-0 top-0 z-30 bg-black/50 animate-fade-in" aria-hidden />}
      <div ref={rootRef} className="relative z-40 flex-1">
        <form
          role="search"
          action="/s" // native GET fallback if someone submits before JS has loaded
          onSubmit={(e) => {
            e.preventDefault();
            const opt = options[active];
            if (showDropdown && opt) go(opt.href, opt.recent ?? k);
            else go(searchHref(k), k);
          }}
          className="flex h-10 overflow-hidden rounded-md bg-white focus-within:ring-[3px] focus-within:ring-amz-search"
        >
          <label className="relative hidden shrink-0 items-center gap-1 border-r border-amz-border bg-[#e6e6e6] px-2 text-xs text-amz-muted hover:bg-[#dadada] hover:text-amz-text sm:flex">
            <span className="max-w-40 truncate">{c ? filterLabel(c) : "All"}</span>
            <ChevronDown size={12} />
            <select
              name="c"
              aria-label="Select the department you want to search in"
              value={c}
              onChange={(e) => setC(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <input
            ref={inputRef}
            name="k"
            value={k}
            onChange={(e) => {
              setK(e.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onFocus={() => {
              setRecent(readRecent());
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search amazon.clone"
            aria-label="Search amazon.clone"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            className="min-w-0 flex-1 px-3 text-[15px] text-amz-text outline-none placeholder:text-[#6b6b6b]"
            autoComplete="off"
            enterKeyHint="search"
          />
          <button
            type="submit"
            aria-label="Go"
            className="flex w-12 shrink-0 items-center justify-center bg-amz-search text-amz-text hover:bg-amz-search-hover"
          >
            <Search size={22} strokeWidth={2.4} />
          </button>
        </form>

        {showDropdown && (
          <ul
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-full mt-0.5 overflow-hidden rounded-b-md border border-amz-border bg-white py-1 text-[15px] shadow-lg"
          >
            {!k.trim() && (
              <li className="px-3 pb-1 pt-1 text-xs font-bold uppercase tracking-wide text-amz-muted">
                Recent searches
              </li>
            )}
            {options.map((o, i) => (
              <li
                key={o.key}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 px-3 py-1.5 text-amz-text",
                  i === active && "bg-sky",
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(o.href, o.recent ?? (typeof o.label === "string" ? o.label : k));
                }}
              >
                {o.recent ? (
                  <Clock size={15} className="shrink-0 text-amz-muted" />
                ) : (
                  <Search size={15} className="shrink-0 text-amz-muted" />
                )}
                <span className="flex-1 truncate">{o.label}</span>
                {o.recent && (
                  <button
                    type="button"
                    aria-label={`Remove ${o.recent} from recent searches`}
                    className="rounded p-1 text-amz-muted hover:bg-gray-200 hover:text-amz-text"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const next = readRecent().filter((r) => r !== o.recent);
                      writeRecent(next);
                      setRecent(next);
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/** Bolds the part of a suggestion the user hasn't typed yet, like Amazon does. */
function Highlight({ text, q }: { text: string; q: string }) {
  const typed = q.trim().toLowerCase();
  if (typed && text.startsWith(typed)) {
    return (
      <span>
        {typed}
        <b>{text.slice(typed.length)}</b>
      </span>
    );
  }
  return <b>{text}</b>;
}

function SearchFromParams() {
  const params = useSearchParams();
  const k = params.get("k") ?? "";
  // The dropdown only offers departments, so a category filter (e.g. Men's Shirts) scopes
  // the next search to its department (Clothing, Shoes & Jewelry), like Amazon does.
  const c = params.get("c") ?? "";
  const scope = DEPARTMENTS.some((d) => d.slug === c) ? c : (departmentOf(c)?.slug ?? "");
  return <SearchForm key={`${k}|${scope}`} initialK={k} initialC={scope} />;
}

export function SearchBar() {
  return (
    <Suspense fallback={<SearchForm initialK="" initialC="" />}>
      <SearchFromParams />
    </Suspense>
  );
}
