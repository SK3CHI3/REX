-- Migration: allow undated/uncountied cases into the review queue
-- Real documented cases (e.g. HRW's 2016-2017 post-election killings) have no
-- specific incident date; forcing one invites fabrication. The admin review
-- queue can now stage them, and the frontend blocks approval until a date is set.
-- Also fixes a latent n8n scraper failure: its Map Case Fields node can
-- legitimately emit a null incident_date, which the old NOT NULL rejected.

ALTER TABLE public.case_submissions ALTER COLUMN incident_date DROP NOT NULL;
ALTER TABLE public.case_submissions ALTER COLUMN county DROP NOT NULL;
