import { useState } from "react";
import { Sun, Sunset, Moon, CloudMoon, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const presetRoutines = [
  {
    period: "Morning", icon: Sun, color: "text-amber-500",
    tasks: [
      { title: "Wake up & stretch", category: "exercise", time: "06:30" },
      { title: "Take morning medications", category: "medication", time: "07:00" },
      { title: "Drink a glass of water", category: "general", time: "07:00" },
      { title: "Eat breakfast", category: "meal", time: "07:30" },
      { title: "Morning hygiene routine", category: "hygiene", time: "08:00" },
    ],
  },
  {
    period: "Afternoon", icon: Sunset, color: "text-orange-500",
    tasks: [
      { title: "Drink water before lunch", category: "general", time: "11:30" },
      { title: "Eat lunch", category: "meal", time: "12:00" },
      { title: "Take afternoon medications", category: "medication", time: "12:30" },
      { title: "Rest or short nap", category: "rest", time: "13:00" },
      { title: "Drink water / herbal tea", category: "general", time: "14:30" },
    ],
  },
  {
    period: "Evening", icon: Moon, color: "text-indigo-500",
    tasks: [
      { title: "Eat dinner", category: "meal", time: "18:00" },
      { title: "Take evening medications", category: "medication", time: "18:30" },
      { title: "Evening walk", category: "exercise", time: "19:00" },
      { title: "Brain exercise", category: "cognitive", time: "20:30" },
    ],
  },
  {
    period: "Night", icon: CloudMoon, color: "text-purple-500",
    tasks: [
      { title: "Take night medications", category: "medication", time: "21:00" },
      { title: "Evening hygiene", category: "hygiene", time: "21:15" },
      { title: "Wind down & sleep", category: "rest", time: "22:00" },
    ],
  },
];

interface Props {
  patients: { patient_id: string; full_name: string }[];
}

const PatientRoutineManager = ({ patients }: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [customTitle, setCustomTitle] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [customCategory, setCustomCategory] = useState("general");
  const [customTasks, setCustomTasks] = useState<{ title: string; time: string; category: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleAll = (period: string, checked: boolean) => {
    const updates: Record<string, boolean> = {};
    presetRoutines.find((r) => r.period === period)?.tasks.forEach((t) => {
      updates[`${period}-${t.title}`] = checked;
    });
    setSelected((prev) => ({ ...prev, ...updates }));
  };

  const addCustomTask = () => {
    if (!customTitle.trim()) return;
    setCustomTasks((p) => [...p, { title: customTitle.trim(), time: customTime || "09:00", category: customCategory }]);
    setCustomTitle("");
    setCustomTime("");
  };

  const assignRoutine = async () => {
    if (!selectedPatient) { toast.error("Select a patient"); return; }
    const today = new Date().toISOString().split("T")[0];

    const allPreset = presetRoutines.flatMap((r) =>
      r.tasks.filter((t) => selected[`${r.period}-${t.title}`]).map((t) => ({
        patient_id: selectedPatient, title: t.title, category: t.category,
        scheduled_time: t.time, task_date: today,
      }))
    );
    const allCustom = customTasks.map((t) => ({
      patient_id: selectedPatient, title: t.title, category: t.category,
      scheduled_time: t.time, task_date: today,
    }));

    const all = [...allPreset, ...allCustom];
    if (all.length === 0) { toast.error("Select at least one task"); return; }

    setLoading(true);
    const { error } = await supabase.from("daily_tasks").insert(all);
    setLoading(false);

    if (error) { toast.error(error.message); return; }

    // Send notification to patient
    await supabase.from("notifications").insert({
      user_id: selectedPatient,
      title: "Daily Routine Assigned",
      message: `Your clinician assigned ${all.length} routine tasks for today including hydration, meals, and medication reminders.`,
      type: "info",
      related_patient_id: selectedPatient,
    });

    toast.success(`${all.length} tasks assigned to patient!`);
    setSelected({});
    setCustomTasks([]);
    setOpen(false);
  };

  const selectedCount = Object.values(selected).filter(Boolean).length + customTasks.length;
  const patientName = patients.find((p) => p.patient_id === selectedPatient)?.full_name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Sun className="w-4 h-4" /> Assign Routine
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Daily Routine</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Assign morning, afternoon, evening & night routines to a patient with hydration, meal, and medication reminders.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Patient selector */}
          <div className="space-y-2">
            <Label>Patient</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.patient_id} value={p.patient_id}>{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preset routines */}
          {presetRoutines.map((routine) => {
            const Icon = routine.icon;
            const keys = routine.tasks.map((t) => `${routine.period}-${t.title}`);
            const allChecked = keys.every((k) => selected[k]);

            return (
              <Card key={routine.period} className="shadow-sm">
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${routine.color}`} />
                      {routine.period}
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleAll(routine.period, !allChecked)}>
                      {allChecked ? "Deselect" : "Select all"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-3 space-y-1">
                  {routine.tasks.map((task) => {
                    const key = `${routine.period}-${task.title}`;
                    return (
                      <label key={key} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm">
                        <Checkbox checked={!!selected[key]} onCheckedChange={(v) => setSelected((p) => ({ ...p, [key]: !!v }))} />
                        <span className="flex-1">{task.title}</span>
                        <Badge variant="secondary" className="text-xs">{task.time}</Badge>
                      </label>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}

          {/* Custom task */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Custom Task
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-2">
              <div className="flex gap-2">
                <Input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="Task name" className="flex-1" />
                <Input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} className="w-28" />
              </div>
              <div className="flex gap-2">
                <Select value={customCategory} onValueChange={setCustomCategory}>
                  <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">📋 General</SelectItem>
                    <SelectItem value="medication">💊 Medication</SelectItem>
                    <SelectItem value="meal">🍽️ Meal</SelectItem>
                    <SelectItem value="exercise">🏃 Exercise</SelectItem>
                    <SelectItem value="hygiene">🧼 Hygiene</SelectItem>
                    <SelectItem value="cognitive">🧠 Cognitive</SelectItem>
                    <SelectItem value="rest">😴 Rest</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={addCustomTask} disabled={!customTitle.trim()}>Add</Button>
              </div>
              {customTasks.length > 0 && (
                <div className="space-y-1 pt-1">
                  {customTasks.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm p-1.5 bg-muted/50 rounded">
                      <span className="flex-1">{t.title}</span>
                      <Badge variant="secondary" className="text-xs">{t.time}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            {selectedCount} tasks {patientName ? `→ ${patientName}` : ""}
          </span>
          <Button onClick={assignRoutine} disabled={selectedCount === 0 || !selectedPatient || loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Assigning...</> : `Assign ${selectedCount} Tasks`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientRoutineManager;
