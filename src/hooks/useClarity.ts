"use client";

import useSWR from "swr";
import type { ClaritySnapshot } from "@/lib/clarity";

const fetcher = async (url: string): Promise<ClaritySnapshot[]> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  // Ensure data is an array
  if (!Array.isArray(data)) {
    console.error("Invalid data format from API:", data);
    return [];
  }

  return data;
};

export function useClarity() {
  const { data, error, isLoading, mutate } = useSWR<ClaritySnapshot[]>(
    "/api/clarity",
    fetcher,
    {
      // Revalidate on window focus
      revalidateOnFocus: false,
      // Keep data cached for 5 minutes
      dedupingInterval: 5 * 60 * 1000,
      // Retry on error
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  return {
    snapshots: data ?? [],
    latest: data?.[0] ?? null, // API returns snapshots ordered by date DESC, so [0] is the latest
    isLoading,
    isError: error,
    mutate, // To manually trigger a refresh
  };
}
