-- Allow clinicians to update profiles of assigned patients
CREATE POLICY "Clinicians can update patient profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'clinician'::app_role))
WITH CHECK (has_role(auth.uid(), 'clinician'::app_role));