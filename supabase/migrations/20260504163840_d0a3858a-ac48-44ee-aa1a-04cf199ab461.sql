
-- Audit log table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('role_change','access_denied','sensitive_read','auth_event','admin_action')),
  actor_id UUID,
  target_user_id UUID,
  table_name TEXT,
  record_id TEXT,
  action TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs (event_type);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs (actor_id);
CREATE INDEX idx_audit_logs_target ON public.audit_logs (target_user_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only clinicians may read audit logs
CREATE POLICY "Clinicians can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'clinician'::app_role));

-- Authenticated users may insert log entries only as themselves (or anonymous denial events with null actor)
CREATE POLICY "Users can insert own audit events"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = auth.uid()
    AND event_type IN ('access_denied','sensitive_read','auth_event')
  );

-- Trigger function: record role changes
CREATE OR REPLACE FUNCTION public.audit_user_roles_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (event_type, actor_id, target_user_id, table_name, record_id, action, details)
    VALUES ('role_change', auth.uid(), NEW.user_id, 'user_roles', NEW.id::text, 'INSERT',
            jsonb_build_object('role', NEW.role));
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (event_type, actor_id, target_user_id, table_name, record_id, action, details)
    VALUES ('role_change', auth.uid(), NEW.user_id, 'user_roles', NEW.id::text, 'UPDATE',
            jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (event_type, actor_id, target_user_id, table_name, record_id, action, details)
    VALUES ('role_change', auth.uid(), OLD.user_id, 'user_roles', OLD.id::text, 'DELETE',
            jsonb_build_object('role', OLD.role));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_user_roles_changes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.audit_user_roles_changes() TO service_role;

CREATE TRIGGER trg_audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_user_roles_changes();

-- RPC for app to record sensitive reads / access denials
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type TEXT,
  _table_name TEXT,
  _record_id TEXT,
  _target_user_id UUID,
  _details JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _event_type NOT IN ('access_denied','sensitive_read','auth_event') THEN
    RAISE EXCEPTION 'Invalid event type';
  END IF;
  INSERT INTO public.audit_logs (event_type, actor_id, target_user_id, table_name, record_id, action, details)
  VALUES (_event_type, auth.uid(), _target_user_id, _table_name, _record_id, _event_type, COALESCE(_details, '{}'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.log_security_event(TEXT, TEXT, TEXT, UUID, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_security_event(TEXT, TEXT, TEXT, UUID, JSONB) TO authenticated;
