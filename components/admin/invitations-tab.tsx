import { MailCheck, KeyRound, CheckCircle2, Clock, Ban } from "lucide-react";
import type { InvitationRecord } from "@/lib/admin/types";

interface InvitationsTabProps {
  invitations: InvitationRecord[];
}

export function InvitationsTab({ invitations }: InvitationsTabProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-[#141926] border border-[#232B3D] rounded-xl p-4 flex items-start gap-3">
        <KeyRound className="w-5 h-5 text-[#E5C07B] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E5C07B] mb-0.5 font-mono">
            Cryptographic Token Protection
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All invitations issued to lawyers store exclusively SHA-256 cryptographic hashes in <code className="text-[11px] bg-slate-800 px-1 py-0.5 rounded font-mono text-[#E5C07B]">public.invitations.token_hash</code>. Raw token secrets are never stored at rest in the database.
          </p>
        </div>
      </div>

      {invitations.length === 0 ? (
        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
            <MailCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-100 font-serif mb-1">
            No Invitations Issued
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Admin-issued onboarding invitations for advocates and law firm partners will appear here with expiration and redemption tracking.
          </p>
        </div>
      ) : (
        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0E121C] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2536] font-mono">
                <tr>
                  <th className="px-5 py-3.5">Invitee Email</th>
                  <th className="px-5 py-3.5">Token SHA-256 Hash</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Issued Date</th>
                  <th className="px-5 py-3.5">Expiration</th>
                  <th className="px-5 py-3.5">Invited By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2536]">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#141926] transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-100 font-mono">
                        {inv.email}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-400">
                      <span className="px-2 py-1 rounded bg-[#161B26] border border-[#232B3D] text-[11px] text-slate-300" title={inv.token_hash}>
                        {inv.token_hash.slice(0, 16)}...
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          inv.status === "accepted"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : inv.status === "pending"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700/60"
                        }`}
                      >
                        {inv.status === "accepted" && <CheckCircle2 className="w-3 h-3" />}
                        {inv.status === "pending" && <Clock className="w-3 h-3" />}
                        {inv.status === "revoked" && <Ban className="w-3 h-3" />}
                        {inv.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]" title={inv.invited_by}>
                      {inv.invited_by.slice(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
