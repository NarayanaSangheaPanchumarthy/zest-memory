-- Fix 1: Scope notification INSERT so assignment path also constrains user_id
DROP POLICY IF EXISTS "Users can notify self or assigned patients" ON public.notifications;
CREATE POLICY "Users can notify assigned recipients" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR (
      related_patient_id IS NOT NULL
      AND is_assigned_to(auth.uid(), related_patient_id)
      AND is_assigned_to(user_id, related_patient_id)
    )
  );

-- Fix 2: Tighten storage policies to assignment-scoped access
DROP POLICY IF EXISTS "Clinicians can view all documents" ON storage.objects;

CREATE POLICY "Assigned users can view documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'patient-documents'
    AND public.is_assigned_to(auth.uid(), (storage.foldername(name))[1]::uuid)
  );

CREATE POLICY "Patients can view own documents storage" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'patient-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );