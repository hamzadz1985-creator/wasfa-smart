-- Fix 1: Add UPDATE policy for favorite_medications table
CREATE POLICY "Users can update favorites in their tenant" 
ON public.favorite_medications 
FOR UPDATE 
USING (tenant_id = get_user_tenant_id(auth.uid()) AND created_by = auth.uid());

-- Fix 2: Make clinic-assets bucket private and update storage policies
-- First, update the bucket to be private
UPDATE storage.buckets SET public = false WHERE id = 'clinic-assets';

-- Drop the public access policy if it exists
DROP POLICY IF EXISTS "Public can view clinic assets" ON storage.objects;

-- Add policy for authenticated users to view their tenant's assets only
CREATE POLICY "Authenticated users can view their tenant assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'clinic-assets' AND
  (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

-- Add policy for authenticated users to upload to their tenant folder
DROP POLICY IF EXISTS "Users can upload their tenant assets" ON storage.objects;
CREATE POLICY "Users can upload their tenant assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clinic-assets' AND
  (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

-- Add policy for authenticated users to update their tenant's assets
DROP POLICY IF EXISTS "Users can update their tenant assets" ON storage.objects;
CREATE POLICY "Users can update their tenant assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'clinic-assets' AND
  (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

-- Add policy for authenticated users to delete their tenant's assets
DROP POLICY IF EXISTS "Users can delete their tenant assets" ON storage.objects;
CREATE POLICY "Users can delete their tenant assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'clinic-assets' AND
  (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);