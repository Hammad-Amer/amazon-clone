"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = { name: string; email: string };
type StoredUser = User & { passwordHash: string };

export const DEMO_USER = { name: "Demo Shopper", email: "demo@amazon.clone", password: "demo1234" };

// This is a front-end demo with no server: accounts live in this browser's localStorage.
// Hashing keeps plaintext passwords out of storage; it is not a substitute for real auth.
async function hash(password: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

const normalize = (email: string) => email.trim().toLowerCase();

type AuthState = {
  users: StoredUser[];
  user: User | null;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      user: null,
      register: async (name, email, password) => {
        const e = normalize(email);
        if (get().users.some((u) => u.email === e)) {
          return "An account with this email already exists. Try signing in instead.";
        }
        const stored = { name: name.trim(), email: e, passwordHash: await hash(password) };
        set((s) => ({ users: [...s.users, stored], user: { name: stored.name, email: e } }));
        return null;
      },
      signIn: async (email, password) => {
        const e = normalize(email);
        const found = get().users.find((u) => u.email === e);
        if (!found) return "We cannot find an account with that email address.";
        if (found.passwordHash !== (await hash(password))) return "Your password is incorrect.";
        set({ user: { name: found.name, email: found.email } });
        return null;
      },
      signOut: () => set({ user: null }),
    }),
    { name: "amz-auth", skipHydration: true },
  ),
);

/** Creates the demo account if needed and signs in. Returns true if it was newly created. */
export async function signInDemo(): Promise<boolean> {
  const { signIn, register } = useAuth.getState();
  const err = await signIn(DEMO_USER.email, DEMO_USER.password);
  if (!err) return false;
  await register(DEMO_USER.name, DEMO_USER.email, DEMO_USER.password);
  return true;
}
