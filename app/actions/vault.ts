"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface VaultDocumentRecord {
  id: string;
  user_id: string;
  matter_id?: string | null;
  matter_title?: string | null;
  title: string;
  category: "pleading" | "evidence" | "notice" | "order" | "contract" | "general";
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  sha256_hash?: string | null;
  created_at: string;
  download_url?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

/**
 * Uploads a client document to secure private Supabase Storage and records metadata.
 */
export async function uploadVaultDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to upload documents." };
  }

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string)?.trim();
  const category = (formData.get("category") as string)?.trim() || "general";
  const matterId = (formData.get("matterId") as string)?.trim() || null;

  if (!file) {
    return { success: false, error: "No file provided." };
  }

  if (!title || title.length < 2) {
    return { success: false, error: "Document title must be at least 2 characters." };
  }

  // 1. Strict Size Check
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File size exceeds the 15MB limit. (Received ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
    };
  }

  // 2. Strict MIME Type Check
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      success: false,
      error: `File type '${file.type}' is not supported. Allowed formats: PDF, JPEG, PNG, WebP.`,
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Compute SHA-256 for cryptographic evidence integrity
    const sha256Hash = crypto.createHash("sha256").update(buffer).digest("hex");

    // 4. Generate non-guessable storage path scoped to authenticated user
    const documentId = crypto.randomUUID();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${user.id}/vault/${documentId}_${sanitizedName}`;

    // 5. Upload to private Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("advocate-credentials")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[Vault Storage Upload Error]:", uploadError);
      return { success: false, error: uploadError.message || "Failed to upload file to storage." };
    }

    // 6. Persist metadata
    let savedToTable = false;
    const { error: dbError } = await supabase.from("client_vault_documents").insert({
      id: documentId,
      user_id: user.id,
      matter_id: matterId,
      title,
      category,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      sha256_hash: sha256Hash,
    });

    if (!dbError) {
      savedToTable = true;
    } else {
      console.warn(
        "[Vault Database Fallback] client_vault_documents table pending migration, logging to matter timeline:",
        dbError.message
      );
    }

    // If matterId is provided, also log into matter_updates
    if (matterId) {
      await supabase.from("matter_updates").insert({
        matter_id: matterId,
        author_id: user.id,
        update_type: "document",
        content: JSON.stringify({
          documentId,
          title,
          category,
          fileName: file.name,
          fileSize: file.size,
          storagePath,
          sha256: sha256Hash,
        }),
      });
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      document: {
        id: documentId,
        user_id: user.id,
        matter_id: matterId,
        title,
        category,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        sha256_hash: sha256Hash,
        created_at: new Date().toISOString(),
      },
    };
  } catch (err: unknown) {
    console.error("[Vault Processing Exception]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred during upload.",
    };
  }
}

/**
 * Retrieves all vault documents for the current authenticated user with signed download URLs.
 */
export async function getClientVaultDocuments(): Promise<{
  success: boolean;
  documents?: VaultDocumentRecord[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  try {
    const documents: VaultDocumentRecord[] = [];

    // 1. Try querying client_vault_documents table
    const { data: tableDocs, error: tableError } = await supabase
      .from("client_vault_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!tableError && tableDocs && tableDocs.length > 0) {
      for (const doc of tableDocs) {
        // Generate signed URL valid for 10 minutes
        const { data: signedData } = await supabase.storage
          .from("advocate-credentials")
          .createSignedUrl(doc.storage_path, 600);

        documents.push({
          ...doc,
          download_url: signedData?.signedUrl,
        });
      }
    }

    // 2. Also query matter_updates for any document entries attached to user matters
    const { data: matterUpdates } = await supabase
      .from("matter_updates")
      .select("id, matter_id, author_id, content, created_at, legal_matters(id, title)")
      .eq("author_id", user.id)
      .eq("update_type", "document")
      .order("created_at", { ascending: false });

    if (matterUpdates && matterUpdates.length > 0) {
      for (const update of matterUpdates) {
        try {
          const parsed = JSON.parse(update.content);
          if (parsed && parsed.storagePath) {
            // Avoid duplicates if already in tableDocs
            if (!documents.some((d) => d.id === parsed.documentId || d.storage_path === parsed.storagePath)) {
              const { data: signedData } = await supabase.storage
                .from("advocate-credentials")
                .createSignedUrl(parsed.storagePath, 600);

              documents.push({
                id: parsed.documentId || update.id,
                user_id: user.id,
                matter_id: update.matter_id,
                matter_title: (update.legal_matters as { title?: string })?.title || null,
                title: parsed.title || parsed.fileName || "Matter Document",
                category: parsed.category || "general",
                file_name: parsed.fileName || "document",
                file_size: parsed.fileSize || 0,
                mime_type: parsed.mimeType || "application/pdf",
                storage_path: parsed.storagePath,
                sha256_hash: parsed.sha256 || null,
                created_at: update.created_at,
                download_url: signedData?.signedUrl,
              });
            }
          }
        } catch {
          // Non-JSON content, ignore
        }
      }
    }

    return { success: true, documents };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load documents.",
    };
  }
}

/**
 * Permanently deletes a vault document from Supabase Storage and database.
 */
export async function deleteVaultDocument(documentId: string, storagePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to delete documents." };
  }

  // Path must start with the user's ID for tenant isolation
  if (!storagePath.startsWith(`${user.id}/`)) {
    return { success: false, error: "Unauthorized access to delete this file." };
  }

  try {
    // 1. Delete from storage bucket
    const { error: storageError } = await supabase.storage
      .from("advocate-credentials")
      .remove([storagePath]);

    if (storageError) {
      console.warn("[Vault Delete Storage Warning]:", storageError.message);
    }

    // 2. Delete from database table
    await supabase.from("client_vault_documents").delete().eq("id", documentId).eq("user_id", user.id);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete document.",
    };
  }
}

/**
 * Renames a vault document's title.
 */
export async function renameVaultDocument(documentId: string, newTitle: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  const cleanTitle = newTitle.trim();
  if (cleanTitle.length < 2) {
    return { success: false, error: "Title must be at least 2 characters." };
  }

  const { error } = await supabase
    .from("client_vault_documents")
    .update({ title: cleanTitle, updated_at: new Date().toISOString() })
    .eq("id", documentId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Replaces an existing vault document with an updated file version,
 * computing a fresh SHA-256 hash, uploading to storage, updating metadata, and removing the superseded file.
 */
export async function replaceVaultDocument(
  documentId: string,
  oldStoragePath: string,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to replace documents." };
  }

  if (!oldStoragePath.startsWith(`${user.id}/`)) {
    return { success: false, error: "Unauthorized access to replace this document." };
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "No replacement file provided." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File size exceeds the 15MB limit. (Received ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
    };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      success: false,
      error: `File type '${file.type}' is not supported. Allowed formats: PDF, JPEG, PNG, WebP.`,
    };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const sha256Hash = crypto.createHash("sha256").update(buffer).digest("hex");

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const newStoragePath = `${user.id}/vault/${documentId}_v2_${sanitizedName}`;

    // Upload new version
    const { error: uploadError } = await supabase.storage
      .from("advocate-credentials")
      .upload(newStoragePath, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return { success: false, error: uploadError.message || "Failed to upload replacement file." };
    }

    // Update database record
    const { error: updateError } = await supabase
      .from("client_vault_documents")
      .update({
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: newStoragePath,
        sha256_hash: sha256Hash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)
      .eq("user_id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Clean up old storage object if path changed
    if (oldStoragePath !== newStoragePath) {
      await supabase.storage.from("advocate-credentials").remove([oldStoragePath]);
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      document: {
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: newStoragePath,
        sha256_hash: sha256Hash,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to replace document.",
    };
  }
}

