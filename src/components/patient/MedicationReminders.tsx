import { useState, useEffect } from "react";
import { Pill, Plus, Check, Clock, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string;
  time_of_day: string[];
  is_active: boolean;
  notes: string | null;
}

const MedicationReminders = ({ userId }: { userId: string }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [timeOfDay, setTimeOfDay] = useState("morning");

  useEffect(() => {
    loadMedications();
  }, [userId]);

  const loadMedications = async () => {
    const { data } = await supabase
      .from("medications")
      .select("*")
      .eq("patient_id", userId)
      .eq("is_active", true)
      .order("created_at");
    setMedications((data as Medication[]) || []);
  };

  const addMedication = async () => {
    if (!name.trim()) { toast.error("Medication name required"); return; }
    const { error } = await supabase.from("medications").insert({
      patient_id: userId,
      name: name.trim(),
      dosage: dosage.trim() || null,
      frequency,
      time_of_day: [timeOfDay],
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Medication added!");
    setName(""); setDosage(""); setOpen(false);
    loadMedications();
  };

  const removeMedication = async (id: string) => {
    await supabase.from("medications").update({ is_active: false }).eq("id", id);
    toast.success("Medication removed");
    loadMedications();
  };

  const timeLabel = (t: string) => {
    const map: Record<string, string> = { morning: "🌅 Morning", afternoon: "☀️ Afternoon", evening: "🌙 Evening", night: "🌑 Night" };
    return map[t] || t;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-title">
            <Pill className="w-5 h-5 text-sage" />
            Medications
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Medication</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Medication Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Donepezil" />
                </div>
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 10mg" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="twice_daily">Twice Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="as_needed">As Needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addMedication} className="w-full">Add Medication</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {medications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No medications added yet</p>
        ) : (
          medications.map((med) => (
            <div key={med.id} className="flex items-center gap-3 p-3 rounded-xl bg-sage-light/50">
              <Pill className="w-4 h-4 text-sage shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{med.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {med.dosage && <span>{med.dosage}</span>}
                  <span>•</span>
                  <span className="capitalize">{med.frequency.replace("_", " ")}</span>
                  {med.time_of_day.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">{timeLabel(t)}</Badge>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeMedication(med.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationReminders;
