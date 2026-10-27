"use client";

import React, { useState, useTransition } from "react";
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Database,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
} from "lucide-react";
import type { LegalSourceDocument, LegalSourceProvision } from "@/lib/legal/canonical-registry";
import { triggerSourceIngestionAction, testSourceRetrievalAction } from "@/app/actions/admin-sources";

interface LegalSourcesTabProps {
  documents: LegalSourceDocument[];
  provisions: LegalSourceProvision[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ingestionRuns?: any[];
  isLiveDb?: boolean;
}

export function LegalSourcesTab({
  documents,
  provisions,
  ingestionRuns = [],
  isLiveDb = false,
}: LegalSourcesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAct, setSelectedAct] = useState<string>("all");

  // Ingestion state
  const [isPending, startTransition] = useTransition();
  const [ingestionMessage, setIngestionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Test retrieval state
  const [testQuery, setTestQuery] = useState("");
  const [isRetrieving, setIsRetrieving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [retrievalOutput, setRetrievalOutput] = useState<any | null>(null);

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "criminal", label: "Criminal (BNS/BNSS)" },
    { id: "civil", label: "Civil (CPC/BSA)" },
    { id: "consumer", label: "Consumer (CPA)" },
    { id: "property", label: "Property & RERA" },
    { id: "commercial", label: "Commercial & NI Act" },
    { id: "family", label: "Family & Maintenance" },
  ];

  // Filter provisions
  const filteredProvisions = provisions.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    if (selectedAct !== "all" && (p.actShortName !== selectedAct && p.documentId !== selectedAct)) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      p.provisionIdentifier.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.actName.toLowerCase().includes(q) ||
      p.actShortName.toLowerCase().includes(q) ||
      p.plainSummary.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleTriggerIngestion = () => {
    setIngestionMessage(null);
    startTransition(async () => {
      const res = await triggerSourceIngestionAction();
      if (res.success && res.outcome) {
        setIngestionMessage({
          type: "success",
          text: `Ingestion verified: ${res.outcome.documentsIngested} Acts, ${res.outcome.provisionsIngested} provisions synced. Status: ${res.outcome.status}.`,
        });
      } else {
        setIngestionMessage({
          type: "error",
          text: res.error || "Failed to trigger ingestion.",
        });
      }
    });
  };

  const handleTestRetrieval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsRetrieving(true);
    setRetrievalOutput(null);
    try {
      const res = await testSourceRetrievalAction(testQuery, selectedCategory);
      if (res.success && res.result) {
        setRetrievalOutput(res.result);
      } else {
        setRetrievalOutput({ error: res.error || "Retrieval test failed." });
      }
    } catch (err) {
      setRetrievalOutput({ error: String(err) });
    } finally {
      setIsRetrieving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Operational Architecture */}
      <section className="rounded-2xl border border-white/[0.06] bg-[#111119] overflow-hidden">
        <div className="p-7 sm:p-8 bg-gradient-to-br from-[#161426] via-[#121120] to-[#0D0D17] relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#A99AFF] px-2.5 py-0.5 rounded-full bg-[#A99AFF]/10 border border-[#A99AFF]/20 flex items-center gap-1.5">
                  <Database className="w-3 h-3" />
                  <span>Curated Legal Source Registry & pgvector Pipeline</span>
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                  <span>{isLiveDb ? "PostgreSQL pgvector Connected" : "Canonical Local In-Memory Fallback"}</span>
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[#F5F4FA] tracking-tight">
                Authoritative Indian Statutory Sources & Retrieval Pipeline
              </h1>
              <p className="text-xs text-[#A5A3B2] max-w-3xl leading-relaxed">
                Grounded in the official Digital India Code Repository (
                <a
                  href="https://www.indiacode.nic.in/indiacode/home.jsp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A99AFF] hover:underline inline-flex items-center gap-0.5"
                >
                  indiacode.nic.in <ExternalLink className="w-2.5 h-2.5" />
                </a>
                ) and Gazette publications. Feeds AI Preconsultation, fact confirmations, and lawyer-ready briefs.
              </p>
            </div>

            {/* Ingestion & Sync Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleTriggerIngestion}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl bg-[#A99AFF] hover:bg-[#9785FF] text-[#09090F] text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
                <span>{isPending ? "Verifying..." : "Verify & Sync Sources"}</span>
              </button>
            </div>
          </div>

          {ingestionMessage && (
            <div
              className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
                ingestionMessage.type === "success"
                  ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-950/40 border border-rose-500/30 text-rose-300"
              }`}
            >
              {ingestionMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{ingestionMessage.text}</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-white/[0.06]">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#6F6E7D]">
                Enactments Registered
              </div>
              <div className="text-xl font-bold font-mono text-[#F5F4FA] mt-1">
                {documents.length} Acts
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#6F6E7D]">
                Provisions Curated
              </div>
              <div className="text-xl font-bold font-mono text-[#A99AFF] mt-1">
                {provisions.length} Sections
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#6F6E7D]">
                Embedding Model
              </div>
              <div className="text-xs font-mono text-[#F5F4FA] mt-1">
                text-embedding-3-small (1536d)
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#6F6E7D]">
                Primary Provenance
              </div>
              <div className="text-xs font-mono text-[#F5F4FA] mt-1 truncate">
                Official India Code (NIC)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mandatory Statutory Coverage & Non-Exhaustiveness Disclosure */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-200/90 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Statutory Coverage Boundary & Legal Integrity Notice</span>
        </div>
        <p className="leading-relaxed pl-6 text-[#C9C2B0]">
          This registry includes verified, authoritative statutory sections under core central enactments (Bharatiya Nyaya Sanhita 2023, Bharatiya Nagarik Suraksha Sanhita 2023, Bharatiya Sakshya Adhiniyam 2023, CPC 1908, Consumer Protection Act 2019, RERA 2016, NI Act 1881, Contract Act 1872, and TPA 1882). It is a selective corpus for initial legal preconsultation and orientation.
          <strong> It is NOT an exhaustive compilation of all Indian legislation.</strong> State-specific amendments, municipal rules, local rent control laws, and uncodified customary personal laws require advocate verification.
        </p>
      </div>

      {/* 3. Interactive Retrieval Quality & Safety Inspector */}
      <section className="rounded-xl border border-white/[0.06] bg-[#111119] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A99AFF]" />
            <h2 className="text-sm font-semibold text-[#F5F4FA]">
              Interactive Hybrid Retrieval Tester
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#6F6E7D]">
            Tests lexical keyword matching + 1536-dim vector cosine similarity
          </span>
        </div>

        <form onSubmit={handleTestRetrieval} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Enter test legal query (e.g. 'bail in non-bailable case', 'anticipatory bail', 'धोखाधड़ी 420', 'builder delayed possession', 'e-daakhil defect')..."
            className="flex-1 px-3 py-2 rounded-lg bg-[#09090F] border border-white/[0.08] text-xs text-[#F5F4FA] focus:outline-none focus:border-[#A99AFF]"
          />
          <button
            type="submit"
            disabled={isRetrieving || !testQuery.trim()}
            className="px-4 py-2 rounded-lg bg-[#A99AFF] text-[#09090F] text-xs font-semibold hover:bg-[#9785FF] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isRetrieving ? "Searching..." : "Test Retrieval"}
          </button>
        </form>

        {retrievalOutput && (
          <div className="mt-4 p-4 rounded-lg bg-[#09090F] border border-white/[0.08] space-y-3">
            <div className="flex flex-wrap items-center justify-between text-xs font-mono gap-2">
              <span className="text-[#A5A3B2]">
                Language: <strong className="text-[#F5F4FA]">{retrievalOutput.queryLanguage}</strong> | Engine:{" "}
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    retrievalOutput.isLexicalOnly
                      ? "bg-amber-950/40 text-amber-300 border border-amber-500/30"
                      : "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {retrievalOutput.isLexicalOnly ? "Lexical Mode (tsvector + Keywords)" : "Hybrid Semantic (pgvector 1536d)"}
                </span>
              </span>
              <span className="text-[#6F6E7D]">
                Latency: {retrievalOutput.retrievalLatencyMs}ms | Grounded: {retrievalOutput.hasGroundedSources ? "Yes" : "No (Fallback)"}
              </span>
            </div>

            {retrievalOutput.isLexicalOnly && (
              <div className="p-2.5 rounded bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-300">
                Notice: Synthetic placeholder vectors are excluded from scoring. Operating safely via official statutory text and tsvector ranking.
              </div>
            )}

            {retrievalOutput.orientationDisclaimer && (
              <div className="p-2.5 rounded bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300">
                Fallback Notice Triggered: <em>&quot;{retrievalOutput.orientationDisclaimer}&quot;</em>
              </div>
            )}

            {retrievalOutput.sources && retrievalOutput.sources.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#6F6E7D]">
                  Retrieved Authoritative Records ({retrievalOutput.sources.length}):
                </div>
                {retrievalOutput.sources.map((s: any, idx: number) => (
                  <div key={idx} className="p-3 rounded bg-[#14141E] border border-white/[0.04] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-400">
                        {s.actShortName} — {s.section}
                      </span>
                      <a
                        href={s.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#A99AFF] hover:underline flex items-center gap-1"
                      >
                        <span>India Code</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="font-medium text-[#F5F4FA]">{s.provisionTitle}</div>
                    <p className="text-[#A5A3B2] text-[11px] leading-relaxed line-clamp-2">
                      {s.plainSummary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. Provisions Directory & Filtering */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#A99AFF]" />
            <h2 className="text-sm font-semibold text-[#F5F4FA]">
              Curated Provisions Directory ({filteredProvisions.length})
            </h2>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6F6E7D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search section, act, or keyword..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#111119] border border-white/[0.08] text-xs text-[#F5F4FA] placeholder-[#6F6E7D] focus:outline-none focus:border-[#A99AFF]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#A99AFF] text-[#09090F] font-semibold"
                  : "bg-[#111119] border border-white/[0.06] text-[#A5A3B2] hover:text-[#F5F4FA] hover:bg-[#161622]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Provisions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProvisions.map((prov) => (
            <div
              key={prov.id}
              className="p-5 rounded-xl border border-white/[0.06] bg-[#111119] space-y-3 flex flex-col justify-between hover:border-white/[0.12] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {prov.actShortName} — {prov.provisionIdentifier}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {prov.isEmbedded ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        1536d Embedded
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                        Lexical Index Only
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>Verified</span>
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-[#F5F4FA]">{prov.title}</h3>

                {prov.chapter && (
                  <div className="text-[11px] font-mono text-[#6F6E7D]">{prov.chapter}</div>
                )}

                <p className="text-xs text-[#A5A3B2] leading-relaxed line-clamp-3">
                  {prov.plainSummary}
                </p>

                {prov.statutoryLimitationNote && (
                  <div className="p-2 rounded bg-[#09090F] border border-white/[0.04] text-[11px] text-[#A99AFF] font-mono">
                    Limitation: {prov.statutoryLimitationNote}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#6F6E7D]">
                <span>Checked: {prov.lastCheckedDate}</span>
                <a
                  href={prov.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A99AFF] hover:underline flex items-center gap-1"
                >
                  <span>India Code URL</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
