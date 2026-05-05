import { useEffect, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, RefreshCw, Lock, KeyRound, Mail, UserX, Database } from "lucide-react";
import { toast } from "sonner";

interface SecurityCheck {
  checked_at: string;
  hibp: {
    enabled: boolean;
    probe_status: number;
    probe_error_code: string | null;
    probe_message: string | null;
  };
  auth_settings: {
    disable_signup: boolean | null;
    email_confirmation_required: boolean | null;
    external_anonymous_users_enabled: boolean | null;
    providers: Record<string, boolean>;
  };
}

const yesNo = (v: boolean | null, trueLabel = "Enabled", falseLabel = "Disabled") =>
  v === null ? "Unknown" : v ? trueLabel : falseLabel;

const variantFor = (ok: boolean | null): "default" | "destructive" | "secondary" =>
  ok === null ? "secondary" : ok ? "default" : "destructive";

const AdminSecurity = () => {
  const [data, setData] = useState<SecurityCheck | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: res, error } = await supabase.functions.invoke<SecurityCheck>(
      "check-auth-security",
      { method: "POST" },
    );
    if (error || !res) {
      toast.error("Failed to load security status");
    } else {
      setData(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const hibpOk = data?.hibp.enabled ?? null;
  const emailOk = data?.auth_settings.email_confirmation_required ?? null;
  const anonOk =
    data?.auth_settings.external_anonymous_users_enabled === null
      ? null
      : !data?.auth_settings.external_anonymous_users_enabled;
  const providers = data?.auth_settings.providers ?? {};
  const enabledProviders = Object.entries(providers)
    .filter(([, v]) => v)
    .map(([k]) => k);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-serif text-foreground">Security & Auth Settings</h1>
              <p className="text-sm text-muted-foreground">
                Live verification of authentication hardening.
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={load} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <Card
          className={`mb-6 ${
            hibpOk ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"
          }`}
        >
          <CardContent className="pt-6 flex items-start gap-3">
            {hibpOk ? (
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-destructive mt-0.5" />
            )}
            <div className="text-sm flex-1">
              <p className="font-medium text-foreground">
                {loading
                  ? "Checking HIBP password protection…"
                  : hibpOk
                    ? "HIBP password protection is active (verified live)."
                    : "HIBP password protection is NOT active."}
              </p>
              {data && (
                <p className="text-muted-foreground text-xs mt-1">
                  Probe response: HTTP {data.hibp.probe_status}
                  {data.hibp.probe_error_code ? ` · ${data.hibp.probe_error_code}` : ""}
                  {data.hibp.probe_message ? ` · ${data.hibp.probe_message}` : ""}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              <Row
                icon={ShieldCheck}
                label="Leaked Password Protection (HIBP)"
                description="Live probe with a known breached password."
                variant={variantFor(hibpOk)}
                value={loading ? "…" : yesNo(hibpOk)}
              />
              <Row
                icon={Mail}
                label="Email Confirmation"
                description="New accounts must verify their email before signing in."
                variant={variantFor(emailOk)}
                value={loading ? "…" : yesNo(emailOk, "Required", "Auto-confirmed")}
              />
              <Row
                icon={UserX}
                label="Anonymous Sign-ins"
                description="Anonymous user creation must be disabled."
                variant={variantFor(anonOk)}
                value={loading ? "…" : yesNo(anonOk, "Disabled", "Enabled")}
              />
              <Row
                icon={KeyRound}
                label="Public Sign-up"
                description="Self-service patient sign-up. Higher roles are clinician-assigned."
                variant="secondary"
                value={
                  data?.auth_settings.disable_signup === null
                    ? "Unknown"
                    : data?.auth_settings.disable_signup
                      ? "Closed"
                      : "Open (patient only)"
                }
              />
              <Row
                icon={Lock}
                label="Role Self-Assignment"
                description="RLS prevents users from assigning elevated roles."
                variant="default"
                value="Locked (RLS)"
              />
              <Row
                icon={Database}
                label="Audit Logging"
                description="Role changes and access denials are recorded."
                variant="default"
                value="Active"
              />
            </ul>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-muted-foreground" />
              Enabled Auth Providers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {loading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : enabledProviders.length === 0 ? (
              <p className="text-muted-foreground">Email/password only.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {enabledProviders.map((p) => (
                  <Badge key={p} variant="secondary">{p}</Badge>
                ))}
              </div>
            )}
            {data && (
              <p className="mt-4 text-xs text-muted-foreground">
                Last checked: {new Date(data.checked_at).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

interface RowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  variant: "default" | "destructive" | "secondary";
  value: string;
}

const Row = ({ icon: Icon, label, description, variant, value }: RowProps) => (
  <li className="py-4 flex items-start justify-between gap-4">
    <div className="flex items-start gap-3 min-w-0">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
    <Badge variant={variant} className="whitespace-nowrap">{value}</Badge>
  </li>
);

export default AdminSecurity;
