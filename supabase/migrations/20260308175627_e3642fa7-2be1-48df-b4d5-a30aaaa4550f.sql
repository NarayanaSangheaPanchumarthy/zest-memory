
-- 1. Create patient-caregiver/clinician assignments table
CREATE TABLE public.patient_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  assigned_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, assigned_user_id)
);

ALTER TABLE public.patient_assignments ENABLE ROW LEVEL SECURITY;

-- Patients can see their own assignments
CREATE POLICY "Patients can view own assignments" ON public.patient_assignments
  FOR SELECT USING (auth.uid() = patient_id);

-- Assigned users can view their assignments
CREATE POLICY "Assigned users can view own assignments" ON public.patient_assignments
  FOR SELECT USING (auth.uid() = assigned_user_id);

-- Only clinicians can create assignments
CREATE POLICY "Clinicians can manage assignments" ON public.patient_assignments
  FOR ALL USING (has_role(auth.uid(), 'clinician')) WITH CHECK (has_role(auth.uid(), 'clinician'));

-- 2. Helper function: check if user is assigned to a patient
CREATE OR REPLACE FUNCTION public.is_assigned_to(_user_id uuid, _patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patient_assignments
    WHERE assigned_user_id = _user_id AND patient_id = _patient_id
  )
$$;

-- 3. Restrict user_roles INSERT to patient only
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
CREATE POLICY "Users can insert patient role only" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id AND role = 'patient');

-- 4. Update caregiver SELECT policies to use assignment scoping
-- patient_vitals
DROP POLICY IF EXISTS "Caregivers can view patient vitals" ON public.patient_vitals;
CREATE POLICY "Caregivers can view assigned patient vitals" ON public.patient_vitals
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

-- patient_locations
DROP POLICY IF EXISTS "Caregivers can view locations" ON public.patient_locations;
CREATE POLICY "Caregivers can view assigned locations" ON public.patient_locations
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

-- patient_documents
DROP POLICY IF EXISTS "Caregivers can view documents" ON public.patient_documents;
CREATE POLICY "Caregivers can view assigned documents" ON public.patient_documents
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

-- emergency_alerts
DROP POLICY IF EXISTS "Caregivers can view alerts" ON public.emergency_alerts;
CREATE POLICY "Caregivers can view assigned alerts" ON public.emergency_alerts
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

DROP POLICY IF EXISTS "Caregivers can resolve alerts" ON public.emergency_alerts;
CREATE POLICY "Caregivers can resolve assigned alerts" ON public.emergency_alerts
  FOR UPDATE USING (is_assigned_to(auth.uid(), patient_id));

-- geofence_zones
DROP POLICY IF EXISTS "Caregivers can view zones" ON public.geofence_zones;
CREATE POLICY "Caregivers can view assigned zones" ON public.geofence_zones
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

-- game_sessions
DROP POLICY IF EXISTS "Caregivers can view sessions" ON public.game_sessions;
CREATE POLICY "Caregivers can view assigned sessions" ON public.game_sessions
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

-- 5. Update clinician policies similarly
DROP POLICY IF EXISTS "Clinicians can view all vitals" ON public.patient_vitals;
CREATE POLICY "Clinicians can view assigned vitals" ON public.patient_vitals
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

DROP POLICY IF EXISTS "Clinicians can view locations" ON public.patient_locations;
CREATE POLICY "Clinicians can view assigned locations" ON public.patient_locations
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

DROP POLICY IF EXISTS "Clinicians can view all documents" ON public.patient_documents;
CREATE POLICY "Clinicians can view assigned documents" ON public.patient_documents
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

DROP POLICY IF EXISTS "Clinicians can view all alerts" ON public.emergency_alerts;
CREATE POLICY "Clinicians can view assigned alerts" ON public.emergency_alerts
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

DROP POLICY IF EXISTS "Clinicians can resolve alerts" ON public.emergency_alerts;
CREATE POLICY "Clinicians can resolve assigned alerts" ON public.emergency_alerts
  FOR UPDATE USING (is_assigned_to(auth.uid(), patient_id));

DROP POLICY IF EXISTS "Clinicians can view zones" ON public.geofence_zones;
CREATE POLICY "Clinicians can view assigned zones" ON public.geofence_zones
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

DROP POLICY IF EXISTS "Clinicians can view sessions" ON public.game_sessions;
CREATE POLICY "Clinicians can view assigned sessions" ON public.game_sessions
  FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));
