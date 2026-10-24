"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface SaveEducationInput {
  id?: string;
  degree: string;
  institution: string;
  field_of_study?: string | null;
  graduation_year: number;
  is_public?: boolean;
}

export interface SaveQualificationInput {
  id?: string;
  title: string;
  issuing_authority: string;
  issue_date?: string | null;
  expiry_date?: string | null;
  is_public?: boolean;
}

export interface UpdateAdvocateProfileInput {
  professional_name: string;
  phone?: string | null;
  bar_council_number: string;
  bar_council_state: string;
  bar_council_enrollment_year: number;
  city: string;
  state: string;
  practice_areas: string[];
  languages: string[];
  experience_years: number;
  bio?: string | null;
  courts_of_practice?: string[];
  consultation_modes?: string[];
  consultation_fee?: number | null;
  office_address?: string | null;
  is_published?: boolean;
}

/**
 * Validates authenticated advocate session and ensures ownership
 */
async function getAuthenticatedAdvocate() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required.");
  }

  // Ensure advocate onboarding role is assigned
  await supabase.rpc("claim_lawyer_onboarding_role");

  return { supabase, user };
}

/**
 * Fetch complete advocate profile data including completeness calculation,
 * education, qualifications, and uploaded credentials
 */
export async function getAdvocateFullProfile() {
  const { supabase, user } = await getAuthenticatedAdvocate();

  const [profileRes, lawyerRes, verifRes, eduRes, qualRes, docRes, compRes] =
    await Promise.all([
      supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
      supabase.from("lawyer_profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("lawyer_verifications").select("status, submitted_at, lawyer_feedback").eq("lawyer_id", user.id).maybeSingle(),
      supabase.from("lawyer_educations").select("*").eq("lawyer_id", user.id).order("graduation_year", { ascending: false }),
      supabase.from("lawyer_qualifications").select("*").eq("lawyer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("advocate_documents").select("*").eq("lawyer_id", user.id).order("created_at", { ascending: false }),
      supabase.rpc("get_advocate_profile_completeness", { p_lawyer_id: user.id }),
    ]);

  return {
    userId: user.id,
    userEmail: user.email || "",
    profile: profileRes.data,
    lawyerProfile: lawyerRes.data,
    verification: verifRes.data,
    educations: eduRes.data || [],
    qualifications: qualRes.data || [],
    documents: docRes.data || [],
    completeness: compRes.data || {
      percentage: 0,
      sections: { personal: false, bar_council: false, practice: false, education: false, documents: false },
      missing_fields: [],
      completed_fields: [],
      can_submit: false,
    },
  };
}

/**
 * Save or update full personal, Bar Council and practice details
 */
export async function saveAdvocateFullDetails(input: UpdateAdvocateProfileInput) {
  const { supabase, user } = await getAuthenticatedAdvocate();

  if (!input.professional_name || input.professional_name.trim().length < 2) {
    return { success: false, error: "Valid professional name is required." };
  }
  if (!input.bar_council_number || input.bar_council_number.trim().length < 3) {
    return { success: false, error: "Valid Bar Council registration number is required." };
  }
  if (!input.city || input.city.trim().length < 2) {
    return { success: false, error: "Primary city or jurisdiction is required." };
  }
  if (input.practice_areas.length === 0) {
    return { success: false, error: "Please select at least one primary practice area." };
  }

  // 1. Submit via secure onboarding RPC
  const { data: onbRes, error: onbErr } = await supabase.rpc(
    "submit_advocate_onboarding_profile",
    {
      p_professional_name: input.professional_name.trim(),
      p_phone: input.phone?.trim() || null,
      p_bar_council_number: input.bar_council_number.trim(),
      p_bar_council_state: input.bar_council_state,
      p_bar_council_enrollment_year: input.bar_council_enrollment_year,
      p_city: input.city.trim(),
      p_state: input.state.trim(),
      p_practice_areas: input.practice_areas,
      p_languages: input.languages,
      p_experience_years: Math.max(0, input.experience_years),
      p_bio: input.bio?.trim() || null,
      p_is_published: input.is_published ?? false,
    }
  );

  if (onbErr || (onbRes && onbRes.success === false)) {
    return { success: false, error: onbErr?.message || onbRes?.error || "Failed to update profile." };
  }

  // 2. Update extended practice fields
  const { error: extErr } = await supabase
    .from("lawyer_profiles")
    .update({
      courts_of_practice: input.courts_of_practice || [],
      consultation_modes: input.consultation_modes || ["Online Video Consultation", "In-Chambers Consultation"],
      consultation_fee: input.consultation_fee ?? null,
      office_address: input.office_address?.trim() || null,
    })
    .eq("id", user.id);

  if (extErr) {
    console.error("[Advocate Profile Save Error]:", extErr);
  }

  revalidatePath("/lawyer/dashboard");
  revalidatePath("/lawyer/onboarding");
  revalidatePath("/lawyers");

  const { data: completeness } = await supabase.rpc("get_advocate_profile_completeness", {
    p_lawyer_id: user.id,
  });

  return { success: true, completeness };
}

/**
 * Add or update an education record
 */
export async function saveAdvocateEducation(input: SaveEducationInput) {
  const { supabase, user } = await getAuthenticatedAdvocate();

  if (!input.degree.trim()) {
    return { success: false, error: "Degree or qualification title is required." };
  }
  if (!input.institution.trim()) {
    return { success: false, error: "Institution or university is required." };
  }
  if (!input.graduation_year || input.graduation_year < 1950 || input.graduation_year > 2035) {
    return { success: false, error: "Valid graduation year between 1950 and 2035 is required." };
  }

  if (input.id) {
    // Update existing
    const { data, error } = await supabase
      .from("lawyer_educations")
      .update({
        degree: input.degree.trim(),
        institution: input.institution.trim(),
        field_of_study: input.field_of_study?.trim() || null,
        graduation_year: input.graduation_year,
        is_public: input.is_public ?? true,
      })
      .eq("id", input.id)
      .eq("lawyer_id", user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/lawyer/dashboard");
    revalidatePath("/lawyer/onboarding");
    return { success: true, education: data };
  } else {
    // Insert new
    const { data, error } = await supabase
      .from("lawyer_educations")
      .insert({
        lawyer_id: user.id,
        degree: input.degree.trim(),
        institution: input.institution.trim(),
        field_of_study: input.field_of_study?.trim() || null,
        graduation_year: input.graduation_year,
        is_public: input.is_public ?? true,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/lawyer/dashboard");
    revalidatePath("/lawyer/onboarding");
    return { success: true, education: data };
  }
}

/**
 * Delete an education record
 */
export async function deleteAdvocateEducation(educationId: string) {
  const { supabase, user } = await getAuthenticatedAdvocate();

  const { error } = await supabase
    .from("lawyer_educations")
    .delete()
    .eq("id", educationId)
    .eq("lawyer_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/lawyer/dashboard");
  revalidatePath("/lawyer/onboarding");
  return { success: true };
}

/**
 * Add or update a professional qualification record
 */
export async function saveAdvocateQualification(input: SaveQualificationInput) {
  const { supabase, user } = await getAuthenticatedAdvocate();

  if (!input.title.trim()) {
    return { success: false, error: "Qualification / certification title is required." };
  }
  if (!input.issuing_authority.trim()) {
    return { success: false, error: "Issuing authority or institution is required." };
  }

  if (input.id) {
    const { data, error } = await supabase
      .from("lawyer_qualifications")
      .update({
        title: input.title.trim(),
        issuing_authority: input.issuing_authority.trim(),
        issue_date: input.issue_date || null,
        expiry_date: input.expiry_date || null,
        is_public: input.is_public ?? true,
      })
      .eq("id", input.id)
      .eq("lawyer_id", user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/lawyer/dashboard");
    revalidatePath("/lawyer/onboarding");
    return { success: true, qualification: data };
  } else {
    const { data, error } = await supabase
      .from("lawyer_qualifications")
      .insert({
        lawyer_id: user.id,
        title: input.title.trim(),
        issuing_authority: input.issuing_authority.trim(),
        issue_date: input.issue_date || null,
        expiry_date: input.expiry_date || null,
        is_public: input.is_public ?? true,
        verification_status: "unverified",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/lawyer/dashboard");
    revalidatePath("/lawyer/onboarding");
    return { success: true, qualification: data };
  }
}

/**
 * Delete a qualification record
 */
export async function deleteAdvocateQualification(qualificationId: string) {
  const { supabase, user } = await getAuthenticatedAdvocate();

  const { error } = await supabase
    .from("lawyer_qualifications")
    .delete()
    .eq("id", qualificationId)
    .eq("lawyer_id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/lawyer/dashboard");
  revalidatePath("/lawyer/onboarding");
  return { success: true };
}

/**
 * Upload supporting document to private bucket 'advocate-credentials'
 */
export async function uploadAdvocateDocument(formData: FormData) {
  const { supabase, user } = await getAuthenticatedAdvocate();

  const file = formData.get("file") as File | null;
  const docType = (formData.get("documentType") as string) || "other_qualification";

  if (!file) {
    return { success: false, error: "No file was selected for upload." };
  }

  // Validate file size (10MB max)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, error: "File exceeds the 10MB maximum limit." };
  }

  // Validate MIME type
  const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Unsupported file type. Please upload a PDF, PNG, JPEG, or WebP document.",
    };
  }

  // Generate non-guessable storage path
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const uniqueId = crypto.randomUUID();
  const storagePath = `${user.id}/${docType}/${uniqueId}-${sanitizedName}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("advocate-credentials")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[Storage Upload Error]:", uploadError);
    return { success: false, error: uploadError.message || "Failed to store document securely." };
  }

  // Record in advocate_documents table
  const { data: docRecord, error: dbError } = await supabase
    .from("advocate_documents")
    .insert({
      lawyer_id: user.id,
      document_type: docType,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      is_verified: false,
    })
    .select()
    .single();

  if (dbError) {
    console.error("[Advocate Document DB Error]:", dbError);
    // Cleanup orphaned storage file
    await supabase.storage.from("advocate-credentials").remove([storagePath]);
    return { success: false, error: "Failed to link document record." };
  }

  revalidatePath("/lawyer/dashboard");
  revalidatePath("/lawyer/onboarding");

  return { success: true, document: docRecord };
}

/**
 * Generate authenticated short-lived signed URL for document viewing
 */
export async function getAdvocateDocumentSignedUrl(storagePath: string) {
  const { supabase, user } = await getAuthenticatedAdvocate();

  // Enforce path ownership check
  if (!storagePath.startsWith(`${user.id}/`)) {
    return { success: false, error: "Access Denied: You do not own this credential." };
  }

  // 5 minutes expiry
  const { data, error } = await supabase.storage
    .from("advocate-credentials")
    .createSignedUrl(storagePath, 300);

  if (error || !data?.signedUrl) {
    return { success: false, error: error?.message || "Failed to generate signed download link." };
  }

  return { success: true, signedUrl: data.signedUrl };
}

/**
 * Delete previously uploaded document and remove from private storage
 */
export async function deleteAdvocateDocument(documentId: string) {
  const { supabase, user } = await getAuthenticatedAdvocate();

  // Find document record first
  const { data: doc, error: findError } = await supabase
    .from("advocate_documents")
    .select("storage_path")
    .eq("id", documentId)
    .eq("lawyer_id", user.id)
    .single();

  if (findError || !doc) {
    return { success: false, error: "Document not found or unauthorized." };
  }

  // Delete from storage
  await supabase.storage.from("advocate-credentials").remove([doc.storage_path]);

  // Delete from database
  const { error: delError } = await supabase
    .from("advocate_documents")
    .delete()
    .eq("id", documentId)
    .eq("lawyer_id", user.id);

  if (delError) {
    return { success: false, error: delError.message };
  }

  revalidatePath("/lawyer/dashboard");
  revalidatePath("/lawyer/onboarding");
  return { success: true };
}
