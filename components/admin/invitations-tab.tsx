import { KeyRound } from "lucide-react";
import type { InvitationRecord } from "@/lib/admin/types";

interface InvitationsTabProps {
  invitations: InvitationRecord[];
}

export function InvitationsTab({ invitations }: InvitationsTabProps) {
  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="border border-white/[0.07] bg-[#141614] rounded-lg px-5 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <KeyRound className="w-3.5 h-3.5 text-[#B8A078]" strokeWidth={1.5} />
          <span className="text-[#92958E]">
            Invitations store exclusively cryptographic SHA-256 hashes in <code className="font-mono text-[#EEECE5] bg-white/[0.04] px-1 py-0.5 rounded">public.invitations.token_hash</code>. Raw tokens are never persisted in the database.
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#B8A078] shrink-0 ml-4">
          SHA-256 Hashed
        </span>
      </div>

      {invitations.length === 0 ? (
        <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-12 text-center flex flex-col items-center justify-center">
          <h3 className="text-base font-serif text-[#EEECE5] mb-1">
            No Active Invitations
          </h3>
          <p className="text-xs text-[#92958E] max-w-sm">
            Admin-issued onboarding tokens for advocate onboarding will be cataloged here with cryptographic status and expiration tracking.
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.07] bg-[#141614] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#EEECE5]">
              <thead className="border-b border-white/[0.07] bg-[#0E100E] text-[10px] font-mono tracking-wider uppercase text-[#92958E]">
                <tr>
                  <th className="px-6 py-3 font-medium">Invitee Email</th>
                  <th className="px-6 py-3 font-medium">Token SHA-256 Hash</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Issued Date</th>
                  <th className="px-6 py-3 font-medium">Expiration</th>
                  <th className="px-6 py-3 font-medium text-right">Issuer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#EEECE5]">
                      {inv.email}
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-[#92958E]/80">
                      <span className="bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]" title={inv.token_hash}>
                        {inv.token_hash.slice(0, 16)}...
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                          inv.status === "accepted"
                            ? "text-emerald-300 bg-emerald-950/30 border border-emerald-800/30"
                            : inv.status === "pending"
                            ? "text-[#B8A078] bg-[#B8A078]/10 border border-[#B8A078]/25"
                            : "text-[#92958E] bg-white/[0.04] border border-white/[0.06]"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-[#92958E] font-mono text-[11px]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-[#92958E] font-mono text-[11px]">
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right text-[#92958E]/70 font-mono text-[11px]" title={inv.invited_by}>
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
