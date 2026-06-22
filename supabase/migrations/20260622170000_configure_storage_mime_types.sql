-- Migration: Configure Storage Bucket MIME Types
-- This updates the 'event-images' bucket to remove MIME type restrictions
-- so that MP3 audio uploads are allowed alongside images.

UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'event-images';
