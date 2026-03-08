import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import { Mic, Brain, MessageCircle, Gamepad2, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import DailyTaskChecklist from "@/components/patient/DailyTaskChecklist";
import MedicationReminders from "@/components/patient/MedicationReminders";
import MoodDiary from "@/components/patient/MoodDiary";
import AppointmentCalendar from "@/components/patient/AppointmentCalendar";
import EmergencySOS from "@/components/EmergencySOS";
import WellnessReminders from "@/components/patient/WellnessReminders";

const PatientDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [cogData, setCogData] = useState<{ date: string; accuracy: number }[]>([]);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [trend, setTrend] = useState(0);
  const [activeTab, setActiveTab] = useState("tasks");

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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">
            {greeting()}, {profile?.full_name || "there"} 👋
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </motion.div>

        {/* Wellness Reminders */}
        <WellnessReminders userId={user.id} />

        {/* AI Assistant Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="gradient-calm border-0 overflow-hidden">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[hsl(0,0%,100%,0.2)] flex items-center justify-center shrink-0">
                <Mic className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-lg font-serif text-primary-foreground mb-1">AI Care Assistant</h2>
                <p className="text-primary-foreground/80 text-sm mb-3">
                  Get help with reminders, memories, emotional support, and daily questions.
                </p>
                <Button
                  variant="outline"
                  className="bg-[hsl(0,0%,100%,0.2)] border-[hsl(0,0%,100%,0.3)] text-primary-foreground hover:bg-[hsl(0,0%,100%,0.3)] hover:text-primary-foreground"
                  onClick={() => navigate("/chat")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> Talk to AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Tabs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
              <TabsTrigger value="tasks" className="text-xs sm:text-sm">Daily Tasks</TabsTrigger>
              <TabsTrigger value="medications" className="text-xs sm:text-sm">Meds</TabsTrigger>
              <TabsTrigger value="mood" className="text-xs sm:text-sm">Mood</TabsTrigger>
              <TabsTrigger value="appointments" className="text-xs sm:text-sm">Appts</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-4">
              <DailyTaskChecklist userId={user.id} />
            </TabsContent>

            <TabsContent value="medications" className="mt-4">
              <MedicationReminders userId={user.id} />
            </TabsContent>

            <TabsContent value="mood" className="mt-4">
              <MoodDiary userId={user.id} />
            </TabsContent>

            <TabsContent value="appointments" className="mt-4">
              <AppointmentCalendar userId={user.id} />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Bottom Row: Cognitive + Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="w-5 h-5 text-[hsl(var(--lavender))]" />
                  Cognitive Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cogData.length > 0 ? (
                  <>
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-3xl font-serif text-foreground">{latestScore}%</span>
                      <span className={`text-sm font-medium mb-1 ${trend >= 0 ? "text-[hsl(var(--sage))]" : "text-destructive"}`}>
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
                          <Line type="monotone" dataKey="accuracy" stroke="hsl(260, 30%, 60%)" strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <Brain className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Play memory games to track your cognitive trends!</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/games")}>
                      <Gamepad2 className="w-4 h-4 mr-2" /> Play Games
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="shadow-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { label: "Memory Games", icon: Gamepad2, color: "bg-[hsl(200,40%,92%)] text-[hsl(200,35%,45%)]", path: "/games" },
                    { label: "AI Chat", icon: MessageCircle, color: "bg-[hsl(150,25%,92%)] text-[hsl(150,20%,50%)]", path: "/chat" },
                    { label: "Documents", icon: FileText, color: "bg-[hsl(35,80%,93%)] text-[hsl(35,80%,55%)]", path: "/documents" },
                    { label: "Vitals", icon: Clock, color: "bg-[hsl(260,35%,93%)] text-[hsl(260,30%,60%)]", path: "/vitals" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      className={`flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl ${action.color} hover:opacity-80 transition-opacity cursor-pointer`}
                    >
                      <action.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      <span className="text-xs sm:text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <EmergencySOS />
    </div>
  );
};

export default PatientDashboard;
