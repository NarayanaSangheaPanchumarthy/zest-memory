-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert patient role only" ON public.user_roles;

-- Recreate strict policy: users can only self-assign the 'patient' role
CREATE POLICY "Users can insert patient role only"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'patient'::app_role
);

-- Allow clinicians to assign any role to any user
DROP POLICY IF EXISTS "Clinicians can assign roles" ON public.user_roles;
CREATE POLICY "Clinicians can assign roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'clinician'::app_role));