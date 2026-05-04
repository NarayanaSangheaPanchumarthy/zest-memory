import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface AuditLog {
  id: string;
  event_type: string;
  actor_id: string | null;
  target_user_id: string | null;
  table_name: string | null;
  record_id: string | null;
  action: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const EVENT_TYPES = ["all", "role_change", "access_denied", "sensitive_read", "auth_event", "admin_action"] as const;

const badgeVariant = (t: string): "default" | "secondary" | "destructive" | "outline" => {
  if (t === "access_denied") return "destructive";
  if (t === "role_change") return "default";
  if (t === "sensitive_read") return "secondary";
  return "outline";
};

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filter !== "all") query = query.eq("event_type", filter);
    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load audit logs");
    } else {
      setLogs((data ?? []) as AuditLog[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-serif text-foreground">Security Audit Logs</h1>
              <p className="text-sm text-muted-foreground">
                Role changes, access denials, and sensitive record reads.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={load} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{loading ? "Loading…" : `${logs.length} event(s)`}</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 && !loading ? (
              <p className="text-muted-foreground text-sm">No events recorded.</p>
            ) : (
              <ul className="divide-y divide-border">
                {logs.map((log) => (
                  <li key={log.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={badgeVariant(log.event_type)}>{log.event_type}</Badge>
                        {log.table_name && (
                          <span className="text-xs text-muted-foreground">{log.table_name}</span>
                        )}
                        {log.action && (
                          <span className="text-xs font-mono text-muted-foreground">{log.action}</span>
                        )}
                      </div>
                      <div className="text-sm text-foreground break-all">
                        actor: <span className="font-mono text-xs">{log.actor_id ?? "—"}</span>
                        {log.target_user_id && (
                          <> · target: <span className="font-mono text-xs">{log.target_user_id}</span></>
                        )}
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AuditLogs;
