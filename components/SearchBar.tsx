"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set("q", value);
      } else {
        next.delete("q");
      }
      router.replace(`/?${next.toString()}`);
    }, 250); // debounce so we're not hitting the DB on every keystroke

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type="search"
      autoFocus
      placeholder="Search procedures — e.g. 30 day cancellation notice"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full border border-line rounded px-4 py-3 text-base bg-white shadow-sm"
    />
  );
}
