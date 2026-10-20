import { KeyRound } from "lucide-react";
import type { InvitationRecord } from "@/lib/admin/types";

interface InvitationsTabProps {
  invitations: InvitationRecord[];
}

export function InvitationsTab({ invitations }: InvitationsTabProps) {
  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="border border-white/[0.06] bg-[#111119] rounded-xl px-5 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <KeyRound className="w-3.5 h-3.5 text-[#A99AFF]" strokeWidth={1.5} />
          <span className="text-[#A5A3B2]">
            Invitations store exclusively cryptographic SHA-256 hashes in <code className="font-mono text-[#F5F4FA] bg-white/[0.06] px-1.5 py-0.5 rounded">public.invitations.token_hash</code>. Raw tokens are never persisted in the database.
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#A99AFF] px-2 py-0.5 rounded bg-[#A99AFF]/10 border border-[#A99AFF]/20 shrink-0 ml-4">
          SHA-256 Hashed
        </span>
      </div>

      {invitations.length === 0 ? (
        <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#6F6E7D] mb-3">
            <KeyRound className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-[#F5F4FA] mb-1">
            No Active Invitations
          </h3>
          <p className="text-xs text-[#A5A3B2] max-w-sm">
            Admin-issued cryptographic tokens for partner advocate onboarding will be cataloged here with status and expiration tracking.
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.06] bg-[#111119] rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F5F4FA]">
              <thead className="border-b border-white/[0.06] bg-[#0E0E17] text-[11px] font-mono tracking-wider uppercase text-[#6F6E7D]">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Invitee Institutional Email</th>
                  <th className="px-6 py-3.5 font-medium">Token SHA-256 Digest</th>
                  <th className="px-6 py-3.5 font-medium">Lifecycle Status</th>
                  <th className="px-6 py-3.5 font-medium">Issued Date</th>
                  <th className="px-6 py-3.5 font-medium">Token Expiration</th>
                  <th className="px-6 py-3.5 font-medium text-right">Issuer UUID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#F5F4FA]">
                      {inv.email}
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-[#A5A3B2]">
                      <span className="bg-[#09090F] px-2 py-0.5 rounded-md border border-white/[0.08]" title={inv.token_hash}>
                        {inv.token_hash.slice(0, 16)}...
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                          inv.status === "accepted"
                            ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            : inv.status === "pending"
                            ? "text-[#A99AFF] bg-[#A99AFF]/10 border border-[#A99AFF]/25"
                            : "text-[#6F6E7D] bg-white/[0.04] border border-white/[0.06]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            inv.status === "accepted"
                              ? "bg-emerald-400"
                              : inv.status === "pending"
                              ? "bg-[#A99AFF]"
                              : "bg-[#6F6E7D]"
                          }`}
                        />
                        {inv.status}
                      </span>
                    </td>

                    <td suppressHydrationWarning className="px-6 py-4 text-[#A5A3B2] font-mono text-[11px]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>

                    <td suppressHydrationWarning className="px-6 py-4 text-[#A5A3B2] font-mono text-[11px]">
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right text-[#6F6E7D] font-mono text-[11px]" title={inv.invited_by}>
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
