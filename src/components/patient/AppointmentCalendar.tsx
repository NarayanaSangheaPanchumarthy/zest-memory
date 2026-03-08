import { useState, useEffect } from "react";
import { CalendarDays, Plus, MapPin, User, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, isPast, isToday, isTomorrow } from "date-fns";

interface Appointment {
  id: string;
  title: string;
  description: string | null;
  appointment_date: string;
  location: string | null;
  provider_name: string | null;
  status: string;
}

const AppointmentCalendar = ({ userId }: { userId: string }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [provider, setProvider] = useState("");

  useEffect(() => {
    loadAppointments();
  }, [userId]);

  const loadAppointments = async () => {
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", userId)
      .gte("appointment_date", new Date().toISOString().split("T")[0])
      .order("appointment_date")
      .limit(10);
    setAppointments((data as Appointment[]) || []);
  };

  const addAppointment = async () => {
    if (!title.trim() || !date || !time) { toast.error("Title, date, and time required"); return; }
    const { error } = await supabase.from("appointments").insert({
      patient_id: userId,
      created_by: userId,
      title: title.trim(),
      appointment_date: `${date}T${time}:00`,
      location: location.trim() || null,
      provider_name: provider.trim() || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Appointment added!");
    setTitle(""); setDate(""); setTime(""); setLocation(""); setProvider("");
    setOpen(false);
    loadAppointments();
  };

  const getDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    return format(d, "MMM d, yyyy");
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-title">
            <CalendarDays className="w-5 h-5 text-lavender" />
            Upcoming Appointments
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Appointment</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dr. Smith checkup" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location (optional)</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. City Hospital" />
                </div>
                <div className="space-y-2">
                  <Label>Provider (optional)</Label>
                  <Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. Dr. Smith" />
                </div>
                <Button onClick={addAppointment} className="w-full">Add Appointment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments</p>
        ) : (
          appointments.map((apt) => {
            const d = new Date(apt.appointment_date);
            return (
              <div key={apt.id} className={`p-3 rounded-xl border-l-4 ${
                isToday(d) ? "border-l-primary bg-calm-light/50" : "border-l-lavender bg-lavender-light/30"
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{apt.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getDateLabel(apt.appointment_date)} at {format(d, "h:mm a")}
                      </span>
                      {apt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {apt.location}
                        </span>
                      )}
                      {apt.provider_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {apt.provider_name}
                        </span>
                      )}
                    </div>
                  </div>
                  {isToday(d) && <Badge className="bg-primary/10 text-primary text-xs">Today</Badge>}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentCalendar;
