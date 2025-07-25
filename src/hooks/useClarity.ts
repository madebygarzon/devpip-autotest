"use client";

import useSWR from "swr";
import type { ClaritySnapshot } from "@/lib/clarity";

export function useClarity() {
  const { data, error, isLoading } = useSWR<ClaritySnapshot[]>(
  "/api/clarity",
  (url: string) => fetch(url).then((r) => r.json())
);

  return {
    snapshots: data ?? [],
    latest: data?.[data.length - 1] ?? null,
    isLoading,
    isError: error
  };
}
