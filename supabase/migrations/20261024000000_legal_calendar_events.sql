-- ==============================================================================
-- Migration: 20261024000000_legal_calendar_events.sql
-- Project: NyayLink - Indian Legal-Tech Platform
-- Description: Establishes public.calendar_events table for chambers and client
--              legal calendar, court hearings, deadlines, and consultations
--              with strict Row Level Security (RLS).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: calendar_events
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_type text NOT NULL CHECK (
    event_type IN ('hearing', 'consultation', 'meeting', 'deadline', 'filing', 'task', 'reminder')
  ),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  is_all_day boolean NOT NULL DEFAULT false,
  matter_id uuid REFERENCES public.legal_matters(id) ON DELETE SET NULL,
  consultation_id uuid REFERENCES public.consultation_requests(id) ON DELETE SET NULL,
  associated_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  associated_name text,
  location text,
  meeting_link text,
  notes text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
  reminder_minutes integer DEFAULT 60,
  is_court_verified boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_event_title_len CHECK (char_length(trim(title)) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time ASC);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON public.calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_matter_id ON public.calendar_events(matter_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_associated_user_id ON public.calendar_events(associated_user_id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER trg_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- 2.1 Users can view events they own or are associated with
DROP POLICY IF EXISTS "Users can view own or associated events" ON public.calendar_events;
CREATE POLICY "Users can view own or associated events"
  ON public.calendar_events FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = associated_user_id
  );

-- 2.2 Users can insert events where they are the owner
DROP POLICY IF EXISTS "Users can insert own events" ON public.calendar_events;
CREATE POLICY "Users can insert own events"
  ON public.calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- 2.3 Users can update their own events
DROP POLICY IF EXISTS "Users can update own events" ON public.calendar_events;
CREATE POLICY "Users can update own events"
  ON public.calendar_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2.4 Users can delete their own events
DROP POLICY IF EXISTS "Users can delete own events" ON public.calendar_events;
CREATE POLICY "Users can delete own events"
  ON public.calendar_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
