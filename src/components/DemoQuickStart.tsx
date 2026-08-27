"use client";

/**
 * Supports `?demo=1` (§58) — judges can jump straight into the primary
 * demo case with zero configuration.
 */
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function DemoQuickStart() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    if (params.get("demo") === "1") {
      router.replace("/case/DEMO-001");
    }
  }, [params, router]);
  return null;
}
