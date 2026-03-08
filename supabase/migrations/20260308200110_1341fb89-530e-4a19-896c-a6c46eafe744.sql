
-- Daily tasks / routines for patients
CREATE TABLE public.daily_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_time TIME,
  category TEXT NOT NULL DEFAULT 'general',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own tasks" ON public.daily_tasks FOR ALL USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Assigned users can view patient tasks" ON public.daily_tasks FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

-- Medications
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  time_of_day TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own medications" ON public.medications FOR ALL USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Assigned users can view patient medications" ON public.medications FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));
CREATE POLICY "Clinicians can manage patient medications" ON public.medications FOR ALL USING (has_role(auth.uid(), 'clinician') AND is_assigned_to(auth.uid(), patient_id)) WITH CHECK (has_role(auth.uid(), 'clinician') AND is_assigned_to(auth.uid(), patient_id));

-- Mood entries
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  mood TEXT NOT NULL,
  notes TEXT,
  energy_level INTEGER,
  symptoms TEXT[] DEFAULT '{}',
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own moods" ON public.mood_entries FOR ALL USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Assigned users can view patient moods" ON public.mood_entries FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));

-- Appointments
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  provider_name TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can create own appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Assigned users can view patient appointments" ON public.appointments FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));
CREATE POLICY "Clinicians can manage patient appointments" ON public.appointments FOR ALL USING (has_role(auth.uid(), 'clinician') AND is_assigned_to(auth.uid(), patient_id)) WITH CHECK (has_role(auth.uid(), 'clinician') AND is_assigned_to(auth.uid(), patient_id));

-- Care tasks (caregiver task management)
CREATE TABLE public.care_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  assigned_to UUID NOT NULL,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assigned caregivers can view own care tasks" ON public.care_tasks FOR SELECT USING (auth.uid() = assigned_to);
CREATE POLICY "Assigned caregivers can update own care tasks" ON public.care_tasks FOR UPDATE USING (auth.uid() = assigned_to);
CREATE POLICY "Clinicians can manage care tasks" ON public.care_tasks FOR ALL USING (has_role(auth.uid(), 'clinician')) WITH CHECK (has_role(auth.uid(), 'clinician'));

-- Communication log
CREATE TABLE public.communication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  author_id UUID NOT NULL,
  message TEXT NOT NULL,
  log_type TEXT NOT NULL DEFAULT 'note',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can create logs" ON public.communication_logs FOR INSERT WITH CHECK (auth.uid() = author_id AND is_assigned_to(auth.uid(), patient_id));
CREATE POLICY "Assigned users can view patient logs" ON public.communication_logs FOR SELECT USING (is_assigned_to(auth.uid(), patient_id));
CREATE POLICY "Patients can view own logs" ON public.communication_logs FOR SELECT USING (auth.uid() = patient_id);
