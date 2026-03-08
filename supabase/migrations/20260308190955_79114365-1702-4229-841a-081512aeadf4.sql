-- Allow caregivers/clinicians to view profiles of their assigned patients
CREATE POLICY "Assigned users can view patient profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_assignments pa
    WHERE pa.assigned_user_id = auth.uid()
    AND pa.patient_id = profiles.user_id
  )
);

-- Allow clinicians to view all profiles (needed for patient assignment)
CREATE POLICY "Clinicians can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'clinician'::app_role));