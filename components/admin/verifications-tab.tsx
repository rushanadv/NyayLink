import { CheckCircle2, Lock, FileCheck } from "lucide-react";
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
      <div className="border border-white/[0.07] bg-[#141614] rounded-lg px-5 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Lock className="w-3.5 h-3.5 text-[#B8A078]" strokeWidth={1.5} />
          <span className="text-[#92958E]">
            Verification review queue is currently <strong className="text-[#EEECE5] font-medium">read-only</strong>. State transition workflows are preserved for authorized review sign-off.
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#B8A078] shrink-0 ml-4">
          Read-Only Mode
        </span>
      </div>

      {pendingLawyers.length === 0 ? (
        <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-12 text-center flex flex-col items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#B8A078] mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-base font-serif text-[#EEECE5] mb-1">
            Verification Queue Clear
          </h3>
          <p className="text-xs text-[#92958E] max-w-sm">
            All submitted advocate Bar Council filings have been reviewed. New credentials will appear here automatically upon submission.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingLawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="border border-white/[0.07] bg-[#141614] rounded-lg p-6 space-y-4 hover:border-[#B8A078]/40 transition-colors"
            >
              <div className="flex items-start justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#B8A078] block mb-1">
                    Pending Verification
                  </span>
                  <h3 className="text-lg font-serif text-[#EEECE5]">
                    {lawyer.professional_name}
                  </h3>
                  <div className="text-xs text-[#92958E] mt-0.5">
                    {lawyer.city}, {lawyer.state} · {lawyer.experience_years} years experience
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-[#92958E]/60">
                  {lawyer.verification?.submitted_at
                    ? new Date(lawyer.verification.submitted_at).toLocaleDateString()
                    : "Initial Filing"}
                </div>
              </div>

              {/* Bar Council Credentials Panel */}
              <div className="border border-white/[0.06] bg-[#0E100E] rounded p-4 space-y-2">
                <div className="text-[11px] font-mono text-[#B8A078] uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Bar Council Filing Credentials</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs font-mono pt-1">
                  <div>
                    <span className="text-[10px] text-[#92958E]/60 block uppercase">Registration</span>
                    <span className="text-[#EEECE5] font-bold block mt-0.5">
                      {lawyer.bar_council_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#92958E]/60 block uppercase">State Council</span>
                    <span className="text-[#EEECE5] block mt-0.5 font-sans">
                      {lawyer.bar_council_state}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#92958E]/60 block uppercase">Enrollment Year</span>
                    <span className="text-[#EEECE5] block mt-0.5">
                      {lawyer.bar_council_enrollment_year}
                    </span>
                  </div>
                </div>
              </div>

              {/* Practice Areas */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#92958E]/60 block">
                  Practice Areas
                </span>
                <div className="flex flex-wrap gap-1">
                  {lawyer.practice_areas.map((pa) => (
                    <span
                      key={pa}
                      className="px-2 py-0.5 rounded text-[11px] bg-white/[0.04] text-[#EEECE5] border border-white/[0.06]"
                    >
                      {pa}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="border-t border-white/[0.06] pt-3 text-xs text-[#92958E] space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#92958E]/60 block">
                  Verification Criteria
                </span>
                <div className="text-[11px] space-y-0.5 text-[#92958E]">
                  <div>• Confirm enrollment number {lawyer.bar_council_number} against State Bar Council of {lawyer.bar_council_state}</div>
                  <div>• Verify non-disciplinary standing and active license date</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
