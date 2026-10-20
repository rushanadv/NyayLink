import Link from "next/link";
import { CheckCircle2, Lock, FileCheck, ArrowRight, ShieldCheck } from "lucide-react";
import type { LawyerProfileRecord } from "@/lib/admin/types";

interface VerificationsTabProps {
  lawyers: LawyerProfileRecord[];
}

export function VerificationsTab({ lawyers }: VerificationsTabProps) {
  const pendingLawyers = lawyers.filter(
    (l) => !l.verification || l.verification.status === "pending"
  );

  return (
    <div className="space-y-6">
      {/* Read-Only Status Banner */}
      <div className="border border-white/[0.06] bg-[#111119] rounded-xl px-5 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Lock className="w-3.5 h-3.5 text-[#A99AFF]" strokeWidth={1.5} />
          <span className="text-[#A5A3B2]">
            Verification review ledger operates in <strong className="text-[#F5F4FA] font-medium">read-only administrative mode</strong>. State transitions (Approve, Reject, Request Changes) require workflow sign-off.
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#A99AFF] px-2 py-0.5 rounded bg-[#A99AFF]/10 border border-[#A99AFF]/20 shrink-0 ml-4">
          Read-Only Mode
        </span>
      </div>

      {pendingLawyers.length === 0 ? (
        <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-[#F5F4FA] mb-1.5">
            Verification Queue Current
          </h3>
          <p className="text-xs text-[#A5A3B2] max-w-md leading-relaxed mb-6">
            All submitted advocate Bar Council filings have been reviewed. New practitioner registrations will populate this operational queue automatically upon submission.
          </p>
          <Link
            href="/admin/dashboard?tab=lawyers"
            className="px-4 py-2 rounded-lg text-xs font-medium bg-[#1A1926] hover:bg-[#232135] text-[#F5F4FA] border border-white/[0.08] transition-colors inline-flex items-center gap-2"
          >
            <span>Browse Complete Advocate Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A99AFF] animate-pulse" />
              <span className="text-xs font-mono text-[#A5A3B2]">
                {pendingLawyers.length} advocate credentials awaiting administrative verification
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingLawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="border border-white/[0.06] bg-[#111119] rounded-xl p-6 space-y-5 hover:border-[#A99AFF]/30 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between border-b border-white/[0.06] pb-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-[#A99AFF] px-2 py-0.5 rounded bg-[#A99AFF]/10 border border-[#A99AFF]/20 inline-block mb-2">
                      Pending Verification
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight text-[#F5F4FA] group-hover:text-[#A99AFF] transition-colors">
                      {lawyer.professional_name}
                    </h3>
                    <div className="text-xs text-[#A5A3B2] mt-0.5">
                      {lawyer.city}, {lawyer.state} · {lawyer.experience_years} years experience
                    </div>
                  </div>

                  <div suppressHydrationWarning className="text-right font-mono text-[11px] text-[#6F6E7D]">
                    {lawyer.verification?.submitted_at
                      ? new Date(lawyer.verification.submitted_at).toLocaleDateString()
                      : "Initial Filing"}
                  </div>
                </div>

                {/* Bar Council Credentials Panel */}
                <div className="border border-white/[0.06] bg-[#09090F] rounded-lg p-4 space-y-2.5">
                  <div className="text-[11px] font-mono text-[#A99AFF] uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Bar Council Filing Credentials</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs font-mono pt-1">
                    <div>
                      <span className="text-[10px] text-[#6F6E7D] block uppercase">Registration</span>
                      <span className="text-[#F5F4FA] font-bold block mt-0.5">
                        {lawyer.bar_council_number}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6F6E7D] block uppercase">State Council</span>
                      <span className="text-[#F5F4FA] block mt-0.5 font-sans">
                        {lawyer.bar_council_state}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6F6E7D] block uppercase">Enrollment Year</span>
                      <span className="text-[#F5F4FA] block mt-0.5">
                        {lawyer.bar_council_enrollment_year}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Practice Areas */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6E7D] block">
                    Practice Areas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lawyer.practice_areas.map((pa) => (
                      <span
                        key={pa}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-white/[0.04] text-[#A5A3B2] border border-white/[0.06]"
                      >
                        {pa}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Verification Checklist */}
                <div className="border-t border-white/[0.06] pt-3.5 text-xs text-[#A5A3B2] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#6F6E7D]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A99AFF]" />
                    <span>Statutory Vetting Criteria</span>
                  </div>
                  <div className="text-[11px] space-y-1 text-[#6F6E7D]">
                    <div>• Confirm enrollment ID {lawyer.bar_council_number} with Bar Council of {lawyer.bar_council_state}</div>
                    <div>• Verify non-disciplinary standing and valid practitioner authorization</div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href="/admin/dashboard?tab=lawyers"
                    className="text-xs font-mono text-[#A99AFF] hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <span>Examine Full Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
