
-- Harden log_security_event: stricter validation, length limits, locked search_path, SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type text,
  _table_name text,
  _record_id text,
  _target_user_id uuid,
  _details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _event_type IS NULL OR _event_type NOT IN ('access_denied','sensitive_read','auth_event') THEN
    RAISE EXCEPTION 'Invalid event type';
  END IF;

  IF _table_name IS NOT NULL AND length(_table_name) > 128 THEN
    RAISE EXCEPTION 'table_name too long';
  END IF;

  IF _record_id IS NOT NULL AND length(_record_id) > 256 THEN
    RAISE EXCEPTION 'record_id too long';
  END IF;

  IF _details IS NOT NULL AND length(_details::text) > 4096 THEN
    RAISE EXCEPTION 'details payload too large';
  END IF;

  INSERT INTO public.audit_logs (event_type, actor_id, target_user_id, table_name, record_id, action, details)
  VALUES (_event_type, auth.uid(), _target_user_id, _table_name, _record_id, _event_type, COALESCE(_details, '{}'::jsonb));
END;
$function$;

-- Lock execute permissions for log_security_event
REVOKE ALL ON FUNCTION public.log_security_event(text, text, text, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_security_event(text, text, text, uuid, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, text, text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, text, text, uuid, jsonb) TO service_role;

-- Lock execute permissions for the audit trigger function (trigger-only; never callable directly by clients)
REVOKE ALL ON FUNCTION public.audit_user_roles_changes() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.audit_user_roles_changes() FROM anon;
REVOKE ALL ON FUNCTION public.audit_user_roles_changes() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.audit_user_roles_changes() TO service_role;
