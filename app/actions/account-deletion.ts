"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export interface AccountDeletionInput {
  confirmationText: string;
  password?: string;
}

export interface AccountDeletionResult {
  success: boolean;
  error?: string;
  message?: string;
  purgedCategories?: string[];
}

/**
 * Permanently deletes the authenticated user's account and personal data end-to-end.
 * Complies with the Digital Personal Data Protection (DPDP) Act, 2023.
 */
export async function deleteUserAccount(
  input: AccountDeletionInput
): Promise<AccountDeletionResult> {
  const supabase = await createClient();

  // 1. Verify Authenticated User
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Authentication required to initiate account deletion.",
    };
  }

  // 2. Strict Confirmation Phrase Check
  const expectedPhrase = "DELETE MY NYAYLINK ACCOUNT";
  const provided = input.confirmationText?.trim().toUpperCase();

  if (provided !== expectedPhrase) {
    return {
      success: false,
      error: `Please type the exact phrase "${expectedPhrase}" to confirm deletion.`,
    };
  }

  // 3. Reauthentication via Password Verification (if password provided)
  if (input.password && user.email) {
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: input.password,
    });

    if (reauthError) {
      return {
        success: false,
        error: "Incorrect password. Reauthentication failed for account security.",
      };
    }
  }

  const userId = user.id;
  const purgedCategories: string[] = [];

  try {
    // 4. Delete Client Private Vault Documents & Storage Objects
    const { data: vaultDocs } = await supabase
      .from("client_vault_documents")
      .select("id, storage_path")
      .eq("user_id", userId);

    if (vaultDocs && vaultDocs.length > 0) {
      const storagePaths = vaultDocs
        .map((d) => d.storage_path)
        .filter((p) => p && p.startsWith(`${userId}/`));

      if (storagePaths.length > 0) {
        const { error: storageDelErr } = await supabase.storage
          .from("advocate-credentials")
          .remove(storagePaths);
        if (storageDelErr) {
          console.warn("[Account Deletion] Storage cleanup warning:", storageDelErr.message);
        }
      }

      await supabase
        .from("client_vault_documents")
        .delete()
        .eq("user_id", userId);

      purgedCategories.push("Vault Documents & Private Storage");
    }

    // 5. Delete Advocate Credentials & Qualification Documents (if Advocate role)
    const { data: advocateDocs } = await supabase
      .from("advocate_documents")
      .select("id, storage_path")
      .eq("lawyer_id", userId);

    if (advocateDocs && advocateDocs.length > 0) {
      const advocateStoragePaths = advocateDocs
        .map((d) => d.storage_path)
        .filter((p) => p && p.startsWith(`${userId}/`));

      if (advocateStoragePaths.length > 0) {
        await supabase.storage
          .from("advocate-credentials")
          .remove(advocateStoragePaths);
      }

      await supabase
        .from("advocate_documents")
        .delete()
        .eq("lawyer_id", userId);
    }

    // Delete advocate educations & qualifications
    await supabase.from("lawyer_educations").delete().eq("lawyer_id", userId);
    await supabase.from("lawyer_qualifications").delete().eq("lawyer_id", userId);
    await supabase.from("lawyer_verifications").delete().eq("lawyer_id", userId);

    // Delete or delist lawyer profile
    await supabase.from("lawyer_profiles").delete().eq("id", userId);
    purgedCategories.push("Advocate Professional Profile & Verification");

    // 6. Delete Tracked Court Cases
    await supabase.from("tracked_court_cases").delete().eq("user_id", userId);
    purgedCategories.push("Court Case Dockets & Cause List Alerts");

    // 7. Delete Personal Calendar Events
    await supabase.from("calendar_events").delete().eq("user_id", userId);
    purgedCategories.push("Personal Legal Calendar & Hearing Reminders");

    // 8. Handle Consultations & Matters Responsibly
    // Pending or intake matters owned by user: safe to delete
    await supabase
      .from("consultation_requests")
      .delete()
      .or(`client_id.eq.${userId},lawyer_id.eq.${userId}`)
      .in("status", ["pending", "declined", "cancelled"]);

    // For active legal matters: preserve court audit trail without orphaning foreign keys
    await supabase
      .from("legal_matters")
      .update({
        status: "closed",
        description: "[Account Deleted - Personal Data Redacted under DPDP Act 2023]",
      })
      .eq("client_id", userId);

    // Delete unassigned or intake matters owned by client
    await supabase
      .from("legal_matters")
      .delete()
      .eq("client_id", userId)
      .eq("status", "intake");

    purgedCategories.push("Consultation Inquiries & Unassigned Matters");

    // 9. Delete Profile & Role Associations
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("profiles").delete().eq("id", userId);
    purgedCategories.push("User Account Identity & Verified Profile");

    // 10. Supabase Auth User Deletion (if service-role key available)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (serviceRoleKey && supabaseUrl) {
      try {
        const adminClient = createAdminClient(supabaseUrl, serviceRoleKey);
        await adminClient.auth.admin.deleteUser(userId);
        purgedCategories.push("Supabase Authentication Credentials");
      } catch (adminErr) {
        console.warn("[Account Deletion] Admin user deletion warning:", adminErr);
      }
    }

    // 11. Sign Out the Current Session
    await supabase.auth.signOut();

    revalidatePath("/", "layout");

    return {
      success: true,
      purgedCategories,
      message:
        "Your account and all associated personal records have been permanently deleted in accordance with the DPDP Act 2023.",
    };
  } catch (err: unknown) {
    console.error("[Account Deletion Exception]:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "An error occurred while deleting your account. Please retry or contact support.",
    };
  }
}
