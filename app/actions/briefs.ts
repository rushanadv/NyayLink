"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  LawyerReadyBrief,
  BriefHandoffPayload,
  BriefHandoffRecord,
  ClientBriefRecord,
} from "@/lib/intake/brief-types";

/**
 * Saves a Lawyer-Ready Brief to the authenticated client's account.
 * Strict ownership check: Only the authenticated client can persist briefs.
 * Does NOT auto-share with any advocate.
 */
export async function saveClientBrief(params: {
  brief: LawyerReadyBrief;
  matterId?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Authentication required to save your legal brief. Please sign in or create an account.",
    };
  }

  const { brief, matterId } = params;
  const title = (brief.title || "Legal Preconsultation Brief").trim();

  // If matterId provided, verify client owns this matter
  if (matterId) {
    const { data: matter, error: matterCheckErr } = await supabase
      .from("legal_matters")
      .select("id, client_id")
      .eq("id", matterId)
      .eq("client_id", user.id)
      .maybeSingle();

    if (matterCheckErr || !matter) {
      return {
        success: false,
        error: "Selected legal matter not found or does not belong to your account.",
      };
    }
  }

  const { data: savedRecord, error: insertError } = await supabase
    .from("client_briefs")
    .insert({
      client_id: user.id,
      matter_id: matterId || null,
      title,
      brief_data: brief,
      facts_confirmed: Boolean(brief.isConfirmed),
      locale: brief.locale || "en",
      version: 1,
    })
    .select()
    .single();

  if (insertError || !savedRecord) {
    console.error("[saveClientBrief Error]:", insertError);
    return {
      success: false,
      error: insertError?.message || "Failed to save brief to your account.",
    };
  }

  // If linked to matter, post a matter update timeline entry
  if (matterId) {
    await supabase.from("matter_updates").insert({
      matter_id: matterId,
      author_id: user.id,
      update_type: "document",
      content: `AI Preconsultation Brief "${title}" saved to matter records.`,
    });
  }

  revalidatePath("/dashboard");
  return {
    success: true,
    briefId: savedRecord.id,
    brief: savedRecord as ClientBriefRecord,
  };
}

/**
 * Fetches all saved briefs for the authenticated client.
 */
export async function getClientBriefs() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, briefs: [], error: "Authentication required." };
  }

  const { data: briefs, error } = await supabase
    .from("client_briefs")
    .select("*, matter:legal_matters(id, title, status)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getClientBriefs Error]:", error);
    return { success: false, briefs: [], error: error.message };
  }

  return { success: true, briefs: (briefs || []) as ClientBriefRecord[] };
}

/**
 * Shares an AI Preconsultation Brief with an advocate.
 * Enforces mandatory consent check: consentGiven must be explicitly true.
 * Records full audit trail and integrates with consultation_requests.
 */
export async function shareBriefWithAdvocate(payload: BriefHandoffPayload) {
  // 1. Mandatory consent enforcement
  if (payload.consentGiven !== true) {
    return {
      success: false,
      error:
        "Consent required: You must explicitly agree to share this confidential preconsultation summary before transmitting it to an advocate.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Authentication required to share a brief with an advocate. Please log in first.",
    };
  }

  // 2. Validate advocate exists in lawyer_profiles
  const { data: lawyer, error: lawyerErr } = await supabase
    .from("lawyer_profiles")
    .select("id, professional_name, city, practice_areas")
    .eq("id", payload.lawyerId)
    .maybeSingle();

  if (lawyerErr || !lawyer) {
    return {
      success: false,
      error: "Selected advocate was not found in the verified Bar Council directory.",
    };
  }

  // 3. Ensure brief is saved in client_briefs
  let clientBriefId = payload.briefId;
  if (!clientBriefId) {
    const saveRes = await saveClientBrief({
      brief: payload.briefSnapshot,
      matterId: payload.matterId,
    });
    if (!saveRes.success || !saveRes.briefId) {
      return {
        success: false,
        error: saveRes.error || "Failed to persist brief prior to advocate sharing.",
      };
    }
    clientBriefId = saveRes.briefId;
  }

  // 4. Check for active duplicate pending handoff to this advocate
  const { data: existingPendingHandoff } = await supabase
    .from("brief_handoffs")
    .select("id, status")
    .eq("client_id", user.id)
    .eq("lawyer_id", payload.lawyerId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingPendingHandoff) {
    return {
      success: false,
      error:
        "You already have a pending brief shared with this advocate. Please wait for their response or manage it from your dashboard.",
    };
  }

  // 5. Create the immutable handoff record
  const consentTimestamp = new Date().toISOString();
  const { data: handoff, error: handoffError } = await supabase
    .from("brief_handoffs")
    .insert({
      client_brief_id: clientBriefId,
      client_id: user.id,
      lawyer_id: payload.lawyerId,
      exact_brief_snapshot: payload.briefSnapshot,
      consent_given: true,
      consent_timestamp: consentTimestamp,
      status: "pending",
    })
    .select()
    .single();

  if (handoffError || !handoff) {
    console.error("[shareBriefWithAdvocate Handoff Error]:", handoffError);
    return {
      success: false,
      error: handoffError?.message || "Failed to create secure handoff record.",
    };
  }

  // 6. Integrate with consultation_requests
  const subject = `[AI Preconsultation Brief] ${payload.briefSnapshot.title}`;
  const brief = payload.briefSnapshot;

  const consultationMessage =
    `[AUDIT: CLIENT-SHARED AI PRECONSULTATION BRIEF]\n` +
    `• Handoff Reference: ${handoff.id}\n` +
    `• Shared Timestamp: ${consentTimestamp}\n` +
    `• Explicit Client Consent: Recorded (Verified)\n\n` +
    `SUMMARY OF ISSUE:\n${brief.issueSummary}\n\n` +
    `CONFIRMED FACTS:\n${
      brief.facts
        .filter((f) => f.userConfirmed || f.category === "user_confirmed")
        .map((f, i) => `${i + 1}. ${f.statement}`)
        .join("\n") || "No specifically confirmed facts provided."
    }\n\n` +
    (brief.facts.some((f) => f.isAiInference || f.category === "ai_inference")
      ? `AI INFERRED ASPECTS (Requires Independent Verification):\n${brief.facts
          .filter((f) => f.isAiInference || f.category === "ai_inference")
          .map((f, i) => `${i + 1}. ${f.statement}`)
          .join("\n")}\n\n`
      : "") +
    `CLIENT QUESTIONS FOR ADVOCATE:\n${
      brief.questionsForAdvocate.map((q, i) => `${i + 1}. ${q}`).join("\n") ||
      "Standard preliminary legal inquiry."
    }\n\n` +
    (brief.documentsMentioned.length > 0
      ? `MENTIONED DOCUMENTS (Not Yet Attached):\n${brief.documentsMentioned
          .map((d, i) => `${i + 1}. ${d.name} (${d.status})`)
          .join("\n")}\n\n`
      : "") +
    (payload.clientNotes
      ? `CLIENT PERSONAL NOTE:\n${payload.clientNotes.trim()}\n\n`
      : "") +
    `[END AI BRIEF SUMMARY — NOT FORMAL ADVICE]`;

  const { data: consultation, error: consultationError } = await supabase
    .from("consultation_requests")
    .insert({
      client_id: user.id,
      lawyer_id: payload.lawyerId,
      matter_id: payload.matterId || null,
      subject,
      message: consultationMessage,
      status: "pending",
      brief_handoff_id: handoff.id,
      has_ai_brief: true,
      is_demo: user.email?.includes("demo") ?? false,
    })
    .select()
    .single();

  if (consultation && !consultationError) {
    // Link consultation_request_id back to handoff
    await supabase
      .from("brief_handoffs")
      .update({ consultation_request_id: consultation.id })
      .eq("id", handoff.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/lawyer/dashboard");

  return {
    success: true,
    handoffId: handoff.id,
    consultationId: consultation?.id,
    lawyerName: lawyer.professional_name,
  };
}

/**
 * Revokes an unaccepted AI preconsultation brief handoff.
 * Clients can withdraw / revoke pending handoffs at any time.
 * Once revoked, the advocate will no longer see the brief details.
 */
export async function revokeBriefHandoff(params: {
  handoffId: string;
  reason?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to revoke handoff." };
  }

  // 1. Fetch handoff and verify client ownership
  const { data: handoff, error: fetchErr } = await supabase
    .from("brief_handoffs")
    .select("id, client_id, lawyer_id, status, consultation_request_id")
    .eq("id", params.handoffId)
    .eq("client_id", user.id)
    .maybeSingle();

  if (fetchErr || !handoff) {
    return {
      success: false,
      error: "Handoff record not found or does not belong to your account.",
    };
  }

  if (handoff.status !== "pending") {
    return {
      success: false,
      error: `Cannot revoke handoff that is already ${handoff.status}.`,
    };
  }

  const revocationTime = new Date().toISOString();
  const reason = params.reason?.trim() || "Withdrawn by client";

  // 2. Mark handoff as revoked
  const { error: updateErr } = await supabase
    .from("brief_handoffs")
    .update({
      status: "revoked",
      revoked_at: revocationTime,
      revocation_reason: reason,
    })
    .eq("id", handoff.id)
    .eq("client_id", user.id);

  if (updateErr) {
    console.error("[revokeBriefHandoff Error]:", updateErr);
    return { success: false, error: updateErr.message };
  }

  // 3. Update associated consultation request if present
  if (handoff.consultation_request_id) {
    await supabase
      .from("consultation_requests")
      .update({
        status: "cancelled",
        lawyer_response: `[BRIEF REVOKED] Client withdrew this preconsultation brief on ${new Date().toLocaleDateString()}.`,
      })
      .eq("id", handoff.consultation_request_id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/lawyer/dashboard");

  return { success: true, message: "Handoff successfully revoked." };
}

/**
 * Links an existing client brief to an existing legal matter.
 */
export async function linkBriefToMatter(params: {
  briefId: string;
  matterId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // 1. Verify user owns brief
  const { data: brief, error: briefErr } = await supabase
    .from("client_briefs")
    .select("id, title")
    .eq("id", params.briefId)
    .eq("client_id", user.id)
    .maybeSingle();

  if (briefErr || !brief) {
    return { success: false, error: "Brief not found or access denied." };
  }

  // 2. Verify user owns matter
  const { data: matter, error: matterErr } = await supabase
    .from("legal_matters")
    .select("id, title")
    .eq("id", params.matterId)
    .eq("client_id", user.id)
    .maybeSingle();

  if (matterErr || !matter) {
    return { success: false, error: "Matter not found or access denied." };
  }

  // 3. Link brief
  const { error: linkErr } = await supabase
    .from("client_briefs")
    .update({ matter_id: params.matterId })
    .eq("id", brief.id);

  if (linkErr) {
    return { success: false, error: linkErr.message };
  }

  // 4. Add update to matter timeline
  await supabase.from("matter_updates").insert({
    matter_id: matter.id,
    author_id: user.id,
    update_type: "document",
    content: `Client linked AI Preconsultation Brief "${brief.title}" to this matter.`,
  });

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Creates a new matter in 'intake' status from a brief, without auto-sharing it with any advocate.
 */
export async function createMatterFromBrief(params: {
  briefId: string;
  title: string;
  category?: string;
  description?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // 1. Verify brief ownership
  const { data: brief, error: briefErr } = await supabase
    .from("client_briefs")
    .select("*")
    .eq("id", params.briefId)
    .eq("client_id", user.id)
    .maybeSingle();

  if (briefErr || !brief) {
    return { success: false, error: "Brief not found or access denied." };
  }

  // 2. Insert new matter
  const title = params.title.trim() || brief.title;
  const description =
    params.description?.trim() ||
    `Matter initiated from AI Preconsultation Brief. ${brief.brief_data?.issueSummary || ""}`.trim();

  const { data: matter, error: matterError } = await supabase
    .from("legal_matters")
    .insert({
      client_id: user.id,
      title,
      category: params.category?.trim() || "General Legal Matter",
      description: description.length >= 10 ? description : `${description} (Preconsultation intake record)`,
      status: "intake",
      assigned_lawyer_id: null, // Strictly unassigned upon creation
      is_demo: user.email?.includes("demo") ?? false,
    })
    .select()
    .single();

  if (matterError || !matter) {
    console.error("[createMatterFromBrief Error]:", matterError);
    return { success: false, error: matterError?.message || "Failed to create matter." };
  }

  // 3. Link brief to new matter
  await supabase
    .from("client_briefs")
    .update({ matter_id: matter.id })
    .eq("id", brief.id);

  // 4. Add initial update
  await supabase.from("matter_updates").insert({
    matter_id: matter.id,
    author_id: user.id,
    update_type: "status_change",
    content: `Matter initiated from AI Preconsultation Brief "${title}". Confidential brief saved to client records.`,
  });

  revalidatePath("/dashboard");
  return { success: true, matterId: matter.id };
}

/**
 * Fetches all handoffs for an advocate under RLS.
 */
export async function getLawyerReceivedHandoffs() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, handoffs: [], error: "Authentication required." };
  }

  const { data: handoffs, error } = await supabase
    .from("brief_handoffs")
    .select("*, client:profiles(id, full_name, phone)")
    .eq("lawyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getLawyerReceivedHandoffs Error]:", error);
    return { success: false, handoffs: [], error: error.message };
  }

  return { success: true, handoffs: (handoffs || []) as BriefHandoffRecord[] };
}

/**
 * Fetches verified advocates suitable for preconsultation brief handoff.
 */
export async function getAdvocatesForHandoff(practiceArea?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const targetTable = user ? "client_lawyer_directory" : "public_lawyer_directory";

  const { data, error } = await supabase
    .from(targetTable)
    .select(
      "id, professional_name, bio, practice_areas, experience_years, city, state, languages, verification_status"
    )
    .order("experience_years", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[getAdvocatesForHandoff Error]:", error);
    return { success: false, advocates: [] };
  }

  let filtered = data || [];
  if (practiceArea) {
    const pLower = practiceArea.toLowerCase();
    const matches = filtered.filter((l) =>
      l.practice_areas?.some((a: string) => a.toLowerCase().includes(pLower))
    );
    if (matches.length > 0) {
      filtered = matches;
    }
  }

  return { success: true, advocates: filtered };
}
