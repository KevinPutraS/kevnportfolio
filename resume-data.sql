-- Responsibilities for the two experience entries that have none.
--
-- Written from what is already on the record: the organisation, the dates, the
-- technologies, and the internship certificate's own final evaluation. Nothing
-- here claims an outcome that is not in that certificate or implied by the
-- tools listed on the row.
--
-- EDIT THESE. They are drafts written to be true of what is on file, not a
-- transcript of what you did. If a line is not something you would be willing
-- to expand on in an interview, delete it — a CV bullet you cannot defend in
-- three sentences is worse than no bullet at all.
--
-- Run this in the Supabase SQL editor, once. Re-running it is safe: every
-- WHERE clause keys on a title, so a second run overwrites the same rows rather
-- than appending to them.

UPDATE public.experiences
SET responsibilities = ARRAY[
  'Supported internal users on hardware, network and software issues across the inspectorate''s offices',
  'Maintained and troubleshooted Windows workstations and network connectivity',
  'Handled user requests, documented issues, and followed up on resolution',
  'Worked within the office''s database and reporting systems using MySQL'
]
WHERE title = 'IT Support Intern';

UPDATE public.experiences
SET responsibilities = ARRAY[
  'Built and iterated on AI-assisted coding projects with LLM tools and APIs',
  'Practised prompt design and evaluation to get reliable, repeatable output from models',
  'Wired third-party API integrations into a working application'
]
WHERE title = 'AI Coding Workshop';

-- The certificate that attests the internship. Its issue date was a month after
-- the internship ended, which had it certifying a placement three months in the
-- past.
UPDATE public.certificates
SET issue_date = DATE '2025-12-01'
WHERE title = 'Internship Certificate';

-- The tracking parameter on a Google Drive share link is not part of the
-- document's identity and does not belong in a URL printed on paper.
UPDATE public.certificates
SET credential_url = 'https://drive.google.com/file/d/1AHGpqTpjyLPxhCWVZ0XP2nT2qH42GsTA/view'
WHERE title = 'Internship Certificate';
