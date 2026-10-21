"use client";

import { LegalMatter } from "@/lib/portal/types";
import {
  FolderLock,
  ShieldCheck,
} from "lucide-react";

interface DocumentsTabProps {
  matters: LegalMatter[];
}

export function DocumentsTab({ matters }: DocumentsTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D5E5D9]">
        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
          Chambers Document Vault
        </h1>
        <p className="text-xs text-[#69736D] mt-1">
          Authorized case files, vakalatnama agreements, and privileged pleadings for assigned clients.
        </p>
      </div>

      {/* Privilege & Confidentiality Banner */}
      <div className="p-4 rounded-2xl bg-[#EAF3ED]/80 border border-[#D5E5D9] flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-[#174530] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-[#202824] uppercase font-mono tracking-wider text-[11px]">
            Attorney-Client Privilege Protection (Section 126, Evidence Act / BSA 2023)
          </span>
          <p className="leading-relaxed text-[#69736D] text-[11px]">
            Under Indian procedural law, all communications, documents, and evidentiary materials transferred between client and retained advocate are strictly privileged. This vault enforces cryptographic isolation so that chambers can only access case documents belonging to actively retained matters.
          </p>
        </div>
      </div>

      {/* Safe Foundation / Dockets Overview */}
      <div className="p-12 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F8FAF9] border border-[#D5E5D9] text-[#174530] flex items-center justify-center mx-auto">
          <FolderLock className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-base font-serif font-semibold text-[#202824]">
            {matters.length === 0
              ? "No Assigned Case Vaults"
              : "Vault Initialized for Assigned Dockets"}
          </h3>
          <p className="text-xs text-[#69736D] leading-relaxed">
            {matters.length === 0
              ? "Case document storage will activate once your chambers is retained on active client dockets."
              : "Case repositories are established for your active matters. As evidentiary attachments are filed, SHA-verified records will appear here."}
          </p>
        </div>

        {matters.length > 0 && (
          <div className="max-w-md mx-auto pt-4 text-left border-t border-[#D5E5D9]/70">
            <span className="text-[11px] font-mono uppercase text-[#69736D] font-semibold">
              Authorized Matter Repositories ({matters.length}):
            </span>
            <ul className="mt-2 space-y-1.5 text-xs text-[#202824]">
              {matters.map((m) => (
                <li
                  key={m.id}
                  className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] flex items-center justify-between"
                >
                  <span className="line-clamp-1 font-medium">{m.title}</span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Privilege Enforced
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
