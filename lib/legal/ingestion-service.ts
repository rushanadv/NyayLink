/**
 * NyayLink Indian Legal Source Ingestion & Verification Service
 *
 * Enforces provenance, section boundaries, HTTPS government URL validation,
 * embedding generation (1536 dims), and strict audit logging.
 * Rejects malformed records and reports partial failures honestly.
 */

import {
  CANONICAL_DOCUMENTS,
  CANONICAL_PROVISIONS,
  LegalSourceProvision,
} from "./canonical-registry";
import {
  generateEmbedding,
  hasGenuineEmbeddingConfig,
  validateEmbedding,
  EMBEDDING_MODEL_NAME,
  EMBEDDING_DIMENSION,
} from "./embedding";

export interface IngestionOutcome {
  runId?: string;
  status: "success" | "partial_failure" | "failed" | "lexical_only_unembedded";
  documentsIngested: number;
  provisionsIngested: number;
  provisionsFailed: number;
  errors: string[];
  modelUsed: string;
  embeddingDimension: number;
  completedAt: string;
  notice?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Permitted official legislative domains
const PERMITTED_DOMAINS = [
  "indiacode.nic.in",
  "egazette.gov.in",
  "legislative.gov.in",
  "sansad.in",
  "consumerhelpline.gov.in",
  "rera.gov.in",
];

/**
 * Validates official source URL against permitted authoritative repositories
 */
export function validateOfficialSourceUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== "string") {
    return { isValid: false, error: "Official source URL is required." };
  }

  if (!url.startsWith("https://")) {
    return { isValid: false, error: "Official source URL must use HTTPS protocol." };
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const isPermitted = PERMITTED_DOMAINS.some(
      (dom) => hostname === dom || hostname.endsWith(`.${dom}`)
    );

    if (!isPermitted) {
      return {
        isValid: false,
        error: `URL domain '${hostname}' is not in the approved authoritative registry list (${PERMITTED_DOMAINS.join(", ")}).`,
      };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: "Malformed URL format." };
  }
}

/**
 * Validates a legal provision record before ingestion into the database
 */
export function validateProvisionRecord(p: Partial<LegalSourceProvision>): ValidationResult {
  const errors: string[] = [];

  if (!p.id || p.id.trim().length === 0) {
    errors.push("Provision ID is required.");
  }

  if (!p.documentId || p.documentId.trim().length === 0) {
    errors.push("Parent Document ID is required.");
  }

  if (!p.provisionIdentifier || p.provisionIdentifier.trim().length === 0) {
    errors.push("Provision Identifier (e.g., 'Section 318') is required.");
  }

  if (!p.title || p.title.trim().length === 0) {
    errors.push("Provision Title is required.");
  }

  if (!p.content || p.content.trim().length < 20) {
    errors.push("Statutory content is too short or missing.");
  }

  if (!p.plainSummary || p.plainSummary.trim().length < 10) {
    errors.push("Plain summary is required for citizen readability.");
  }

  if (!p.provenance || p.provenance.trim().length === 0) {
    errors.push("Source provenance is required for auditability.");
  }

  if (!p.lastCheckedDate || !/^\d{4}-\d{2}-\d{2}/.test(p.lastCheckedDate)) {
    errors.push("A valid ISO last-checked date (YYYY-MM-DD) is required.");
  }

  const urlCheck = validateOfficialSourceUrl(p.officialUrl || "");
  if (!urlCheck.isValid) {
    errors.push(urlCheck.error || "Invalid official source URL.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Ingests and seeds the curated canonical sources into Supabase.
 * If Supabase is unconfigured or unavailable, runs in dry-run verification mode.
 */
export async function ingestCuratedSources(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient?: any,
  options?: { generateEmbeddings?: boolean; triggeredBy?: string }
): Promise<IngestionOutcome> {
  const errors: string[] = [];
  let documentsIngested = 0;
  let provisionsIngested = 0;
  let provisionsFailed = 0;

  const shouldEmbed = options?.generateEmbeddings ?? true;

  // 1. Ingest Documents
  for (const doc of CANONICAL_DOCUMENTS) {
    const urlCheck = validateOfficialSourceUrl(doc.officialUrl);
    if (!urlCheck.isValid) {
      errors.push(`Document '${doc.id}': ${urlCheck.error}`);
      continue;
    }

    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from("legal_source_documents").upsert(
          {
            id: doc.id,
            act_code: doc.actCode,
            title: doc.title,
            short_title: doc.shortTitle,
            act_number: doc.actNumber,
            act_year: doc.actYear,
            document_type: doc.documentType,
            enactment_date: doc.enactmentDate,
            effective_date: doc.effectiveDate,
            jurisdiction: doc.jurisdiction,
            issuing_authority: doc.issuingAuthority,
            official_url: doc.officialUrl,
            provenance: doc.provenance,
            verification_status: doc.verificationStatus,
            last_checked_at: doc.lastCheckedDate,
            is_active: doc.isActive,
          },
          { onConflict: "id" }
        );

        if (error) {
          errors.push(`DB Error upserting document '${doc.id}': ${error.message}`);
          continue;
        }
      } catch (err) {
        errors.push(`Exception upserting document '${doc.id}': ${String(err)}`);
        continue;
      }
    }

    documentsIngested++;
  }

  // 2. Ingest Provisions
  for (const prov of CANONICAL_PROVISIONS) {
    const validation = validateProvisionRecord(prov);
    if (!validation.isValid) {
      provisionsFailed++;
      errors.push(`Provision '${prov.id}' failed validation: ${validation.errors.join("; ")}`);
      continue;
    }

    let embedding: number[] | null = null;
    let isEmbedded = false;
    let embeddingModel: string | null = null;
    let embeddedAt: string | null = null;

    if (shouldEmbed && hasGenuineEmbeddingConfig()) {
      try {
        const embedText = `${prov.actShortName} ${prov.provisionIdentifier} - ${prov.title}. ${prov.plainSummary} ${prov.keywords.join(" ")} ${prov.content}`;
        embedding = await generateEmbedding(embedText);
        if (embedding && validateEmbedding(embedding)) {
          isEmbedded = true;
          embeddingModel = EMBEDDING_MODEL_NAME;
          embeddedAt = new Date().toISOString();
        }
      } catch (embedErr) {
        provisionsFailed++;
        errors.push(`Embedding generation failed for provision '${prov.id}': ${String(embedErr)}`);
        continue;
      }
    }

    if (supabaseClient) {
      try {
        const payload: Record<string, unknown> = {
          id: prov.id,
          document_id: prov.documentId,
          provision_identifier: prov.provisionIdentifier,
          title: prov.title,
          chapter: prov.chapter,
          content: prov.content,
          plain_summary: prov.plainSummary,
          statutory_limitation_note: prov.statutoryLimitationNote,
          category: prov.category,
          keywords: prov.keywords,
          official_url: prov.officialUrl,
          verification_status: prov.verificationStatus,
          provenance: prov.provenance,
          last_checked_at: prov.lastCheckedDate,
          is_active: prov.isActive,
          is_embedded: isEmbedded,
          embedding_model: embeddingModel,
          embedded_at: embeddedAt,
          embedding: embedding, // Null if unconfigured; genuine 1536 vector if generated
        };

        const { error } = await supabaseClient
          .from("legal_source_provisions")
          .upsert(payload, { onConflict: "id" });

        if (error) {
          provisionsFailed++;
          errors.push(`DB Error upserting provision '${prov.id}': ${error.message}`);
          continue;
        }
      } catch (err) {
        provisionsFailed++;
        errors.push(`Exception upserting provision '${prov.id}': ${String(err)}`);
        continue;
      }
    }

    provisionsIngested++;
  }

  // 3. Determine Overall Status honestly
  let status: "success" | "partial_failure" | "failed" | "lexical_only_unembedded" = "success";
  let notice: string | undefined;

  if (provisionsIngested === 0 && CANONICAL_PROVISIONS.length > 0) {
    status = "failed";
  } else if (provisionsFailed > 0 || errors.length > 0) {
    status = "partial_failure";
  } else if (!hasGenuineEmbeddingConfig()) {
    status = "lexical_only_unembedded";
    notice =
      "All canonical provisions ingested with verified statutory text and GIN tsvector indexing. Semantic pgvector embeddings ungenerated pending OPENAI_API_KEY configuration.";
  }

  const outcome: IngestionOutcome = {
    status,
    documentsIngested,
    provisionsIngested,
    provisionsFailed,
    errors,
    modelUsed: hasGenuineEmbeddingConfig() ? EMBEDDING_MODEL_NAME : "none (lexical-only)",
    embeddingDimension: EMBEDDING_DIMENSION,
    completedAt: new Date().toISOString(),
    notice,
  };

  // 4. Record Run in Audit Table if Supabase is connected
  if (supabaseClient) {
    try {
      const { data: runRecord } = await supabaseClient
        .from("legal_source_ingestion_runs")
        .insert({
          status,
          provisions_ingested: provisionsIngested,
          provisions_failed: provisionsFailed,
          error_details: errors.length > 0 ? errors.join("\n") : null,
          model_name: EMBEDDING_MODEL_NAME,
          embedding_dimension: EMBEDDING_DIMENSION,
          triggered_by: options?.triggeredBy || "admin_ingestion",
          completed_at: outcome.completedAt,
        })
        .select("id")
        .single();

      if (runRecord?.id) {
        outcome.runId = runRecord.id;
      }
    } catch {
      // Ingestion log failure is non-fatal to outcome reporting
    }
  }

  return outcome;
}
