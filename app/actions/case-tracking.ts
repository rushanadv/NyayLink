"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  TrackedCaseData,
  validateCNRNumber,
} from "@/lib/court-data/ecourts-adapter";

/**
 * Creates or synchronizes a tracked court case and generates an immutable hearing entry on the calendar.
 */
export async function trackCourtCase(data: {
  cnrNumber?: string;
  courtComplex: string;
  caseType: string;
  caseNumber: string;
  caseYear: number;
  petitioner?: string;
  respondent?: string;
  nextHearingDate?: string;
  courtHall?: string;
  purposeOfHearing?: string;
  matterId?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to track cases." };
  }

  // 1. Validate CNR format if provided
  if (data.cnrNumber && data.cnrNumber.trim()) {
    const val = validateCNRNumber(data.cnrNumber.trim());
    if (!val.isValid) {
      return { success: false, error: val.error };
    }
  }

  const cleanCNR = data.cnrNumber ? data.cnrNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : null;
  const nowIso = new Date().toISOString();

  try {
    // 2. Persist in tracked_court_cases table if available
    const { data: insertedCase, error: caseError } = await supabase
      .from("tracked_court_cases")
      .insert({
        user_id: user.id,
        cnr_number: cleanCNR,
        court_complex: data.courtComplex.trim(),
        case_type: data.caseType.trim(),
        case_number: data.caseNumber.trim(),
        case_year: data.caseYear,
        petitioner: data.petitioner?.trim() || null,
        respondent: data.respondent?.trim() || null,
        next_hearing_date: data.nextHearingDate || null,
        court_hall: data.courtHall?.trim() || null,
        purpose_of_hearing: data.purposeOfHearing?.trim() || null,
        source_type: "cause_list_manual",
        verification_status: "manual_unverified",
        last_checked_at: nowIso,
      })
      .select()
      .maybeSingle();

    if (caseError) {
      console.warn("[Tracked Case Database Fallback]:", caseError.message);
    }

    // 3. Integrate into legal calendar as an official hearing event
    if (data.nextHearingDate) {
      const caseTitle = `${data.caseType} ${data.caseNumber}/${data.caseYear} (${data.courtComplex.split("(")[0].trim()})`;
      const provenanceHeader =
        `[SOURCE PROVENANCE: User Manual Tracking]\n` +
        `• CNR: ${cleanCNR || "Not Provided"}\n` +
        `• Forum: ${data.courtComplex}\n` +
        `• Bench/Hall: ${data.courtHall || "Court Hall Not Assigned"}\n` +
        `• Purpose: ${data.purposeOfHearing || "Regular Hearing"}\n` +
        `• Status: User-entered court hearing (Not officially verified via live eCourts API)\n` +
        `• Timestamp: ${nowIso}\n\n`;

      const startTime = `${data.nextHearingDate}T10:30:00+05:30`;
      const endTime = `${data.nextHearingDate}T12:00:00+05:30`;

      await supabase.from("calendar_events").insert({
        user_id: user.id,
        matter_id: data.matterId || null,
        title: caseTitle,
        event_type: "hearing",
        start_time: startTime,
        end_time: endTime,
        is_all_day: false,
        location: `${data.courtComplex} ${data.courtHall ? `(Hall: ${data.courtHall})` : ""}`.trim(),
        notes: `${provenanceHeader}Hearing listed for ${data.petitioner || "Petitioner"} vs ${data.respondent || "Respondent"}.`,
        priority: "high",
        reminder_minutes: 1440, // 24 hours prior
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/lawyer/dashboard");
    return {
      success: true,
      caseRecord: insertedCase,
    };
  } catch (err: unknown) {
    console.error("[Track Court Case Exception]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to record tracked case.",
    };
  }
}
