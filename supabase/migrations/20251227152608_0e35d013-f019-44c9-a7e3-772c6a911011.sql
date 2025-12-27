-- Create storage bucket for clinic assets (logos, signatures)
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-assets', 'clinic-assets', true);

-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clinic-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'clinic-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'clinic-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to clinic assets
CREATE POLICY "Public can view clinic assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'clinic-assets');