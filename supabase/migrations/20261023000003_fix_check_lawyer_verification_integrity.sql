-- ==============================================================================
-- Fix check_lawyer_verification_integrity to allow saving/updating while status is pending
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.check_lawyer_verification_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  -- Strict Check 1: Reviewer cannot be the lawyer under review
  IF NEW.reviewed_by IS NOT NULL AND NEW.reviewed_by = NEW.lawyer_id THEN
    RAISE EXCEPTION 'Security Violation: Self-review prohibited. Reviewer cannot be the lawyer under review.';
  END IF;

  -- Handling INSERT:
  IF TG_OP = 'INSERT' THEN
    IF NOT public.is_admin() THEN
      -- Regular lawyer inserting initial verification record
      NEW.status = 'pending';
      NEW.reviewed_by = NULL;
      NEW.reviewed_at = NULL;
      NEW.lawyer_feedback = NULL;
      NEW.internal_notes = NULL;
      NEW.submitted_at = now();
    ELSE
      -- Admin inserting verification record: Trustworthy reviewer bound to authenticated admin
      IF NEW.status IN ('approved', 'rejected', 'changes_requested') THEN
        NEW.reviewed_by = auth.uid();
        IF NEW.reviewed_by = NEW.lawyer_id THEN
          RAISE EXCEPTION 'Security Violation: Administrator cannot approve their own lawyer profile';
        END IF;
        NEW.reviewed_at = now();
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- Handling UPDATE:
  IF TG_OP = 'UPDATE' THEN
    -- Protect immutable verification identifiers across all updates
    IF NEW.id <> OLD.id THEN
      RAISE EXCEPTION 'Immutable Field: Verification ID cannot be modified';
    END IF;
    IF NEW.lawyer_id <> OLD.lawyer_id THEN
      RAISE EXCEPTION 'Immutable Field: Verification lawyer_id cannot be modified';
    END IF;
    IF NEW.created_at <> OLD.created_at THEN
      NEW.created_at = OLD.created_at;
    END IF;

    IF NOT public.is_admin() THEN
      -- A lawyer can update their record to resubmit ('pending') after 'changes_requested' OR update draft while 'pending'
      IF (OLD.status = 'changes_requested' AND NEW.status = 'pending') OR (OLD.status = 'pending' AND NEW.status = 'pending') THEN
        NEW.reviewed_by = NULL;
        NEW.reviewed_at = NULL;
        NEW.submitted_at = now();
        -- Preserve previous feedback and internal notes
        NEW.lawyer_feedback = OLD.lawyer_feedback;
        NEW.internal_notes = OLD.internal_notes;
      ELSE
        RAISE EXCEPTION 'Permission Denied: Only administrators can modify verification statuses or review records';
      END IF;
    ELSE
      -- Admin updating the record
      IF NEW.status IN ('approved', 'rejected', 'changes_requested') THEN
        -- Trustworthy Reviewer Identity: Always bind reviewed_by to the actual authenticated admin
        NEW.reviewed_by = auth.uid();
        IF NEW.reviewed_by = NEW.lawyer_id THEN
          RAISE EXCEPTION 'Security Violation: Administrator cannot approve their own lawyer profile';
        END IF;
        NEW.reviewed_at = now();
      ELSIF NEW.status = 'pending' THEN
        NEW.reviewed_by = NULL;
        NEW.reviewed_at = NULL;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;
