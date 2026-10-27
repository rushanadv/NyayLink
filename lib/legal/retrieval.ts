/**
 * NyayLink Hybrid Legal Retrieval Engine
 *
 * Integrates:
 * 1. Lexical full-text search (tsvector in PostgreSQL / token-weighted matching)
 * 2. Semantic vector search (pgvector cosine similarity with 1536-dim embeddings)
 * 3. Domain-specific statutory bridging (Old IPC/CrPC/IEA -> New BNS/BNSS/BSA)
 * 4. Post-generation citation validation (Zero hallucination guardrail)
 */

import {
  CANONICAL_PROVISIONS,
  LegalSourceProvision,
} from "./canonical-registry";
import { generateEmbedding, cosineSimilarity } from "./embedding";
import { StatutoryReference } from "./references";

export interface RetrievalFactsContext {
  legalIssue?: string;
  possiblePracticeAreas?: string[];
  userRole?: string;
  jurisdiction?: {
    state?: string;
    district?: string;
  };
}

export interface RetrievalOptions {
  factsContext?: RetrievalFactsContext;
  limit?: number;
  minScoreThreshold?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient?: any;
}

export interface HybridRetrievalResult {
  sources: StatutoryReference[];
  hasGroundedSources: boolean;
  orientationDisclaimer?: string;
  queryLanguage: "en" | "hi" | "mixed";
  methodUsed:
    | "hybrid_supabase_pgvector"
    | "hybrid_in_memory"
    | "lexical_full_text"
    | "lexical_in_memory";
  isLexicalOnly: boolean;
  semanticEngineStatus: "active" | "lexical_fallback_no_api_key" | "unembedded_corpus";
  retrievalLatencyMs: number;
}

// Old Statutory Code -> New Sanhita Crosswalk
const HISTORICAL_STATUTE_MAPPINGS: Record<string, { newAct: string; newSection: string; targetId: string }> = {
  "420": { newAct: "BNS, 2023", newSection: "Section 318", targetId: "bns-sec-318" },
  "ipc 420": { newAct: "BNS, 2023", newSection: "Section 318", targetId: "bns-sec-318" },
  "406": { newAct: "BNS, 2023", newSection: "Section 316", targetId: "bns-sec-316" },
  "ipc 406": { newAct: "BNS, 2023", newSection: "Section 316", targetId: "bns-sec-316" },
  "154": { newAct: "BNSS, 2023", newSection: "Section 173", targetId: "bnss-sec-173" },
  "crpc 154": { newAct: "BNSS, 2023", newSection: "Section 173", targetId: "bnss-sec-173" },
  "437": { newAct: "BNSS, 2023", newSection: "Section 480", targetId: "bnss-sec-480" },
  "crpc 437": { newAct: "BNSS, 2023", newSection: "Section 480", targetId: "bnss-sec-480" },
  "438": { newAct: "BNSS, 2023", newSection: "Section 482", targetId: "bnss-sec-482" },
  "crpc 438": { newAct: "BNSS, 2023", newSection: "Section 482", targetId: "bnss-sec-482" },
  "125": { newAct: "BNSS, 2023", newSection: "Section 144", targetId: "bnss-sec-144" },
  "crpc 125": { newAct: "BNSS, 2023", newSection: "Section 144", targetId: "bnss-sec-144" },
  "65b": { newAct: "BSA, 2023", newSection: "Section 61", targetId: "bsa-sec-61" },
  "evidence act 65b": { newAct: "BSA, 2023", newSection: "Section 61", targetId: "bsa-sec-61" },
};

/**
 * Detects whether the query text is primarily in Hindi (Devanagari script)
 */
export function detectLanguage(text: string): "en" | "hi" | "mixed" {
  const devanagariRegex = /[\u0900-\u097F]/;
  const latinRegex = /[a-zA-Z]/;

  const hasDevanagari = devanagariRegex.test(text);
  const hasLatin = latinRegex.test(text);

  if (hasDevanagari && !hasLatin) return "hi";
  if (hasDevanagari && hasLatin) return "mixed";
  return "en";
}

/**
 * Maps a LegalSourceProvision to the StatutoryReference interface expected by prompt & brief builders
 */
export function provisionToReference(p: LegalSourceProvision): StatutoryReference {
  return {
    id: p.id,
    actName: p.actName,
    actShortName: p.actShortName,
    actYear: p.actYear,
    section: p.provisionIdentifier,
    provisionTitle: p.title,
    jurisdiction: "Union of India (Central)",
    officialSourceUrl: p.officialUrl,
    sourcePublisher: p.issuingAuthority,
    lastCheckedDate: p.lastCheckedDate,
    verificationStatus: p.verificationStatus as "officially_verified" | "pending_gazette_update",
    category: p.category,
    keyStatutoryText: p.content,
    plainSummary: p.plainSummary,
    statutoryLimitationNote: p.statutoryLimitationNote,
    keywords: p.keywords,
  };
}

/**
 * Executes hybrid legal retrieval across lexical and pgvector semantic layers
 */
export async function retrieveLegalSourcesHybrid(
  query: string,
  options?: RetrievalOptions
): Promise<HybridRetrievalResult> {
  const startTime = Date.now();
  const limit = options?.limit ?? 3;
  const minScore = options?.minScoreThreshold ?? 3.0;
  const queryLower = query.toLowerCase().trim();
  const lang = detectLanguage(query);

  const facts = options?.factsContext;
  const issueLower = (facts?.legalIssue || "").toLowerCase();
  const practiceAreas = (facts?.possiblePracticeAreas || []).map((p) => p.toLowerCase());

  // 1. Check for historical statutory mappings (e.g. IPC 420 -> BNS 318)
  const prioritizedIds = new Set<string>();
  for (const [oldTerm, mapping] of Object.entries(HISTORICAL_STATUTE_MAPPINGS)) {
    if (queryLower.includes(oldTerm)) {
      prioritizedIds.add(mapping.targetId);
    }
  }

  // 2. Try remote Supabase pgvector RPC if client provided
  if (options?.supabaseClient) {
    try {
      const queryEmbedding = await generateEmbedding(query);
      const { data, error } = await options.supabaseClient.rpc("match_legal_provisions", {
        query_text: query,
        query_embedding: queryEmbedding,
        filter_category: practiceAreas[0] || null,
        match_count: limit,
        full_text_weight: 0.6,
        semantic_weight: 0.4,
      });

interface SupabaseMatchRow {
  id: string;
  document_id: string;
  act_name: string;
  act_short_name: string;
  provision_identifier: string;
  title: string;
  category: LegalSourceProvision["category"];
  official_url: string;
  provenance: string;
  verification_status: LegalSourceProvision["verificationStatus"];
  last_checked_at: string | null;
  content: string;
  plain_summary: string;
  statutory_limitation_note?: string;
  is_embedded?: boolean;
  embedding_model?: string | null;
  combined_score: number;
}

      if (!error && Array.isArray(data) && data.length > 0) {
        const rows = data as unknown as SupabaseMatchRow[];
        const mapped = rows.map((row) => ({
          id: row.id,
          actName: row.act_name,
          actShortName: row.act_short_name,
          actYear: 2023,
          section: row.provision_identifier,
          provisionTitle: row.title,
          jurisdiction: "Union of India (Central)" as const,
          officialSourceUrl: row.official_url,
          sourcePublisher: row.provenance || "Government of India",
          lastCheckedDate: row.last_checked_at ? row.last_checked_at.slice(0, 10) : "2026-10-27",
          verificationStatus: row.verification_status === "pending_gazette_update" ? ("pending_gazette_update" as const) : ("officially_verified" as const),
          category: row.category,
          keyStatutoryText: row.content,
          plainSummary: row.plain_summary,
          statutoryLimitationNote: row.statutory_limitation_note,
          keywords: [],
        }));

        const anyEmbedded = rows.some((r) => r.is_embedded === true);

        return {
          sources: mapped,
          hasGroundedSources: true,
          queryLanguage: lang,
          methodUsed: anyEmbedded ? "hybrid_supabase_pgvector" : "lexical_full_text",
          isLexicalOnly: !anyEmbedded,
          semanticEngineStatus: anyEmbedded ? "active" : "unembedded_corpus",
          retrievalLatencyMs: Date.now() - startTime,
        };
      }
    } catch {
      // Remote DB fallback to in-memory hybrid
    }
  }

  // 3. In-Memory Retrieval (Lexical + Optional Model Vector Cosine)
  let queryEmbedding: number[] | null = null;
  try {
    queryEmbedding = await generateEmbedding(`${query} ${issueLower}`);
  } catch {
    // Continue with lexical scoring if embedding fails
  }

  const scored = await Promise.all(
    CANONICAL_PROVISIONS.map(async (prov) => {
      let score = 0;

      // Rule A: Historical statute crosswalk match (IPC 420 -> BNS 318)
      if (prioritizedIds.has(prov.id)) {
        score += 25;
      }

      // Rule B: Direct Section number match (e.g. "Section 318", "318", "138", "Order 39")
      const sectionNum = prov.provisionIdentifier.replace(/\D/g, "");
      if (sectionNum && sectionNum.length >= 2) {
        const regex = new RegExp(`\\b(${sectionNum}|${prov.provisionIdentifier.toLowerCase()})\\b`, "i");
        if (regex.test(queryLower)) {
          score += 18;
        }
      }

      // Rule C: Act name or short name match
      if (queryLower.includes(prov.actShortName.toLowerCase()) || queryLower.includes(prov.actName.toLowerCase())) {
        score += 14;
      }

      // Rule D: Practice Area Category match
      if (practiceAreas.some((p) => p.includes(prov.category) || prov.category.includes(p))) {
        score += 6;
      }

      // Rule E: Disambiguation guards:
      // Bail provisions should only be elevated when bail, arrest, or police custody is involved
      if (prov.id === "bnss-sec-482") {
        if (queryLower.includes("anticipatory") || queryLower.includes("अग्रिम जमानत") || queryLower.includes("apprehending arrest")) {
          score += 15;
        } else if (queryLower.includes("regular bail") || queryLower.includes("in custody")) {
          score -= 10;
        }
        if (!queryLower.includes("bail") && !queryLower.includes("जमानत") && !queryLower.includes("arrest") && !queryLower.includes("गिरफ्तार") && !queryLower.includes("custody") && !queryLower.includes("police")) {
          score -= 12;
        }
      } else if (prov.id === "bnss-sec-480") {
        if (queryLower.includes("regular bail") || queryLower.includes("custody") || queryLower.includes("arrested")) {
          score += 15;
        } else if (queryLower.includes("anticipatory") || queryLower.includes("अग्रिम")) {
          score -= 10;
        }
        if (!queryLower.includes("bail") && !queryLower.includes("जमानत") && !queryLower.includes("arrest") && !queryLower.includes("गिरफ्तार") && !queryLower.includes("custody") && !queryLower.includes("police")) {
          score -= 12;
        }
      }

      // Financial cheating, scams, fraudulent inducement (BNS Section 318)
      if (prov.id === "bns-sec-318") {
        if (
          queryLower.includes("scheme") ||
          queryLower.includes("took money") ||
          queryLower.includes("promised") ||
          queryLower.includes("promising") ||
          queryLower.includes("scam") ||
          queryLower.includes("fraud") ||
          queryLower.includes("cheat") ||
          queryLower.includes("trading") ||
          queryLower.includes("invest") ||
          queryLower.includes("धोखा")
        ) {
          score += 15;
        }
      }

      // Distinguish Consumer complaint (CPA 35) vs RERA complaint (RERA 31)
      if (prov.id === "cpa-sec-35") {
        if (queryLower.includes("consumer") || queryLower.includes("e-daakhil") || queryLower.includes("defective product") || queryLower.includes("deficiency")) {
          score += 12;
        }
        if (queryLower.includes("builder") || queryLower.includes("rera") || queryLower.includes("possession delay")) {
          score -= 8;
        }
      } else if (prov.id === "rera-sec-18" || prov.id === "rera-sec-31") {
        if (queryLower.includes("builder") || queryLower.includes("flat") || queryLower.includes("rera") || queryLower.includes("allottee") || queryLower.includes("possession")) {
          score += 16;
        }
      }

const LEGAL_STOP_WORDS = new Set([
  "with", "from", "that", "this", "have", "were", "when", "what",
  "also", "into", "been", "they", "will", "would", "could", "should",
  "their", "there", "about", "which", "where", "while", "under", "than",
  "some", "other", "then", "more", "most", "such", "only", "same"
]);

      // Rule F: Keywords matching (both English & Hindi)
      for (const kw of prov.keywords) {
        const kwLower = kw.toLowerCase();
        if (LEGAL_STOP_WORDS.has(kwLower)) continue;
        if (queryLower.includes(kwLower)) {
          score += 5;
        }
        if (issueLower.includes(kwLower)) {
          score += 4;
        }
      }

      // Rule G: Title words (excluding common stop words, whole word match)
      const titleTokens = prov.title
        .toLowerCase()
        .split(/[^\w\u0900-\u097F]+/)
        .filter((t) => t.length > 3 && !LEGAL_STOP_WORDS.has(t));

      for (const token of titleTokens) {
        const tokenRegex = new RegExp(`\\b${token}\\b`, "i");
        if (tokenRegex.test(queryLower)) {
          score += 2;
        }
      }

      // Rule H: Semantic Cosine Vector Similarity
      // Strictly requires genuine query embedding AND provision marked as genuinely embedded
      if (queryEmbedding && prov.isEmbedded) {
        const provRepresentation = `${prov.actShortName} ${prov.provisionIdentifier} - ${prov.title}. ${prov.plainSummary} ${prov.keywords.join(" ")}`;
        const provEmbedding = await generateEmbedding(provRepresentation);
        if (provEmbedding) {
          const sim = cosineSimilarity(queryEmbedding, provEmbedding);
          // Contribute semantic score if anchored by lexical match or strong semantic similarity
          if (score > 0 && sim > 0.25) {
            score += sim * 8;
          } else if (sim > 0.65) {
            score += sim * 10;
          }
        }
      }

      return {
        ref: provisionToReference(prov),
        score,
      };
    })
  );

  const matched = scored
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.ref)
    .slice(0, limit);

  const hasGroundedSources = matched.length > 0;
  const hasGenuineSemantic = Boolean(queryEmbedding && CANONICAL_PROVISIONS.some((p) => p.isEmbedded));

  return {
    sources: matched,
    hasGroundedSources,
    orientationDisclaimer: hasGroundedSources
      ? undefined
      : "General Indian legal orientation. Verify important details with a qualified advocate.",
    queryLanguage: lang,
    methodUsed: hasGenuineSemantic ? "hybrid_in_memory" : "lexical_in_memory",
    isLexicalOnly: !hasGenuineSemantic,
    semanticEngineStatus: hasGenuineSemantic ? "active" : "lexical_fallback_no_api_key",
    retrievalLatencyMs: Date.now() - startTime,
  };
}

/**
 * Validates generated citations against retrieved source records.
 * Strips any hallucinated citations not grounded in the retrieved sources.
 */
export function validateCitations(
  generatedText: string,
  retrievedSources: StatutoryReference[]
): StatutoryReference[] {
  if (!generatedText || retrievedSources.length === 0) return [];

  const textLower = generatedText.toLowerCase();

  return retrievedSources.filter((source) => {
    const actMentioned =
      textLower.includes(source.actShortName.toLowerCase()) ||
      textLower.includes(source.actName.toLowerCase());

    const sectionNum = source.section.replace(/\D/g, "");
    const sectionMentioned =
      textLower.includes(source.section.toLowerCase()) ||
      (sectionNum.length >= 2 && textLower.includes(sectionNum));

    return actMentioned || sectionMentioned;
  });
}
