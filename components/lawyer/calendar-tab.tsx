"use client";

import { ConsultationRequest, LegalMatter } from "@/lib/portal/types";
import { LegalCalendar } from "@/components/calendar/legal-calendar";

interface CalendarTabProps {
  consultations?: ConsultationRequest[];
  matters?: LegalMatter[];
  userId?: string;
}

export function CalendarTab({ matters = [], userId = "" }: CalendarTabProps) {
  return (
    <div className="space-y-6">
      <LegalCalendar
        role="lawyer"
        userId={userId}
        matters={matters}
      />
    </div>
  );
}
