-- Migration: Add screenshot column to audit_reports
ALTER TABLE audit_reports ADD COLUMN screenshot TEXT;
