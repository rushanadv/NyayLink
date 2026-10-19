"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Shield } from "lucide-react";
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
      <div className="border border-white/[0.07] bg-[#141614] rounded-lg px-5 py-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <Shield className="w-3.5 h-3.5 text-[#B8A078]" strokeWidth={1.5} />
          <span className="text-[#92958E]">
            Records in <code className="font-mono text-[#EEECE5] bg-white/[0.04] px-1 py-0.5 rounded">public.audit_logs</code> are protected by PostgreSQL immutability triggers (<code className="text-[#92958E]">trg_audit_logs_no_update</code>, <code className="text-[#92958E]">trg_audit_logs_no_delete</code>).
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#B8A078] shrink-0 ml-4">
          Append-Only
        </span>
      </div>

      {auditLogs.length === 0 ? (
        <div className="border border-white/[0.07] bg-[#141614] rounded-lg p-12 text-center flex flex-col items-center justify-center">
          <h3 className="text-base font-serif text-[#EEECE5] mb-1">
            No Audit Logs Recorded
          </h3>
          <p className="text-xs text-[#92958E] max-w-sm">
            Administrative role assignments, verification status transitions, and publication consent grants will automatically populate this ledger.
          </p>
        </div>
      ) : (
        <div className="border border-white/[0.07] bg-[#141614] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#EEECE5]">
              <thead className="border-b border-white/[0.07] bg-[#0E100E] text-[10px] font-mono tracking-wider uppercase text-[#92958E]">
                <tr>
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 font-medium">Action Event</th>
                  <th className="px-6 py-3 font-medium">Target Table</th>
                  <th className="px-6 py-3 font-medium">Actor</th>
                  <th className="px-6 py-3 font-medium">Target ID</th>
                  <th className="px-6 py-3 font-medium text-right">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {auditLogs.map((log) => {
                  const isExpanded = expandedRow === log.id;
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-[#92958E] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${
                            log.action.includes("ASSIGNED") || log.action.includes("GRANTED")
                              ? "text-emerald-300 bg-emerald-950/30 border border-emerald-800/30"
                              : log.action.includes("REVOKED")
                              ? "text-red-300 bg-red-950/30 border border-red-800/30"
                              : "text-[#B8A078] bg-[#B8A078]/10 border border-[#B8A078]/25"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-[#EEECE5] text-[11px]">
                        {log.target_table}
                      </td>

                      <td className="px-6 py-4 font-mono text-[#92958E]/70 text-[11px]" title={log.actor_id || "System"}>
                        {log.actor_id ? `${log.actor_id.slice(0, 8)}...` : <span className="italic">System</span>}
                      </td>

                      <td className="px-6 py-4 font-mono text-[#92958E]/70 text-[11px]" title={log.target_id || "None"}>
                        {log.target_id ? `${log.target_id.slice(0, 8)}...` : "—"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="px-2 py-0.5 rounded bg-white/[0.03] hover:bg-white/[0.07] text-[11px] font-mono text-[#92958E] hover:text-[#EEECE5] border border-white/[0.08] inline-flex items-center gap-1 transition-colors"
                        >
                          <span>{isExpanded ? "Hide" : "Inspect"}</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-[#B8A078]" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-[#92958E]" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 text-left p-3 rounded bg-[#0C0D0C] border border-white/[0.08] font-mono text-[11px] text-[#EEECE5] overflow-x-auto">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </td>
                    </tr>
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
