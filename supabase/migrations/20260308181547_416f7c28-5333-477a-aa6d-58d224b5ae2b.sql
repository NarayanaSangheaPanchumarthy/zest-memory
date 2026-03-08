
-- Fix 1: Scope notifications INSERT to self or assigned patients
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Users can notify self or assigned patients" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR is_assigned_to(auth.uid(), related_patient_id)
  );

-- Fix 2: Add validation trigger for patient_vitals (using trigger instead of CHECK for restore compatibility)
CREATE OR REPLACE FUNCTION public.validate_vitals()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.temperature IS NOT NULL AND (NEW.temperature < 30 OR NEW.temperature > 45) THEN
    RAISE EXCEPTION 'Temperature must be between 30 and 45°C';
  END IF;
  IF NEW.blood_pressure_systolic IS NOT NULL AND (NEW.blood_pressure_systolic < 50 OR NEW.blood_pressure_systolic > 300) THEN
    RAISE EXCEPTION 'Systolic BP must be between 50 and 300 mmHg';
  END IF;
  IF NEW.blood_pressure_diastolic IS NOT NULL AND (NEW.blood_pressure_diastolic < 30 OR NEW.blood_pressure_diastolic > 200) THEN
    RAISE EXCEPTION 'Diastolic BP must be between 30 and 200 mmHg';
  END IF;
  IF NEW.pulse_rate IS NOT NULL AND (NEW.pulse_rate < 20 OR NEW.pulse_rate > 300) THEN
    RAISE EXCEPTION 'Pulse rate must be between 20 and 300 bpm';
  END IF;
  IF NEW.oxygen_saturation IS NOT NULL AND (NEW.oxygen_saturation < 50 OR NEW.oxygen_saturation > 100) THEN
    RAISE EXCEPTION 'O2 saturation must be between 50 and 100%%';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_vitals
  BEFORE INSERT OR UPDATE ON public.patient_vitals
  FOR EACH ROW EXECUTE FUNCTION public.validate_vitals();
