-- Fix: Allow patients to send notifications to their assigned caregivers/clinicians
DROP POLICY IF EXISTS "Users can notify assigned recipients" ON public.notifications;
CREATE POLICY "Users can notify assigned recipients" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR (
      related_patient_id IS NOT NULL
      AND auth.uid() = related_patient_id
      AND is_assigned_to(user_id, related_patient_id)
    )
    OR (
      related_patient_id IS NOT NULL
      AND is_assigned_to(auth.uid(), related_patient_id)
      AND is_assigned_to(user_id, related_patient_id)
    )
  );