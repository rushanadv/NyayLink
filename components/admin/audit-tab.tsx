"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Shield, Clock } from "lucide-react";
import type { AuditLogRecord } from "@/lib/admin/types";

interface AuditTabProps {
  auditLogs: AuditLogRecord[];
}

export function AuditTab({ auditLogs }: AuditTabProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="border border-white/[0.06] bg-[#111119] rounded-xl px-5 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Shield className="w-3.5 h-3.5 text-[#A99AFF]" strokeWidth={1.5} />
          <span className="text-[#A5A3B2]">
            Records in <code className="font-mono text-[#F5F4FA] bg-white/[0.06] px-1.5 py-0.5 rounded">public.audit_logs</code> are fortified by PostgreSQL immutability triggers (<code className="text-[#A99AFF]">trg_audit_logs_no_update</code>, <code className="text-[#A99AFF]">trg_audit_logs_no_delete</code>).
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#A99AFF] px-2 py-0.5 rounded bg-[#A99AFF]/10 border border-[#A99AFF]/20 shrink-0 ml-4">
          Append-Only Ledger
        </span>
      </div>

      {auditLogs.length === 0 ? (
        <div className="border border-white/[0.06] bg-[#111119] rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#6F6E7D] mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-[#F5F4FA] mb-1">
            No Audit Logs Recorded
          </h3>
          <p className="text-xs text-[#A5A3B2] max-w-sm">
            Administrative role assignments, verification status transitions, and publication consent grants will automatically populate this ledger.
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.06] bg-[#111119] rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#F5F4FA]">
              <thead className="border-b border-white/[0.06] bg-[#0E0E17] text-[11px] font-mono tracking-wider uppercase text-[#6F6E7D]">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Timestamp</th>
                  <th className="px-6 py-3.5 font-medium">Action Event</th>
                  <th className="px-6 py-3.5 font-medium">Target Table</th>
                  <th className="px-6 py-3.5 font-medium">Actor</th>
                  <th className="px-6 py-3.5 font-medium">Target ID</th>
                  <th className="px-6 py-3.5 font-medium text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {auditLogs.map((log) => {
                  const isExpanded = expandedRow === log.id;
                  return (
                    <tbody key={log.id} className="divide-y divide-white/[0.02]">
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td suppressHydrationWarning className="px-6 py-4 font-mono text-[11px] text-[#A5A3B2] whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                              log.action.includes("ASSIGNED") || log.action.includes("GRANTED") || log.action.includes("APPROVED")
                                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                : log.action.includes("REVOKED") || log.action.includes("REJECTED")
                                ? "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                                : "text-[#A99AFF] bg-[#A99AFF]/10 border border-[#A99AFF]/25"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-mono text-[#F5F4FA] text-[11px]">
                          {log.target_table}
                        </td>

                        <td className="px-6 py-4 font-mono text-[#6F6E7D] text-[11px]" title={log.actor_id || "System"}>
                          {log.actor_id ? `${log.actor_id.slice(0, 8)}...` : <span className="italic">System Trigger</span>}
                        </td>

                        <td className="px-6 py-4 font-mono text-[#6F6E7D] text-[11px]" title={log.target_id || "None"}>
                          {log.target_id ? `${log.target_id.slice(0, 8)}...` : "—"}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-[#A99AFF]/15 text-[11px] font-mono text-[#A5A3B2] hover:text-[#A99AFF] border border-white/[0.08] hover:border-[#A99AFF]/30 inline-flex items-center gap-1 transition-colors"
                          >
                            <span>{isExpanded ? "Close" : "Inspect"}</span>
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3 text-[#A99AFF]" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-[#6F6E7D]" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-[#09090F] border-y border-white/[0.06]">
                            <div className="flex items-center justify-between text-[11px] font-mono text-[#6F6E7D] mb-2">
                              <span>Event Payload Metadata (JSONB)</span>
                              <span>Record ID: {log.id}</span>
                            </div>
                            <div className="p-4 rounded-lg bg-[#0D0D15] border border-white/[0.06] font-mono text-[11px] text-[#F5F4FA] overflow-x-auto">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
