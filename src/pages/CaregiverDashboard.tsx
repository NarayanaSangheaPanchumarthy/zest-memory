import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import {
  Bell, Pill, Activity, MapPin, MessageCircle,
  TrendingUp, AlertTriangle, CheckCircle2, Clock, FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// DEMO DATA — replace before production
const alerts = [
  { message: "Patient missed their 3 PM medication", time: "15 min ago", type: "warning" as const, icon: Pill },
  { message: "Mood detected as anxious from conversation", time: "1 hr ago", type: "info" as const, icon: Activity },
  { message: "Wandering alert: left safe zone briefly", time: "2 hrs ago", type: "critical" as const, icon: MapPin },
  { message: "Morning medication taken on time", time: "6 hrs ago", type: "success" as const, icon: CheckCircle2 },
];

const alertStyles = {
  warning: "border-l-amber bg-amber-light",
  info: "border-l-calm bg-calm-light",
  critical: "border-l-destructive bg-coral-light",
  success: "border-l-sage bg-sage-light",
};

const medications = [
  { name: "Donepezil 10mg", time: "8:00 AM", taken: true },
  { name: "Memantine 20mg", time: "8:00 AM", taken: true },
  { name: "Donepezil 10mg", time: "3:00 PM", taken: false },
  { name: "Vitamin D 1000IU", time: "8:00 PM", taken: false },
];

const CaregiverDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-heading text-foreground">Caregiver Dashboard</h1>
          <p className="text-accessible text-muted-foreground">Monitoring Margaret's care</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Cognitive Score", value: "72", change: "+3", icon: TrendingUp, color: "text-primary" },
            { label: "Medications Today", value: "2/4", change: "50%", icon: Pill, color: "text-sage" },
            { label: "Active Alerts", value: "2", change: "action needed", icon: AlertTriangle, color: "text-coral" },
            { label: "Mood Today", value: "Calm", change: "stable", icon: Activity, color: "text-lavender" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <Badge variant="secondary" className="text-xs">{stat.change}</Badge>
                  </div>
                  <p className="text-2xl font-serif text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-title">
                  <Bell className="w-5 h-5 text-primary" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-4 rounded-xl border-l-4 ${alertStyles[alert.type]}`}
                  >
                    <alert.icon className="w-5 h-5 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Medications */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-title">
                  <Pill className="w-5 h-5 text-sage" />
                  Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {medications.map((med, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      med.taken ? "bg-sage-light" : "bg-muted/50"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${med.taken ? "bg-sage" : "bg-muted-foreground/30"}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${med.taken ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {med.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{med.time}</p>
                    </div>
                    {med.taken && <CheckCircle2 className="w-4 h-4 text-sage" />}
                  </div>
                ))}
                <Progress value={50} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground text-center">2 of 4 taken today</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-title">
                <FileText className="w-5 h-5 text-primary" />
                AI Daily Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-body-lg text-foreground">
                Margaret had a mostly positive day. She completed 2 memory exercises this morning with improved
                recall for family names. Mood was calm through the morning but showed mild anxiety around 2 PM,
                possibly related to unfamiliar visitors. She briefly left the designated safe zone at 1:15 PM
                but returned within 5 minutes.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary">Cognitive: Stable</Badge>
                <Badge variant="secondary">Mood: Mostly Calm</Badge>
                <Badge variant="secondary">Safety: 1 Minor Alert</Badge>
                <Badge variant="secondary">Medication: 50% Adherence</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CaregiverDashboard;
