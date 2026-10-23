export type MatterStatus =
  | "intake"
  | "review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";

export type ConsultationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "scheduled"
  | "completed"
  | "cancelled";

export type MatterUpdateType = "status_change" | "note" | "milestone" | "document";

export interface MatterUpdate {
  id: string;
  matter_id: string;
  author_id: string;
  update_type: MatterUpdateType;
  content: string;
  created_at: string;
}

export interface LegalMatter {
  id: string;
  client_id: string;
  title: string;
  category: string;
  description: string;
  status: MatterStatus;
  assigned_lawyer_id: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  updates?: MatterUpdate[];
  lawyer?: {
    id: string;
    professional_name: string;
    city?: string;
    practice_areas?: string[];
  } | null;
  client?: {
    full_name?: string;
    phone?: string;
  } | null;
}

export interface ConsultationRequest {
  id: string;
  client_id: string;
  lawyer_id: string;
  matter_id: string | null;
  subject: string;
  message: string;
  preferred_date: string | null;
  status: ConsultationStatus;
  lawyer_response: string | null;
  scheduled_at: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  lawyer?: {
    id: string;
    professional_name: string;
    city?: string;
    practice_areas?: string[];
  } | null;
  client?: {
    full_name?: string;
    phone?: string;
  } | null;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LawyerProfileData {
  id: string;
  professional_name: string;
  bio: string | null;
  practice_areas: string[];
  experience_years: number;
  city: string | null;
  state: string | null;
  languages: string[];
  is_profile_completed: boolean;
  is_published: boolean;
  bar_council_number: string | null;
  bar_council_state: string | null;
  bar_council_enrollment_year: number | null;
  created_at: string;
  updated_at: string;
}

export interface LawyerVerificationData {
  id: string;
  lawyer_id: string;
  status: "pending" | "approved" | "changes_requested" | "rejected";
  reviewed_at: string | null;
  lawyer_feedback: string | null;
  submitted_at: string;
}

export type LegalEventType =
  | "hearing"
  | "consultation"
  | "meeting"
  | "deadline"
  | "filing"
  | "task"
  | "reminder";

export type CalendarPriority = "low" | "medium" | "high" | "urgent";

export type CalendarEventStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rescheduled";

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  event_type: LegalEventType;
  start_time: string;
  end_time?: string | null;
  is_all_day: boolean;
  matter_id?: string | null;
  consultation_id?: string | null;
  associated_user_id?: string | null;
  associated_name?: string | null;
  location?: string | null;
  meeting_link?: string | null;
  notes?: string | null;
  priority: CalendarPriority;
  status: CalendarEventStatus;
  reminder_minutes?: number | null;
  is_court_verified: boolean;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
  matter?: {
    id: string;
    title: string;
    category?: string;
  } | null;
}

