import { useState, useEffect } from "react";
import { ClipboardList, Check, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CareTask {
  id: string;
  patient_id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  created_at: string;
}

const CareTaskManager = ({ userId, patientNames }: { userId: string; patientNames: Record<string, string> }) => {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    const { data } = await supabase
      .from("care_tasks")
      .select("*")
      .eq("assigned_to", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    setTasks((data as CareTask[]) || []);
  };

  const completeTask = async (id: string) => {
    await supabase.from("care_tasks").update({
      status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", id);
    toast.success("Task completed! ✅");
    loadTasks();
  };

  const filtered = tasks.filter(t => {
    if (tab === "pending") return t.status === "pending" || t.status === "in_progress";
    return t.status === "completed";
  });

  const priorityColor = (p: string) => {
    if (p === "high") return "bg-coral-light text-coral";
    if (p === "urgent") return "bg-destructive/10 text-destructive";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-title">
          <ClipboardList className="w-5 h-5 text-primary" />
          Care Tasks
          {tasks.filter(t => t.status === "pending").length > 0 && (
            <Badge className="bg-primary/10 text-primary ml-2">
              {tasks.filter(t => t.status === "pending").length} pending
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-3">
            <TabsTrigger value="pending">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="space-y-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {tab === "pending" ? "No active tasks — great job! 🎉" : "No completed tasks yet"}
              </p>
            ) : (
              filtered.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-medium text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </p>
                      <Badge className={`text-xs ${priorityColor(task.priority)}`}>{task.priority}</Badge>
                    </div>
                    {task.description && <p className="text-xs text-muted-foreground mb-1">{task.description}</p>}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Patient: {patientNames[task.patient_id] || "Unknown"}</span>
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.status !== "completed" && (
                    <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => completeTask(task.id)}>
                      <Check className="w-3 h-3" /> Done
                    </Button>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CareTaskManager;
