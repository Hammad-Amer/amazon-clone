"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { useLocation } from "@/store/misc";
import { useUI } from "@/store/ui";

const COUNTRIES = ["Pakistan", "United States", "United Kingdom", "Canada", "United Arab Emirates", "Germany", "India", "Australia"];

export function LocationModal() {
  const open = useUI((s) => s.locationOpen);
  const setOpen = useUI((s) => s.setLocationOpen);
  const close = () => setOpen(false);
  return (
    <Modal open={open} onClose={close} title="Choose your location">
      <LocationForm onDone={close} />
    </Modal>
  );
}

function LocationForm({ onDone }: { onDone: () => void }) {
  const location = useLocation((s) => s.location);
  const setLocation = useLocation((s) => s.setLocation);
  const [city, setCity] = useState(location?.city ?? "");
  const [zip, setZip] = useState(location?.zip ?? "");
  const [country, setCountry] = useState(location?.country ?? "Pakistan");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setLocation({ city: city.trim(), zip: zip.trim(), country });
        onDone();
      }}
      className="space-y-3 text-sm"
    >
      <p className="text-xs text-amz-muted">
        Delivery options and delivery speeds may vary for different locations.
      </p>
      <div className="flex gap-2">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          aria-label="City"
          className="w-full rounded-md border border-[#888c8c] px-2 py-1.5 shadow-inner outline-none focus:border-amz-link focus:ring-2 focus:ring-amz-link/30"
        />
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/[^\w -]/g, "").slice(0, 10))}
          placeholder="ZIP"
          aria-label="ZIP code"
          className="w-28 rounded-md border border-[#888c8c] px-2 py-1.5 shadow-inner outline-none focus:border-amz-link focus:ring-2 focus:ring-amz-link/30"
        />
      </div>
      <div className="flex items-center gap-3 text-xs text-amz-muted">
        <span className="h-px flex-1 bg-amz-border" /> or ship outside your city <span className="h-px flex-1 bg-amz-border" />
      </div>
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        aria-label="Country"
        className="w-full rounded-md border border-amz-border bg-[#f0f2f2] px-2 py-1.5 shadow-sm"
      >
        {COUNTRIES.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <Button type="submit" className="w-full">
        Done
      </Button>
    </form>
  );
}
