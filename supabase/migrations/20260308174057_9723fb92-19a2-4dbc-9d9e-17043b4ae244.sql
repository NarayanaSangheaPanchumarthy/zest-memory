
CREATE TABLE public.game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  game_type TEXT NOT NULL DEFAULT 'photo_recall',
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'easy',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can insert own sessions" ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can view own sessions" ON public.game_sessions FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Caregivers can view sessions" ON public.game_sessions FOR SELECT USING (has_role(auth.uid(), 'caregiver'));
CREATE POLICY "Clinicians can view sessions" ON public.game_sessions FOR SELECT USING (has_role(auth.uid(), 'clinician'));
