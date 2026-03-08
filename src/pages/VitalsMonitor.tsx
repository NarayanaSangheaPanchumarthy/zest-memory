import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Thermometer, Heart, Activity, Droplets, Plus, AlertTriangle,
  Smartphone, Watch, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const vitalsSchema = z.object({
  temperature: z.number().min(30, "Temp must be ≥30°C").max(45, "Temp must be ≤45°C").nullable(),
  blood_pressure_systolic: z.number().min(50, "Systolic BP must be ≥50").max(300, "Systolic BP must be ≤300").nullable(),
  blood_pressure_diastolic: z.number().min(30, "Diastolic BP must be ≥30").max(200, "Diastolic BP must be ≤200").nullable(),
  pulse_rate: z.number().min(20, "Pulse must be ≥20").max(300, "Pulse must be ≤300").nullable(),
  oxygen_saturation: z.number().min(50, "O₂ must be ≥50%").max(100, "O₂ must be ≤100%").nullable(),
});

type Vital = {
  id: string;
  temperature: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_rate: number | null;
  oxygen_saturation: number | null;
  source: string | null;
  recorded_at: string;
};

const isDanger = (v: Vital) => {
  if (v.temperature && (v.temperature > 38.5 || v.temperature < 35)) return true;
  if (v.blood_pressure_systolic && (v.blood_pressure_systolic > 180 || v.blood_pressure_systolic < 80)) return true;
  if (v.pulse_rate && (v.pulse_rate > 120 || v.pulse_rate < 50)) return true;
  if (v.oxygen_saturation && v.oxygen_saturation < 92) return true;
  return false;
};

const getDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase();
  if (/watch|wearos|tizen/i.test(ua)) return "smartwatch";
  if (/mobile|android|iphone|ipad/i.test(ua)) return "mobile";
  return "desktop";
};

const VitalsMonitor = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [temp, setTemp] = useState("");
  const [bpSys, setBpSys] = useState("");
  const [bpDia, setBpDia] = useState("");
  const [pulse, setPulse] = useState("");
  const [o2, setO2] = useState("");
  const [loading, setLoading] = useState(false);
  const deviceType = getDeviceType();

  const fetchVitals = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("patient_vitals")
      .select("*")
      .eq("patient_id", user.id)
      .order("recorded_at", { ascending: false })
      .limit(20);
    if (data) setVitals(data);
  };

  useEffect(() => { fetchVitals(); }, [user]);

  const submitVitals = async () => {
    if (!user) return;

    const parsed = {
      temperature: temp ? parseFloat(temp) : null,
      blood_pressure_systolic: bpSys ? parseInt(bpSys) : null,
      blood_pressure_diastolic: bpDia ? parseInt(bpDia) : null,
      pulse_rate: pulse ? parseInt(pulse) : null,
      oxygen_saturation: o2 ? parseFloat(o2) : null,
    };

    const validation = vitalsSchema.safeParse(parsed);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    setLoading(true);
    const vital = { patient_id: user.id, ...parsed, source: deviceType };

    const { error } = await supabase.from("patient_vitals").insert(vital);
    if (error) {
      toast.error("Failed to save vitals");
    } else {
      toast.success("Vitals recorded!");
      // Check for danger and create notification
      if (isDanger({ ...vital, id: "", recorded_at: new Date().toISOString() } as Vital)) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "⚠️ Critical Vitals Detected",
          message: `Patient vitals are outside safe range. Temperature: ${temp || "N/A"}°C, BP: ${bpSys || "N/A"}/${bpDia || "N/A"}, Pulse: ${pulse || "N/A"}, O2: ${o2 || "N/A"}%`,
          type: "critical",
          related_patient_id: user.id,
        });
        toast.error("⚠️ DANGER: Vitals outside safe range! Caregiver notified.");
      }
      setShowForm(false);
      setTemp(""); setBpSys(""); setBpDia(""); setPulse(""); setO2("");
      fetchVitals();
    }
    setLoading(false);
  };

  const latestVital = vitals[0];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-foreground">Vitals Monitor</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              Device: 
              {deviceType === "smartwatch" ? <Watch className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              <Badge variant="secondary">{deviceType}</Badge>
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="hero" className="gap-2">
            <Plus className="w-4 h-4" /> Record Vitals
          </Button>
        </motion.div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-title">Record New Vitals</CardTitle></CardHeader>
              <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Thermometer className="w-4 h-4 text-coral" /> Temperature (°C)</Label>
                  <Input type="number" step="0.1" min={30} max={45} value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="36.5" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Activity className="w-4 h-4 text-primary" /> BP Systolic (mmHg)</Label>
                  <Input type="number" min={50} max={300} value={bpSys} onChange={(e) => setBpSys(e.target.value)} placeholder="120" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Activity className="w-4 h-4 text-primary" /> BP Diastolic (mmHg)</Label>
                  <Input type="number" min={30} max={200} value={bpDia} onChange={(e) => setBpDia(e.target.value)} placeholder="80" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Heart className="w-4 h-4 text-coral" /> Pulse Rate (bpm)</Label>
                  <Input type="number" min={20} max={300} value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="72" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Droplets className="w-4 h-4 text-calm" /> O₂ Saturation (%)</Label>
                  <Input type="number" step="0.1" min={50} max={100} value={o2} onChange={(e) => setO2(e.target.value)} placeholder="98" />
                </div>
                <div className="flex items-end">
                  <Button onClick={submitVitals} disabled={loading} className="w-full" variant="hero">
                    {loading ? "Saving..." : "Save Vitals"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Current Vitals Cards */}
        {latestVital && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Temperature", value: latestVital.temperature ? `${latestVital.temperature}°C` : "—", icon: Thermometer, danger: latestVital.temperature ? (latestVital.temperature > 38.5 || latestVital.temperature < 35) : false, color: "text-coral" },
              { label: "Blood Pressure", value: latestVital.blood_pressure_systolic ? `${latestVital.blood_pressure_systolic}/${latestVital.blood_pressure_diastolic}` : "—", icon: Activity, danger: latestVital.blood_pressure_systolic ? (latestVital.blood_pressure_systolic > 180 || latestVital.blood_pressure_systolic < 80) : false, color: "text-primary" },
              { label: "Pulse Rate", value: latestVital.pulse_rate ? `${latestVital.pulse_rate} bpm` : "—", icon: Heart, danger: latestVital.pulse_rate ? (latestVital.pulse_rate > 120 || latestVital.pulse_rate < 50) : false, color: "text-coral" },
              { label: "O₂ Saturation", value: latestVital.oxygen_saturation ? `${latestVital.oxygen_saturation}%` : "—", icon: Droplets, danger: latestVital.oxygen_saturation ? latestVital.oxygen_saturation < 92 : false, color: "text-calm" },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className={`shadow-card ${item.danger ? "border-destructive border-2" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      {item.danger && <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />}
                    </div>
                    <p className="text-2xl font-serif text-foreground">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* History */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-title">
              <TrendingUp className="w-5 h-5 text-primary" /> Vitals History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-muted-foreground font-medium">Date</th>
                    <th className="pb-3 text-muted-foreground font-medium">Temp</th>
                    <th className="pb-3 text-muted-foreground font-medium">BP</th>
                    <th className="pb-3 text-muted-foreground font-medium">Pulse</th>
                    <th className="pb-3 text-muted-foreground font-medium">O₂</th>
                    <th className="pb-3 text-muted-foreground font-medium">Source</th>
                    <th className="pb-3 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.map((v) => (
                    <tr key={v.id} className="border-b border-border/50">
                      <td className="py-3 text-foreground">{new Date(v.recorded_at).toLocaleString()}</td>
                      <td className="py-3">{v.temperature ? `${v.temperature}°C` : "—"}</td>
                      <td className="py-3">{v.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : "—"}</td>
                      <td className="py-3">{v.pulse_rate || "—"}</td>
                      <td className="py-3">{v.oxygen_saturation ? `${v.oxygen_saturation}%` : "—"}</td>
                      <td className="py-3"><Badge variant="secondary">{v.source || "manual"}</Badge></td>
                      <td className="py-3">
                        {isDanger(v) ? (
                          <Badge className="bg-coral-light text-coral">⚠️ Danger</Badge>
                        ) : (
                          <Badge className="bg-sage-light text-sage">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                  {vitals.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No vitals recorded yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VitalsMonitor;
