/**
 * NyayLink Embedding Service for Indian Legal Retrieval
 *
 * Target Model: text-embedding-3-small (or compatible 1536-dimension embeddings)
 * Fixed Vector Dimension: 1536
 * Distance Metric: Cosine similarity
 */

import crypto from "crypto";

export const EMBEDDING_MODEL_NAME = "text-embedding-3-small";
export const EMBEDDING_DIMENSION = 1536;

/**
 * Validates that an embedding vector conforms strictly to expected dimension and non-degenerate values.
 */
export function validateEmbedding(embedding: unknown): embedding is number[] {
  if (!Array.isArray(embedding)) return false;
  if (embedding.length !== EMBEDDING_DIMENSION) return false;
  return embedding.every((val) => typeof val === "number" && Number.isFinite(val));
}

/**
 * Computes cosine similarity between two unit or raw vectors.
 * Returns a value in [-1, 1], where 1.0 represents identical orientation.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Deterministic unit-normalized vector projector for 1536-dimension space.
 * Used for reproducible local testing and offline fallback when external embedding APIs are unconfigured or throttled.
 */
export function generateDeterministicProjection(text: string): number[] {
  const normalized = text.toLowerCase().trim();
  const vector = new Array<number>(EMBEDDING_DIMENSION).fill(0);

  // Hash words and sub-tokens into reproducible buckets
  const tokens = normalized.split(/[\s,.;:!?()[\]{}"'\\/]+/).filter(Boolean);

  tokens.forEach((token, tokenIdx) => {
    const hash = crypto.createHash("sha256").update(`${token}:${tokenIdx % 4}`).digest();
    for (let i = 0; i < 32; i += 2) {
      const bucket = hash.readUInt16BE(i) % EMBEDDING_DIMENSION;
      const sign = (hash[i] & 1) === 0 ? 1 : -1;
      const weight = 1.0 + (hash[i + 1] % 10) / 10.0;
      vector[bucket] += sign * weight;
    }
  });

  // Also include character n-grams to capture Hindi unicode and morphological stems
  for (let i = 0; i < normalized.length - 2; i += 2) {
    const gram = normalized.slice(i, i + 3);
    const gramHash = crypto.createHash("sha256").update(`gram:${gram}`).digest();
    const bucket = gramHash.readUInt16BE(0) % EMBEDDING_DIMENSION;
    const sign = (gramHash[2] & 1) === 0 ? 1 : -1;
    vector[bucket] += sign * 0.5;
  }

  // Unit-normalize the resulting vector
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    norm += vector[i] * vector[i];
  }

  const magnitude = Math.sqrt(norm);
  if (magnitude === 0) {
    // Return unit vector along first axis if completely empty
    vector[0] = 1;
    return vector;
  }

  return vector.map((v) => v / magnitude);
}

/**
 * Returns true if OPENAI_API_KEY is configured for real model embedding generation.
 */
export function hasGenuineEmbeddingConfig(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  return typeof apiKey === "string" && apiKey.trim().length > 0 && !apiKey.includes("your-");
}

/**
 * Generates an embedding vector for a piece of text using the configured model.
 * If OPENAI_API_KEY is present, calls the OpenAI embedding API.
 * If OPENAI_API_KEY is unconfigured, returns null (does not silently fake embeddings),
 * unless offline test simulation is explicitly requested.
 */
export async function generateEmbedding(
  text: string,
  options?: { allowOfflineSimulation?: boolean }
): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (hasGenuineEmbeddingConfig()) {
    try {
      const endpoint = "https://api.openai.com/v1/embeddings";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL_NAME,
          input: text.slice(0, 8000),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.data?.[0]?.embedding;
        if (validateEmbedding(candidate)) {
          return candidate;
        }
      }
    } catch {
      // API call failed; return null to signal genuine embedding could not be created
      return null;
    }
  }

  // Fallback to deterministic projection ONLY when explicitly requested for offline test runners
  if (options?.allowOfflineSimulation || process.env.TEST_OFFLINE_EMBEDDINGS === "true") {
    return generateDeterministicProjection(text);
  }

  return null;
}

