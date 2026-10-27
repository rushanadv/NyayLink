"use server";

import { requireAdminOrRedirect } from "@/lib/admin/auth";
import { ingestCuratedSources } from "@/lib/legal/ingestion-service";
import { retrieveLegalSourcesHybrid } from "@/lib/legal/retrieval";

/**
 * Triggers re-ingestion and validation of curated legal sources.
 * Strictly restricted to verified administrators.
 */
export async function triggerSourceIngestionAction() {
  const auth = await requireAdminOrRedirect();
  if (!auth.authorized) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    const outcome = await ingestCuratedSources(auth.supabase, {
      generateEmbeddings: true,
      triggeredBy: auth.user.email || "admin_dashboard",
    });

    return {
      success: outcome.status === "success" || outcome.status === "partial_failure",
      outcome,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to run source ingestion.",
    };
  }
}

/**
 * Executes a server-side test retrieval to verify hybrid quality and safety.
 * Strictly restricted to verified administrators.
 */
export async function testSourceRetrievalAction(query: string, category?: string) {
  const auth = await requireAdminOrRedirect();
  if (!auth.authorized) {
    return { success: false, error: "Unauthorized. Admin privileges required." };
  }

  try {
    const result = await retrieveLegalSourcesHybrid(query, {
      factsContext: {
        possiblePracticeAreas: category && category !== "all" ? [category] : undefined,
      },
      limit: 4,
      supabaseClient: auth.supabase,
    });

    return {
      success: true,
      result,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Retrieval failed.",
    };
  }
}
