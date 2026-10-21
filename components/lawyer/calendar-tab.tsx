"use client";

import { ConsultationRequest } from "@/lib/portal/types";
import {
  Calendar,
  Clock,
  User,
} from "lucide-react";

interface CalendarTabProps {
  consultations: ConsultationRequest[];
}

export function CalendarTab({ consultations }: CalendarTabProps) {
  const confirmed = consultations.filter(
    (c) => c.status === "accepted" || c.status === "scheduled"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#D5E5D9]">
        <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#202824]">
          Chambers Calendar & Conferences
        </h1>
        <p className="text-xs text-[#69736D] mt-1">
          Confirmed advocate consultations, preliminary case hearings, and client appointments.
        </p>
      </div>

      {confirmed.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#D5E5D9] text-center space-y-3">
          <Calendar className="w-8 h-8 text-[#69736D] mx-auto opacity-50" />
          <h3 className="text-base font-serif font-semibold text-[#202824]">
            No Scheduled Conferences
          </h3>
          <p className="text-xs text-[#69736D] max-w-sm mx-auto">
            When you accept pending consultation requests with scheduled appointment times, they will be tracked on your active chamber calendar.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#69736D]">
            Confirmed Conferences ({confirmed.length})
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmed.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white border border-[#D5E5D9] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#D5E5D9]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#205C43]" />
                    <span className="text-xs font-semibold text-[#202824]">
                      {c.client?.full_name || `Client #${c.client_id.slice(0, 8)}`}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold uppercase">
                    Confirmed
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#202824]">
                    {c.subject}
                  </h4>
                  <p className="text-xs text-[#69736D] mt-1 line-clamp-2">
                    {c.message}
                  </p>
                </div>

                <div className="pt-2 text-xs text-[#202824] space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {c.scheduled_at
                        ? new Date(c.scheduled_at).toLocaleString()
                        : `Target Date: ${c.preferred_date || "To be arranged"}`}
                    </span>
                  </div>
                </div>

                {c.lawyer_response && (
                  <div className="p-3 rounded-xl bg-[#F8FAF9] border border-[#D5E5D9] text-[11px] text-[#69736D]">
                    <span className="font-semibold text-[#202824] block mb-0.5">
                      Chamber Instructions:
                    </span>
                    {c.lawyer_response}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
