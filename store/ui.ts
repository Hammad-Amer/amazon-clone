"use client";

import { create } from "zustand";

export const useUI = create<{
  sidebarOpen: boolean;
  locationOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setLocationOpen: (open: boolean) => void;
}>((set) => ({
  sidebarOpen: false,
  locationOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setLocationOpen: (locationOpen) => set({ locationOpen }),
}));
