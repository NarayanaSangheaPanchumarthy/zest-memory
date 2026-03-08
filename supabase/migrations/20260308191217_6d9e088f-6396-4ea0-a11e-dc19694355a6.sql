-- Allow clinicians to delete assignments (the existing ALL policy covers SELECT/INSERT/UPDATE but DELETE needs explicit mention)
-- The existing "Clinicians can manage assignments" policy uses ALL command which already includes DELETE.
-- However, let's also allow clinicians to view user_roles for assignment management
CREATE POLICY "Clinicians can view all roles"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'clinician'::app_role));