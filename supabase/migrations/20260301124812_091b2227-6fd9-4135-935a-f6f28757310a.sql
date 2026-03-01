-- Add geofence zones table
CREATE TABLE public.geofence_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  radius_meters integer NOT NULL DEFAULT 200,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.geofence_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own zones" ON public.geofence_zones FOR ALL TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Caregivers can view zones" ON public.geofence_zones FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'caregiver'));
CREATE POLICY "Clinicians can view zones" ON public.geofence_zones FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'clinician'));

-- Add patient location tracking table
CREATE TABLE public.patient_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy double precision,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can insert own location" ON public.patient_locations FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can view own location" ON public.patient_locations FOR SELECT TO authenticated USING (auth.uid() = patient_id);
CREATE POLICY "Caregivers can view locations" ON public.patient_locations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'caregiver'));
CREATE POLICY "Clinicians can view locations" ON public.patient_locations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'clinician'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_locations;