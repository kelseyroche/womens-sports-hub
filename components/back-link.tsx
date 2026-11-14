"use client";

import { useRouter } from "next/navigation";

export function BackLink({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  return (
    <button className="gd-back back-btn" onClick={() => router.back()}>
      {label}
    </button>
  );
}
