import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Lock, KeyRound, Mail, UserX, Database } from "lucide-react";

type Status = "enabled" | "disabled" | "info";

interface SettingRow {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  status: Status;
  value: string;
}

const settings: SettingRow[] = [
  {
    icon: ShieldCheck,
    label: "Leaked Password Protection (HIBP)",
    description: "Blocks passwords found in known data breaches at signup and password change.",
    status: "enabled",
    value: "Enabled",
  },
  {
    icon: Mail,
    label: "Email Confirmation",
    description: "New accounts must verify their email address before signing in.",
    status: "enabled",
    value: "Required",
  },
  {
    icon: UserX,
    label: "Anonymous Sign-ins",
    description: "Anonymous user creation is disabled — all users must authenticate.",
    status: "enabled",
    value: "Disabled",
  },
  {
    icon: KeyRound,
    label: "Public Sign-up",
    description: "Self-service patient sign-up is open. Caregiver/clinician roles are clinician-assigned only.",
    status: "info",
    value: "Open (patient role only)",
  },
  {
    icon: Lock,
    label: "Role Self-Assignment",
    description: "Database RLS prevents users from assigning themselves elevated roles.",
    status: "enabled",
    value: "Locked",
  },
  {
    icon: Database,
    label: "Audit Logging",
    description: "Role changes and access denials are recorded to audit_logs.",
    status: "enabled",
    value: "Active",
  },
];

const badgeVariant = (s: Status): "default" | "secondary" | "destructive" => {
  if (s === "enabled") return "default";
  if (s === "info") return "secondary";
  return "destructive";
};

const AdminSecurity = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-serif text-foreground">Security & Auth Settings</h1>
            <p className="text-sm text-muted-foreground">
              Current authentication hardening status for this environment.
            </p>
          </div>
        </div>

        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="pt-6 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">HIBP password protection is active.</p>
              <p className="text-muted-foreground">
                Passwords are checked against the Have I Been Pwned database at signup and on password changes.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {settings.map(({ icon: Icon, label, description, status, value }) => (
                <li key={label} className="py-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    </div>
                  </div>
                  <Badge variant={badgeVariant(status)} className="whitespace-nowrap">
                    {value}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-muted-foreground" />
              Operational Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Auth settings are managed in Lovable Cloud. To change them, open Cloud → Users → Auth Settings.
            </p>
            <p>
              Sensitive RPCs (<span className="font-mono text-xs">log_security_event</span>,{" "}
              <span className="font-mono text-xs">audit_user_roles_changes</span>) have execute permissions
              restricted to <span className="font-mono text-xs">authenticated</span> /{" "}
              <span className="font-mono text-xs">service_role</span> only.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminSecurity;
