
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type TEXT,
  _table_name TEXT,
  _record_id TEXT,
  _target_user_id UUID,
  _details JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
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
