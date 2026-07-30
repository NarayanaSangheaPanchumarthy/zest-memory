import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Brain, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type OAuthClient = { name?: string | null };
type AuthorizationDetails = {
  client?: OAuthClient | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

const oauthApi = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error: detailsError } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const api = oauthApi();
    const { data, error: decideError } = approve
      ? await api.approveAuthorization(authorizationId)
      : await api.denyAuthorization(authorizationId);
    if (decideError) {
      setBusy(false);
      setError(decideError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  const clientName = details?.client?.name ?? "this application";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-calm flex items-center justify-center mx-auto">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-serif text-title">Authorize access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <p className="text-sm text-destructive text-center">
              Could not complete this authorization request: {error}
            </p>
          ) : !details ? (
            <p className="text-sm text-muted-foreground text-center">Loading…</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-medium text-foreground">{clientName}</span> is asking to connect to your
                Memory Compass account. It will be able to read and act on the care data you can access.
              </p>
              <div className="flex items-start gap-2 rounded-xl bg-muted/50 p-3">
                <ShieldCheck className="w-4 h-4 text-sage mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Access uses your own permissions — nothing outside your account is shared. You can revoke it at
                  any time.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
                  Deny
                </Button>
                <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                  Approve
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default OAuthConsent;
