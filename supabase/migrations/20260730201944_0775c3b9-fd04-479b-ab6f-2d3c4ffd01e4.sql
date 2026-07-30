-- 1) Clinicians may only attach documents to assigned patients
DROP POLICY IF EXISTS "Clinicians can upload documents" ON public.patient_documents;
CREATE POLICY "Clinicians can upload documents for assigned patients"
  ON public.patient_documents FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'clinician')
    AND public.is_assigned_to(auth.uid(), patient_id)
  );

-- 2) Restrict storage uploads to a safe allow-list of file types/extensions
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'patient-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN ('pdf','jpg','jpeg','png','gif','doc','docx')
    AND COALESCE(metadata->>'mimetype', '') IN (
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  );

-- 3) Add missing UPDATE/DELETE lifecycle controls on document files
DROP POLICY IF EXISTS "Owners can update own documents" ON storage.objects;
CREATE POLICY "Owners can update own documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'patient-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'patient-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND lower(storage.extension(name)) IN ('pdf','jpg','jpeg','png','gif','doc','docx')
    AND COALESCE(metadata->>'mimetype', '') IN (
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  );

DROP POLICY IF EXISTS "Owners can delete own documents" ON storage.objects;
CREATE POLICY "Owners can delete own documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'patient-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4) Remove self-assignment of roles entirely; trigger assigns 'patient' automatically
DROP POLICY IF EXISTS "Users can insert patient role only" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;

-- 5) Realtime: minimise replicated identity; row delivery stays governed by RLS
ALTER TABLE public.notifications REPLICA IDENTITY DEFAULT;
ALTER TABLE public.emergency_alerts REPLICA IDENTITY DEFAULT;
ALTER TABLE public.patient_locations REPLICA IDENTITY DEFAULT;