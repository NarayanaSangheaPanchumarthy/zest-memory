import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import {
  Mic, Brain, MessageCircle, Gamepad2, Clock, FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import DailyTaskChecklist from "@/components/patient/DailyTaskChecklist";
import MedicationReminders from "@/components/patient/MedicationReminders";
import MoodDiary from "@/components/patient/MoodDiary";
import AppointmentCalendar from "@/components/patient/AppointmentCalendar";

const PatientDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [cogData, setCogData] = useState<{ date: string; accuracy: number }[]>([]);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [trend, setTrend] = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("game_sessions")
      .select("accuracy, created_at")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: true })
      .limit(20)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const mapped = data.map((d) => ({
          date: new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          accuracy: Number(d.accuracy),
        }));
        setCogData(mapped);
        setLatestScore(mapped[mapped.length - 1].accuracy);
        if (mapped.length >= 2) setTrend(mapped[mapped.length - 1].accuracy - mapped[mapped.length - 2].accuracy);
      });
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
          <h1 className="text-heading text-foreground">Good morning, {profile?.full_name || "there"} 👋</h1>
          <p className="text-accessible text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </motion.div>

        {/* AI Assistant */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="gradient-calm border-0 overflow-hidden">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center animate-pulse-gentle">
                <Mic className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-title text-primary-foreground mb-1">AI Assistant</h2>
                <p className="text-primary-foreground/80 text-body-lg mb-4">
                  I can help with reminders, memories, and emotional support.
                </p>
                <Button variant="outline" size="lg" className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/30 hover:text-primary-foreground" onClick={() => navigate("/chat")}>
                  <MessageCircle className="w-5 h-5 mr-2" /> Start Talking
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <DailyTaskChecklist userId={user.id} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <MedicationReminders userId={user.id} />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <MoodDiary userId={user.id} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <AppointmentCalendar userId={user.id} />
            </motion.div>
          </div>
        </div>

        {/* Cognitive Trends + Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="shadow-card">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-lavender" />
                  <h3 className="font-serif text-title text-foreground">Cognitive Trends</h3>
                </div>
                {cogData.length > 0 ? (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-serif text-foreground">{latestScore}%</span>
                      <span className={`text-sm font-medium mb-1 ${trend >= 0 ? "text-sage" : "text-destructive"}`}>
                        {trend >= 0 ? "+" : ""}{trend}%
                      </span>
                    </div>
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cogData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                          <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--lavender))" strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Play memory games to track your trends!</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="shadow-card">
              <CardContent className="p-5">
                <h3 className="font-serif text-title text-foreground mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Memory Games", icon: Gamepad2, color: "bg-calm-light text-calm", path: "/games" },
                    { label: "AI Chat", icon: MessageCircle, color: "bg-sage-light text-sage", path: "/chat" },
                    { label: "My Documents", icon: FileText, color: "bg-amber-light text-amber", path: "/documents" },
                    { label: "My Vitals", icon: Clock, color: "bg-lavender-light text-lavender", path: "/vitals" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:opacity-80 transition-opacity cursor-pointer`}
                    >
                      <action.icon className="w-7 h-7" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
