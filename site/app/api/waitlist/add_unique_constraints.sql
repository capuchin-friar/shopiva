-- Run this in Neon (SQL Editor) to prevent duplicate email and WhatsApp number in waitlist.
-- If you get "could not create unique index" due to existing duplicates, remove duplicates first
-- (e.g. keep one row per email/whatsapp_number), then run this again.

-- Prevent duplicate emails
ALTER TABLE waitlist
  ADD CONSTRAINT waitlist_email_unique UNIQUE (email);

-- Prevent duplicate WhatsApp numbers
ALTER TABLE waitlist
  ADD CONSTRAINT waitlist_whatsapp_number_unique UNIQUE (whatsapp_number);
