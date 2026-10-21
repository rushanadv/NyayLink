"use client";

import { LegalMatter } from "@/lib/portal/types";
import {
  ShieldCheck,
  FolderLock,
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
          Confidential Case Vault & Documents
        </h1>
        <p className="text-xs text-[#69736D] mt-1">
          Cryptographically secured storage for statutory notices, pleadings, contracts, and court orders.
        </p>
      </div>

      {/* Security Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-[#EAF3ED]/80 border border-[#D5E5D9] flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-[#205C43] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-[#202824] uppercase font-mono tracking-wider text-[11px]">
            Privileged Evidence Vault (DPDP Act, 2023)
          </span>
          <p className="leading-relaxed text-[#69736D] text-[11px]">
            All evidentiary uploads are scoped exclusively to authenticated matters under strict Row Level Security. Documents can only be retrieved by you and your assigned advocate. Third-party crawlers and unauthenticated visitors have zero access.
          </p>
        </div>
      </div>

      {/* Empty State / Safe Foundation */}
      <div className="p-12 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F8FAF9] border border-[#D5E5D9] text-[#205C43] flex items-center justify-center mx-auto">
          <FolderLock className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-base font-serif font-semibold text-[#202824]">
            No Case Documents Uploaded Yet
          </h3>
          <p className="text-xs text-[#69736D] leading-relaxed">
            When you attach agreements, notices, or hearing orders to your active matters, they will appear here with SHA-256 integrity verifications.
          </p>
        </div>

        {matters.length > 0 ? (
          <div className="max-w-md mx-auto pt-4 text-left border-t border-[#D5E5D9]/70">
            <span className="text-[11px] font-mono uppercase text-[#69736D] font-semibold">
              Eligible Registered Matters ({matters.length}):
            </span>
            <ul className="mt-2 space-y-1.5 text-xs text-[#202824]">
              {matters.map((m) => (
                <li
                  key={m.id}
                  className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#D5E5D9] flex items-center justify-between"
                >
                  <span className="line-clamp-1 font-medium">{m.title}</span>
                  <span className="text-[10px] font-mono text-[#69736D] shrink-0">
                    Vault Ready
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
