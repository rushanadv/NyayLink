"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createLegalMatter(formData: {
  title: string;
  category: string;
  description: string;
  assignedLawyerId?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to file a matter." };
  }

  const title = formData.title.trim();
  const category = formData.category.trim() || "General Legal Inquiry";
  const description = formData.description.trim();

  if (title.length < 3) {
    return { success: false, error: "Matter title must be at least 3 characters." };
  }
  if (description.length < 10) {
    return { success: false, error: "Matter description must be at least 10 characters." };
  }

  // Insert the matter
  const { data: matter, error: matterError } = await supabase
    .from("legal_matters")
    .insert({
      client_id: user.id,
      title,
      category,
      description,
      status: formData.assignedLawyerId ? "review" : "intake",
      assigned_lawyer_id: formData.assignedLawyerId || null,
      is_demo: user.email?.includes("demo") ?? false,
    })
    .select()
    .single();

  if (matterError || !matter) {
    console.error("[Create Matter Error]:", matterError);
    return { success: false, error: matterError?.message || "Failed to create matter." };
  }

  // Insert initial matter update timeline entry
  await supabase.from("matter_updates").insert({
    matter_id: matter.id,
    author_id: user.id,
    update_type: "status_change",
    content: "Matter initiated by client. Legal brief logged in secure vault.",
  });

  revalidatePath("/dashboard");
  return { success: true, matter };
}

export interface AcceptedConsultationTerms {
  fee: number;
  currency: string;
  durationMinutes: number;
  format: string;
  cancellationPolicy: string;
  inclusions: string;
  acceptedAt: string;
}

export async function createConsultationRequest(formData: {
  lawyerId: string;
  matterId?: string | null;
  subject: string;
  message: string;
  preferredDate?: string | null;
  termsAccepted?: AcceptedConsultationTerms | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to request consultation." };
  }

  const subject = formData.subject.trim();
  let message = formData.message.trim();

  if (subject.length < 3) {
    return { success: false, error: "Subject must be at least 3 characters." };
  }
  if (!message) {
    return { success: false, error: "Message cannot be empty." };
  }

  // 1. Prevent duplicate active pending requests between same client and advocate
  const { data: existingPending } = await supabase
    .from("consultation_requests")
    .select("id, created_at")
    .eq("client_id", user.id)
    .eq("lawyer_id", formData.lawyerId)
    .eq("status", "pending")
    .maybeSingle();

  if (existingPending) {
    return {
      success: false,
      error: "You already have an active pending consultation request with this advocate. Please check your dashboard or await their response before submitting another request.",
    };
  }

  // 2. Persist accepted consultation terms into the auditable request payload
  if (formData.termsAccepted) {
    const t = formData.termsAccepted;
    const termsSnapshot =
      `[AUDIT: ACCEPTED CONSULTATION TERMS]\n` +
      `• Fee: ₹${t.fee.toLocaleString("en-IN")} ${t.currency}\n` +
      `• Duration: ${t.durationMinutes} Minutes (${t.format})\n` +
      `• Scope: ${t.inclusions}\n` +
      `• Cancellation: ${t.cancellationPolicy}\n` +
      `• Timestamp: ${t.acceptedAt}\n` +
      `[END TERMS AUDIT]\n\n`;
    message = `${termsSnapshot}${message}`;
  }

  const { data: consultation, error: consultationError } = await supabase
    .from("consultation_requests")
    .insert({
      client_id: user.id,
      lawyer_id: formData.lawyerId,
      matter_id: formData.matterId || null,
      subject,
      message,
      preferred_date: formData.preferredDate || null,
      status: "pending",
      is_demo: user.email?.includes("demo") ?? false,
    })
    .select()
    .single();

  if (consultationError || !consultation) {
    console.error("[Create Consultation Error]:", consultationError);
    return { success: false, error: consultationError?.message || "Failed to submit consultation request." };
  }

  revalidatePath("/dashboard");
  return { success: true, consultation };
}

export async function respondToConsultationRequest(formData: {
  requestId: string;
  status: "accepted" | "declined";
  lawyerResponse: string;
  scheduledAt?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to respond." };
  }

  const { error: updateError } = await supabase
    .from("consultation_requests")
    .update({
      status: formData.status,
      lawyer_response: formData.lawyerResponse.trim() || null,
      scheduled_at: formData.scheduledAt || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", formData.requestId)
    .eq("lawyer_id", user.id);

  if (updateError) {
    console.error("[Respond Consultation Error]:", updateError);
    return { success: false, error: updateError.message };
  }

  revalidatePath("/lawyer/dashboard");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function addMatterTimelineUpdate(formData: {
  matterId: string;
  content: string;
  updateType?: "note" | "status_change" | "milestone";
  newStatus?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const content = formData.content.trim();
  if (content.length < 2) {
    return { success: false, error: "Note content must be at least 2 characters." };
  }

  const { error: noteError } = await supabase.from("matter_updates").insert({
    matter_id: formData.matterId,
    author_id: user.id,
    update_type: formData.updateType || "note",
    content,
  });

  if (noteError) {
    console.error("[Add Matter Update Error]:", noteError);
    return { success: false, error: noteError.message };
  }

  if (formData.newStatus) {
    await supabase
      .from("legal_matters")
      .update({
        status: formData.newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formData.matterId);
  }

  revalidatePath("/lawyer/dashboard");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateClientProfile(formData: {
  fullName: string;
  phone: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: formData.fullName.trim(),
      phone: formData.phone.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateLawyerChamberProfile(formData: {
  bio: string;
  practiceAreas: string[];
  city: string;
  state: string;
  experienceYears: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const { error: profileError } = await supabase
    .from("lawyer_profiles")
    .update({
      bio: formData.bio.trim() || null,
      practice_areas: formData.practiceAreas,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      experience_years: formData.experienceYears,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  revalidatePath("/lawyer/dashboard");
  return { success: true };
}

export async function toggleLawyerPublicationConsent(published: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to update publication consent." };
  }

  const { data, error } = await supabase.rpc("set_advocate_publication_consent", {
    p_published: published,
  });

  if (error) {
    console.error("[Publication Consent RPC Error]:", error);
    return { success: false, error: error.message };
  }

  if (data && typeof data === "object" && "success" in data && !data.success) {
    return {
      success: false,
      error: (data as { error?: string }).error || "Failed to update publication consent.",
    };
  }

  revalidatePath("/lawyer/dashboard");
  revalidatePath("/lawyer/onboarding");
  revalidatePath("/lawyers");
  revalidatePath("/dashboard");
  return { success: true, is_published: published };
}
