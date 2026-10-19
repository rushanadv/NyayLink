"use client";

import { useState } from "react";
import { Shield, ChevronDown, ChevronRight, Activity } from "lucide-react";
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
      {/* Top Banner Notice */}
      <div className="bg-[#141926] border border-[#232B3D] rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-[#E5C07B] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#E5C07B] mb-0.5 font-mono">
            Cryptographically Protected Append-Only Audit Stream
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            All records in <code className="text-[11px] bg-slate-800 px-1 py-0.5 rounded font-mono text-[#E5C07B]">public.audit_logs</code> are protected by PostgreSQL immutability triggers (<code className="text-[11px] text-slate-300">trg_audit_logs_no_update</code>, <code className="text-[11px] text-slate-300">trg_audit_logs_no_delete</code>). Records cannot be modified or deleted by any user or administrator.
          </p>
        </div>
      </div>

      {auditLogs.length === 0 ? (
        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl p-12 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-slate-400 mb-4">
            <Activity className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-100 font-serif mb-1">
            No Audit Logs Recorded
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            System audit events triggered by role assignments, status changes, or publication consent will automatically appear in this immutable timeline.
          </p>
        </div>
      ) : (
        <div className="bg-[#11141D] border border-[#1F2536] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0E121C] text-slate-400 uppercase tracking-wider text-[10px] border-b border-[#1F2536] font-mono">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Target Table</th>
                  <th className="px-5 py-3.5">Actor UUID</th>
                  <th className="px-5 py-3.5">Target UUID</th>
                  <th className="px-5 py-3.5 text-right">Metadata Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2536]">
                {auditLogs.map((log) => {
                  const isExpanded = expandedRow === log.id;
                  return (
                    <tr key={log.id} className="hover:bg-[#141926] transition-colors group">
                      <td className="px-5 py-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                            log.action.includes("ASSIGNED") || log.action.includes("GRANTED")
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : log.action.includes("REVOKED")
                              ? "bg-red-500/15 text-red-300 border border-red-500/30"
                              : "bg-[#C5A059]/15 text-[#E5C07B] border border-[#C5A059]/30"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-[#161B26] border border-[#232B3D] text-[11px]">
                          {log.target_table}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-400 text-[11px]" title={log.actor_id || "System Trigger"}>
                        {log.actor_id ? `${log.actor_id.slice(0, 8)}...` : <span className="text-slate-400 italic">System</span>}
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-400 text-[11px]" title={log.target_id || "None"}>
                        {log.target_id ? `${log.target_id.slice(0, 8)}...` : "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="px-2.5 py-1 rounded bg-[#161B26] hover:bg-[#202738] text-slate-300 border border-[#232B3D] text-[11px] font-mono inline-flex items-center gap-1 transition-colors"
                        >
                          <span>{isExpanded ? "Hide JSON" : "View JSON"}</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-[#E5C07B]" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 text-left p-3 rounded-xl bg-[#090B10] border border-[#232B3D] font-mono text-[11px] text-slate-300 overflow-x-auto">
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
