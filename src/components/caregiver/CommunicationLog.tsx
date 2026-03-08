import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  patient_id: string;
  author_id: string;
  message: string;
  log_type: string;
  created_at: string;
}

const CommunicationLog = ({
  userId,
  patientIds,
  patientNames,
  profileNames,
}: {
  userId: string;
  patientIds: string[];
  patientNames: Record<string, string>;
  profileNames: Record<string, string>;
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [message, setMessage] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(patientIds[0] || "");
  const [logType, setLogType] = useState("note");

  useEffect(() => {
    if (patientIds.length > 0) loadLogs();
  }, [patientIds]);

  const loadLogs = async () => {
    const { data } = await supabase
      .from("communication_logs")
      .select("*")
      .in("patient_id", patientIds)
      .order("created_at", { ascending: false })
      .limit(30);
    setLogs((data as LogEntry[]) || []);
  };

  const addLog = async () => {
    if (!message.trim() || !selectedPatient) { toast.error("Select a patient and write a message"); return; }
    const { error } = await supabase.from("communication_logs").insert({
      patient_id: selectedPatient,
      author_id: userId,
      message: message.trim(),
      log_type: logType,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Note added");
    setMessage("");
    loadLogs();
  };

  const typeColor = (t: string) => {
    if (t === "alert") return "bg-coral-light text-coral";
    if (t === "update") return "bg-calm-light text-calm";
    if (t === "medication") return "bg-sage-light text-sage";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-title">
          <MessageSquare className="w-5 h-5 text-primary" />
          Communication Log
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New entry */}
        <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border">
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Patient" /></SelectTrigger>
              <SelectContent>
                {patientIds.map((id) => (
                  <SelectItem key={id} value={id}>{patientNames[id] || "Unknown"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={logType} onValueChange={setLogType}>
              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="note">📝 Note</SelectItem>
                <SelectItem value="update">📋 Update</SelectItem>
                <SelectItem value="medication">💊 Medication</SelectItem>
                <SelectItem value="alert">⚠️ Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a note about the patient's condition..."
            rows={2}
            className="resize-none"
          />
          <Button size="sm" onClick={addLog} className="gap-1">
            <Send className="w-3 h-3" /> Post Note
          </Button>
        </div>

        {/* Logs */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No communication logs yet</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${typeColor(log.log_type)}`}>{log.log_type}</Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {profileNames[log.author_id] || "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">
                    Re: {patientNames[log.patient_id] || "Unknown"}
                  </span>
                </div>
                <p className="text-sm text-foreground">{log.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationLog;
