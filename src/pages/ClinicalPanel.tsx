import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import {
  Brain, TrendingDown, Users, FileText, Download,
  AlertTriangle, Activity, BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from "recharts";

const cognitiveData = [
  { month: "Sep", score: 82 },
  { month: "Oct", score: 79 },
  { month: "Nov", score: 77 },
  { month: "Dec", score: 75 },
  { month: "Jan", score: 74 },
  { month: "Feb", score: 72 },
];

const moodData = [
  { day: "Mon", calm: 70, anxious: 20, agitated: 10 },
  { day: "Tue", calm: 65, anxious: 25, agitated: 10 },
  { day: "Wed", calm: 80, anxious: 15, agitated: 5 },
  { day: "Thu", calm: 60, anxious: 30, agitated: 10 },
  { day: "Fri", calm: 75, anxious: 15, agitated: 10 },
  { day: "Sat", calm: 85, anxious: 10, agitated: 5 },
  { day: "Sun", calm: 78, anxious: 17, agitated: 5 },
];

const patients = [
  { name: "Margaret Johnson", age: 74, stage: "Moderate", score: 72, trend: "stable", risk: "medium" },
  { name: "Robert Williams", age: 81, stage: "Mild", score: 85, trend: "improving", risk: "low" },
  { name: "Dorothy Chen", age: 69, stage: "Moderate-Severe", score: 58, trend: "declining", risk: "high" },
  { name: "James Thompson", age: 77, stage: "Mild", score: 88, trend: "stable", risk: "low" },
];

const trendColors = {
  stable: "text-primary",
  improving: "text-sage",
  declining: "text-coral",
};

const riskBadge = {
  low: "bg-sage-light text-sage",
  medium: "bg-amber-light text-amber",
  high: "bg-coral-light text-coral",
};

const ClinicalPanel = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-heading text-foreground">Clinical Insights</h1>
            <p className="text-accessible text-muted-foreground">Longitudinal analytics & risk assessment</p>
          </div>
          <div className="flex gap-3">
            <Button variant="calm" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button variant="default" className="gap-2">
              <FileText className="w-4 h-4" />
              Generate PDF
            </Button>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Patients", value: "4", icon: Users, color: "text-primary" },
            { label: "Avg. Cognitive Score", value: "75.8", icon: Brain, color: "text-lavender" },
            { label: "High Risk", value: "1", icon: AlertTriangle, color: "text-coral" },
            { label: "Assessments This Week", value: "12", icon: Activity, color: "text-sage" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="shadow-card">
                <CardContent className="p-5">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <p className="text-2xl font-serif text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Cognitive Decline Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-title">
                  <TrendingDown className="w-5 h-5 text-primary" />
                  Cognitive Score Trend — Margaret Johnson
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={cognitiveData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(200, 35%, 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(200, 35%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 88%)" />
                    <XAxis dataKey="month" stroke="hsl(210, 10%, 50%)" fontSize={13} />
                    <YAxis domain={[60, 100]} stroke="hsl(210, 10%, 50%)" fontSize={13} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(200, 35%, 45%)"
                      strokeWidth={2.5}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mood Distribution */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-title">
                  <BarChart3 className="w-5 h-5 text-lavender" />
                  Weekly Mood Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 88%)" />
                    <XAxis dataKey="day" stroke="hsl(210, 10%, 50%)" fontSize={13} />
                    <YAxis stroke="hsl(210, 10%, 50%)" fontSize={13} />
                    <Tooltip />
                    <Line type="monotone" dataKey="calm" stroke="hsl(150, 20%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="anxious" stroke="hsl(35, 80%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="agitated" stroke="hsl(10, 65%, 58%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-4 justify-center mt-3 text-sm">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sage" /> Calm</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber" /> Anxious</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-coral" /> Agitated</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Patient List */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-title">
                <Users className="w-5 h-5 text-primary" />
                Patient Registry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Patient</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Age</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Stage</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Score</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Trend</th>
                      <th className="pb-3 text-sm font-medium text-muted-foreground">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-4 font-medium text-foreground">{p.name}</td>
                        <td className="py-4 text-muted-foreground">{p.age}</td>
                        <td className="py-4 text-muted-foreground">{p.stage}</td>
                        <td className="py-4 font-serif text-lg text-foreground">{p.score}</td>
                        <td className={`py-4 font-medium capitalize ${trendColors[p.trend as keyof typeof trendColors]}`}>{p.trend}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${riskBadge[p.risk as keyof typeof riskBadge]}`}>
                            {p.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ClinicalPanel;
