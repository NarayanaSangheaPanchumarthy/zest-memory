import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Plus, Send, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Ticket = { id: string; subject: string; message: string; status: string; priority: string; created_at: string };

const statusBadge: Record<string, string> = {
  open: "bg-amber-light text-amber",
  in_progress: "bg-calm-light text-calm",
  resolved: "bg-sage-light text-sage",
};

const HelpDesk = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(false);

  const fetchTickets = async () => {
    if (!user) return;
    const { data } = await supabase.from("help_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setTickets(data);
  };

  useEffect(() => { fetchTickets(); }, [user]);

  const submit = async () => {
    if (!user || !subject.trim() || !message.trim()) { toast.error("Fill in all fields"); return; }
    setLoading(true);
    const { error } = await supabase.from("help_tickets").insert({
      user_id: user.id, subject: subject.trim(), message: message.trim(), priority,
    });
    setLoading(false);
    if (error) toast.error("Failed to submit ticket");
    else {
      toast.success("Help ticket submitted!");
      setShowForm(false); setSubject(""); setMessage(""); setPriority("normal");
      fetchTickets();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-foreground">Help Desk</h1>
            <p className="text-muted-foreground">Get support from our care team</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="hero" className="gap-2">
            <Plus className="w-4 h-4" /> New Ticket
          </Button>
        </motion.div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-title">Submit a Support Ticket</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={4} maxLength={2000} />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={submit} disabled={loading} className="w-full" variant="hero">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="space-y-3">
          {tickets.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{t.subject}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.message}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(t.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={statusBadge[t.status] || ""}>{t.status.replace("_", " ")}</Badge>
                      <Badge variant="secondary" className="text-xs">{t.priority}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {tickets.length === 0 && !showForm && (
            <div className="text-center py-16 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No support tickets yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HelpDesk;
