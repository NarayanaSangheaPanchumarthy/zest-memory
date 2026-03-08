import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DailyRoutineTemplates from "./DailyRoutineTemplates";

interface DailyTask {
  id: string;
  title: string;
  category: string;
  scheduled_time: string | null;
  is_completed: boolean;
}

const categoryIcons: Record<string, string> = {
  medication: "💊", meal: "🍽️", exercise: "🏃", hygiene: "🧼",
  social: "👥", cognitive: "🧠", rest: "😴", general: "📋",
};

const DailyTaskChecklist = ({ userId }: { userId: string }) => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [time, setTime] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadTasks();
  }, [userId]);

  const loadTasks = async () => {
    const { data } = await supabase
      .from("daily_tasks")
      .select("id, title, category, scheduled_time, is_completed")
      .eq("patient_id", userId)
      .eq("task_date", today)
      .order("scheduled_time", { ascending: true });
    setTasks((data as DailyTask[]) || []);
  };

  const addTask = async () => {
    if (!title.trim()) { toast.error("Task title required"); return; }
    const { error } = await supabase.from("daily_tasks").insert({
      patient_id: userId,
      title: title.trim(),
      category,
      scheduled_time: time || null,
      task_date: today,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Task added!");
    setTitle(""); setOpen(false);
    loadTasks();
  };

  const toggleTask = async (task: DailyTask) => {
    const newCompleted = !task.is_completed;
    await supabase.from("daily_tasks").update({
      is_completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    }).eq("id", task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: newCompleted } : t));
    if (newCompleted) toast.success("Task completed! 🎉");
  };

  const completed = tasks.filter(t => t.is_completed).length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-title">
            <Calendar className="w-5 h-5 text-primary" />
            Today's Routine
          </CardTitle>
          <div className="flex items-center gap-2">
            <DailyRoutineTemplates userId={userId} onTasksAdded={loadTasks} />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Daily Task</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Task</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Morning walk" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryIcons).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v} {k.charAt(0).toUpperCase() + k.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time (optional)</Label>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
                <Button onClick={addTask} className="w-full">Add Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {tasks.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">{completed}/{tasks.length} completed</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks for today. Add your daily routine!</p>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                task.is_completed ? "bg-sage-light/50" : "bg-muted/50 hover:bg-muted"
              }`}
            >
              {task.is_completed ? (
                <CheckCircle2 className="w-5 h-5 text-sage shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <span className="text-lg mr-1">{categoryIcons[task.category] || "📋"}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </p>
                {task.scheduled_time && (
                  <p className="text-xs text-muted-foreground">{task.scheduled_time}</p>
                )}
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default DailyTaskChecklist;
