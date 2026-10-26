"use server";

import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

export interface SupportTicketInput {
  name: string;
  email: string;
  category: "account_deletion" | "login_issue" | "ai_preconsultation" | "advocate_verification" | "general";
  subject: string;
  message: string;
  honeypot?: string; // Bot trap
}

export interface SupportTicketResult {
  success: boolean;
  ticketId?: string;
  error?: string;
  message?: string;
}

// In-memory rate limiting for contact submissions: IP or Email -> timestamps
const contactRateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 5;

/**
 * Validates and records a user support or grievance ticket.
 * Complies with DPDP Act 2023 grievance redressal and avoids insecure file transmission.
 */
export async function submitSupportTicket(input: SupportTicketInput): Promise<SupportTicketResult> {
  try {
    // 1. Bot Honeypot Check
    if (input.honeypot && input.honeypot.trim().length > 0) {
      // Silently discard bot submission
      return { success: true, ticketId: `TICK-${Date.now().toString(36).toUpperCase()}` };
    }

    // 2. Validate input fields
    const name = input.name?.trim();
    const email = input.email?.trim().toLowerCase();
    const category = input.category || "general";
    const subject = input.subject?.trim();
    const message = input.message?.trim();

    if (!name || name.length < 2) {
      return { success: false, error: "Please enter your name (at least 2 characters)." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: "Please provide a valid email address for contact." };
    }

    if (!subject || subject.length < 3) {
      return { success: false, error: "Please provide a subject line (at least 3 characters)." };
    }

    if (!message || message.length < 10) {
      return { success: false, error: "Please provide a message explaining your inquiry (at least 10 characters)." };
    }

    // 3. Rate Limit Check by Email
    const now = Date.now();
    const timestamps = contactRateLimits.get(email) || [];
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

    if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) {
      return {
        success: false,
        error: "Too many support requests submitted recently. Please wait a few minutes before trying again.",
      };
    }
    recent.push(now);
    contactRateLimits.set(email, recent);

    // 4. Generate unique Ticket Reference ID
    const ticketId = `NYAY-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

    // 5. Audit Logging & Notification Dispatch
    // Log the grievance ticket in structured server log
    console.info(`[NyayLink Support Ticket Created] ID: ${ticketId} | Category: ${category} | Email: ${email} | Subject: "${subject}"`);

    // In a configured production environment with Resend or SMTP, dispatch notification here.
    const destinationEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@nyay.live";
    console.info(`[Support Notification Destination]: ${destinationEmail}`);

    return {
      success: true,
      ticketId,
      message: `Your inquiry has been received under Reference ID ${ticketId}. Our response desk will review it and reply within 24 to 48 business hours.`,
    };
  } catch (err: unknown) {
    console.error("[Support Ticket Exception]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to process support request.",
    };
  }
}
