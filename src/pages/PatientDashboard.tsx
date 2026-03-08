import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import {
  Mic, Clock, Pill, Sun, Moon, Coffee, Brain, Smile,
  MessageCircle, Gamepad2, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const schedule = [
  { time: "8:00 AM", label: "Morning Medication", icon: Pill, done: true, color: "text-sage" },
  { time: "9:00 AM", label: "Breakfast", icon: Coffee, done: true, color: "text-amber" },
  { time: "10:30 AM", label: "Memory Exercises", icon: Brain, done: false, color: "text-primary" },
  { time: "12:00 PM", label: "Lunch", icon: Sun, done: false, color: "text-amber" },
  { time: "3:00 PM", label: "Afternoon Medication", icon: Pill, done: false, color: "text-sage" },
  { time: "8:00 PM", label: "Evening Routine", icon: Moon, done: false, color: "text-lavender" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

const PatientDashboard = () => {
  const { user } = useAuth();
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
        if (mapped.length >= 2) {
          setTrend(mapped[mapped.length - 1].accuracy - mapped[mapped.length - 2].accuracy);
        }
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
          <h1 className="text-heading text-foreground">Good morning, Margaret</h1>
          <p className="text-accessible text-muted-foreground">
            Today is Monday, March 1, 2026. Here's your day.
          </p>
        </motion.div>

        {/* AI Assistant Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="gradient-calm border-0 overflow-hidden">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center animate-pulse-gentle">
                <Mic className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-title text-primary-foreground mb-1">AI Assistant</h2>
                <p className="text-primary-foreground/80 text-body-lg mb-4">
                  Tap to talk. I can help with reminders, memories, and more.
                </p>
                <Button variant="outline" size="lg" className="bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/30 hover:text-primary-foreground">
                  <Mic className="w-5 h-5 mr-2" />
                  Start Talking
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-title">
                  <Calendar className="w-5 h-5 text-primary" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {schedule.map((item, i) => (
                  <motion.div
                    key={item.label}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                      item.done ? "bg-sage-light" : "bg-muted/50"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <div className="flex-1">
                      <p className={`font-medium ${item.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.label}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                    {item.done && (
                      <span className="text-xs font-medium text-sage bg-sage/10 px-2 py-1 rounded-full">Done</span>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Cognitive Score */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-title">
                    <Brain className="w-5 h-5 text-lavender" />
                    Cognitive Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-serif text-foreground">72</span>
                    <span className="text-muted-foreground mb-1">/100</span>
                    <span className="text-sm text-sage font-medium mb-1 ml-auto">+3 this week</span>
                  </div>
                  <Progress value={72} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    Great progress! Memory exercises are helping.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-title">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Memory Games", icon: Gamepad2, color: "bg-calm-light text-calm" },
                    { label: "Talk to AI", icon: MessageCircle, color: "bg-sage-light text-sage" },
                    { label: "My Family", icon: Smile, color: "bg-amber-light text-amber" },
                    { label: "My Day", icon: Clock, color: "bg-lavender-light text-lavender" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:opacity-80 transition-opacity cursor-pointer`}
                    >
                      <action.icon className="w-7 h-7" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Mood */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-title">
                    <Smile className="w-5 h-5 text-amber" />
                    How are you feeling?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between gap-2">
                    {["😊", "😐", "😔", "😰", "😡"].map((emoji) => (
                      <button
                        key={emoji}
                        className="flex-1 text-3xl p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
