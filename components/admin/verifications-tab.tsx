import {
  Clock,
  CheckCircle2,
  FileCheck,
  Lock,
  MapPin,
  GraduationCap,
} from "lucide-react";
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
      {/* Top Banner Notice */}
      <div className="bg-[#141926] border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-0.5 font-mono">
            Verification Queue — Read-Only Mode
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Administrative decision actions (Approve, Reject, Request Changes) are intentionally disabled on this interface pending dedicated mutation security sign-off.
          </p>
        </div>
      </div>

      {pendingLawyers.length === 0 ? (
        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-100 font-serif mb-1">
            Verification Queue is Clean
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            There are currently no lawyer profiles awaiting Bar Council credential verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingLawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="bg-[#11141D] border border-amber-500/30 hover:border-[#C5A059] rounded-2xl p-6 shadow-xl transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block mb-1.5">
                    Pending Review
                  </span>
                  <h3 className="text-base font-bold font-serif text-slate-100">
                    {lawyer.professional_name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    ID: {lawyer.id}
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-[#161B26] border border-[#232B3D] flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              {/* Bar Council Credentials Box */}
              <div className="bg-[#161B26] border border-[#232B3D] rounded-xl p-4 space-y-2">
                <div className="text-[11px] font-semibold text-[#E5C07B] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5" />
                  Bar Council Enrollment Credentials
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Enrollment Number:</span>
                    <span className="text-slate-100 font-bold bg-[#0E121C] px-2 py-1 rounded border border-[#232B3D] inline-block mt-0.5">
                      {lawyer.bar_council_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Bar Council State:</span>
                    <span className="text-slate-200 mt-1 inline-block font-sans">
                      {lawyer.bar_council_state}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Enrollment Year:</span>
                    <span className="text-slate-200 mt-1 inline-block font-sans">
                      {lawyer.bar_council_enrollment_year}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Submission Time:</span>
                    <span className="text-slate-300 mt-1 inline-block">
                      {lawyer.verification?.submitted_at
                        ? new Date(lawyer.verification.submitted_at).toLocaleDateString()
                        : "Initial submission"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex flex-wrap gap-3 text-xs text-slate-400 pt-2 border-t border-[#1F2536]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lawyer.city}, {lawyer.state}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lawyer.experience_years} years experience</span>
                </div>
              </div>

              {/* Practice Areas */}
              <div className="flex flex-wrap gap-1">
                {lawyer.practice_areas.map((pa) => (
                  <span
                    key={pa}
                    className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {pa}
                  </span>
                ))}
              </div>

              {/* Verification checklist notice */}
              <div className="bg-[#0E121C] border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block text-[10px] uppercase tracking-wider font-mono">
                  Administrative Checklist:
                </span>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-400">
                  <li>Verify Bar Council database matches {lawyer.bar_council_number}</li>
                  <li>Confirm active license in State Bar of {lawyer.bar_council_state}</li>
                  <li>Verify experience claims ({lawyer.experience_years} yrs from {lawyer.bar_council_enrollment_year})</li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
