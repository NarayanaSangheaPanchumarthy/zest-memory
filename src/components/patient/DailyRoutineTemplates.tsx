import { useState } from "react";
import { Sun, Sunset, Moon, CloudMoon, Droplets, UtensilsCrossed, Pill, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoutineTask {
  title: string;
  category: string;
  scheduled_time: string;
}

const routineTemplates: { period: string; icon: typeof Sun; color: string; tasks: RoutineTask[] }[] = [
  {
    period: "Morning",
    icon: Sun,
    color: "text-amber-500",
    tasks: [
      { title: "Wake up & stretch", category: "exercise", scheduled_time: "06:30" },
      { title: "Take morning medications", category: "medication", scheduled_time: "07:00" },
      { title: "Drink a glass of water", category: "general", scheduled_time: "07:00" },
      { title: "Eat breakfast", category: "meal", scheduled_time: "07:30" },
      { title: "Morning hygiene routine", category: "hygiene", scheduled_time: "08:00" },
      { title: "Drink water or juice", category: "general", scheduled_time: "09:30" },
      { title: "Morning walk / light exercise", category: "exercise", scheduled_time: "10:00" },
    ],
  },
  {
    period: "Afternoon",
    icon: Sunset,
    color: "text-orange-500",
    tasks: [
      { title: "Drink water before lunch", category: "general", scheduled_time: "11:30" },
      { title: "Eat lunch", category: "meal", scheduled_time: "12:00" },
      { title: "Take afternoon medications", category: "medication", scheduled_time: "12:30" },
      { title: "Rest or short nap", category: "rest", scheduled_time: "13:00" },
      { title: "Drink water / herbal tea", category: "general", scheduled_time: "14:30" },
      { title: "Social activity or hobby", category: "social", scheduled_time: "15:00" },
      { title: "Light snack with fluids", category: "meal", scheduled_time: "16:00" },
    ],
  },
  {
    period: "Evening",
    icon: Moon,
    color: "text-indigo-500",
    tasks: [
      { title: "Drink water before dinner", category: "general", scheduled_time: "17:30" },
      { title: "Eat dinner", category: "meal", scheduled_time: "18:00" },
      { title: "Take evening medications", category: "medication", scheduled_time: "18:30" },
      { title: "Evening walk or gentle activity", category: "exercise", scheduled_time: "19:00" },
      { title: "Drink warm water or tea", category: "general", scheduled_time: "20:00" },
      { title: "Brain exercise / memory game", category: "cognitive", scheduled_time: "20:30" },
    ],
  },
  {
    period: "Night",
    icon: CloudMoon,
    color: "text-purple-500",
    tasks: [
      { title: "Take night medications", category: "medication", scheduled_time: "21:00" },
      { title: "Evening hygiene routine", category: "hygiene", scheduled_time: "21:15" },
      { title: "Sip water before bed", category: "general", scheduled_time: "21:30" },
      { title: "Wind down — read or relax", category: "rest", scheduled_time: "21:30" },
      { title: "Go to sleep", category: "rest", scheduled_time: "22:00" },
    ],
  },
];

const DailyRoutineTemplates = ({ userId, onTasksAdded }: { userId: string; onTasksAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const allTasks = routineTemplates.flatMap((t) =>
    t.tasks.map((task) => ({ ...task, key: `${t.period}-${task.title}` }))
  );

  const toggleAll = (period: string, checked: boolean) => {
    const updates: Record<string, boolean> = {};
    routineTemplates
      .find((t) => t.period === period)
      ?.tasks.forEach((task) => {
        updates[`${period}-${task.title}`] = checked;
      });
    setSelected((prev) => ({ ...prev, ...updates }));
  };

  const addSelected = async () => {
    const today = new Date().toISOString().split("T")[0];
    const tasksToAdd = allTasks.filter((t) => selected[t.key]);
    if (tasksToAdd.length === 0) {
      toast.error("Please select at least one task");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("daily_tasks").insert(
      tasksToAdd.map((t) => ({
        patient_id: userId,
        title: t.title,
        category: t.category,
        scheduled_time: t.scheduled_time,
        task_date: today,
      }))
    );
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${tasksToAdd.length} routine tasks added!`);
    setSelected({});
    setOpen(false);
    onTasksAdded();
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Sparkles className="w-4 h-4" /> Routine Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Daily Routine Templates
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select tasks to add to today's routine — including hydration, meals, and medicine reminders.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {routineTemplates.map((template) => {
            const Icon = template.icon;
            const periodTasks = template.tasks.map((t) => `${template.period}-${t.title}`);
            const allChecked = periodTasks.every((k) => selected[k]);

            return (
              <Card key={template.period} className="shadow-sm">
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${template.color}`} />
                      {template.period}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => toggleAll(template.period, !allChecked)}
                    >
                      {allChecked ? "Deselect all" : "Select all"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-1.5">
                  {template.tasks.map((task) => {
                    const key = `${template.period}-${task.title}`;
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 cursor-pointer text-sm"
                      >
                        <Checkbox
                          checked={!!selected[key]}
                          onCheckedChange={(v) => setSelected((p) => ({ ...p, [key]: !!v }))}
                        />
                        <span className="flex-1">{task.title}</span>
                        <Badge variant="secondary" className="text-xs font-normal">
                          {task.scheduled_time}
                        </Badge>
                      </label>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">{selectedCount} tasks selected</span>
          <Button onClick={addSelected} disabled={selectedCount === 0 || loading}>
            {loading ? "Adding..." : `Add ${selectedCount} Tasks`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyRoutineTemplates;
