"use client";

import { ArrowLeft, ChevronRight, CircleUserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { DEPARTMENTS, categoryLabel, type Department } from "@/lib/departments";
import { useAuth } from "@/store/auth";
import { useUI } from "@/store/ui";

const itemCls = "flex w-full items-center justify-between px-9 py-3 text-left text-sm text-amz-text hover:bg-[#eaeded]";

export function SidebarDrawer() {
  const open = useUI((s) => s.sidebarOpen);
  const setOpen = useUI((s) => s.setSidebarOpen);
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const [dept, setDept] = useState<Department | null>(null);

  const close = () => {
    setOpen(false);
    setDept(null);
  };

  return (
    <Drawer open={open} onClose={close} label="All categories">
      <Link
        href={user ? "/orders" : "/signin"}
        onClick={close}
        className="flex items-center gap-2.5 bg-amz-nav px-9 py-3 text-lg font-bold text-white"
      >
        <CircleUserRound size={28} />
        Hello, {user ? user.name.split(" ")[0] : "sign in"}
      </Link>

      <div className="relative flex-1 overflow-hidden">
        {/* Main menu */}
        <div
          className={`absolute inset-0 overflow-y-auto pb-6 transition-transform duration-300 ${dept ? "-translate-x-full" : "translate-x-0"}`}
        >
          <Section title="Trending">
            <NavItem href="/s?sort=bestselling" onClick={close}>Best Sellers</NavItem>
            <NavItem href="/s?sort=newest" onClick={close}>New Releases</NavItem>
            <NavItem href="/deals" onClick={close}>Today&apos;s Deals</NavItem>
          </Section>
          <Section title="Shop by Department">
            {DEPARTMENTS.map((d) => (
              <li key={d.slug}>
                <button className={itemCls} onClick={() => setDept(d)}>
                  {d.label}
                  <ChevronRight size={20} className="text-amz-muted" />
                </button>
              </li>
            ))}
          </Section>
          <Section title="Help & Settings" last>
            <NavItem href="/orders" onClick={close}>Your Orders</NavItem>
            <NavItem href="/wishlist" onClick={close}>Your Lists</NavItem>
            <NavItem href="/cart" onClick={close}>Your Cart</NavItem>
            <li>
              {user ? (
                <button
                  className={itemCls}
                  onClick={() => {
                    signOut();
                    close();
                  }}
                >
                  Sign Out
                </button>
              ) : (
                <Link className={itemCls} href="/signin" onClick={close}>
                  Sign In
                </Link>
              )}
            </li>
          </Section>
        </div>

        {/* Department sub-menu slides in from the right */}
        <div
          className={`absolute inset-0 overflow-y-auto pb-6 transition-transform duration-300 ${dept ? "translate-x-0" : "translate-x-full"}`}
          aria-hidden={!dept}
        >
          {dept && (
            <>
              <button
                onClick={() => setDept(null)}
                className="flex w-full items-center gap-3 border-b border-amz-border px-9 py-3.5 text-sm font-bold uppercase text-amz-text hover:bg-[#eaeded]"
              >
                <ArrowLeft size={18} /> Main menu
              </button>
              <Section title={dept.label} last>
                <NavItem href={`/s?c=${dept.slug}`} onClick={close}>
                  All {dept.label}
                </NavItem>
                {dept.categories.map((c) => (
                  <NavItem key={c} href={`/s?c=${c}`} onClick={close}>
                    {categoryLabel(c)}
                  </NavItem>
                ))}
              </Section>
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section className={last ? "pt-3" : "border-b border-amz-border py-3"}>
      <h2 className="px-9 pb-1 pt-1 text-lg font-bold text-amz-text">{title}</h2>
      <ul>{children}</ul>
    </section>
  );
}

function NavItem({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} onClick={onClick} className={itemCls}>
        {children}
      </Link>
    </li>
  );
}
