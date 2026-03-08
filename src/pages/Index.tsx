import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Shield, Brain, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const roles = [
  {
    title: "Patient",
    subtitle: "I need daily care support",
    description: "Daily routines, medication reminders, mood diary, memory games & AI assistant",
    icon: Heart,
    path: "/patient",
    gradient: "from-[hsl(200,35%,45%)] to-[hsl(180,30%,50%)]",
    iconBg: "bg-[hsl(200,40%,92%)] text-[hsl(200,35%,45%)]",
    role: "patient" as const,
  },
  {
    title: "Caregiver",
    subtitle: "I care for someone",
    description: "Patient monitoring, care tasks, communication logs & emergency tools",
    icon: Shield,
    path: "/caregiver",
    gradient: "from-[hsl(150,25%,50%)] to-[hsl(170,25%,45%)]",
    iconBg: "bg-[hsl(150,25%,92%)] text-[hsl(150,20%,50%)]",
    role: "caregiver" as const,
  },
  {
    title: "Clinician",
    subtitle: "I provide clinical care",
    description: "AI risk assessment, cognitive analytics, patient management & reports",
    icon: Brain,
    path: "/clinical",
    gradient: "from-[hsl(260,30%,60%)] to-[hsl(280,25%,55%)]",
    iconBg: "bg-[hsl(260,35%,93%)] text-[hsl(260,30%,60%)]",
    role: "clinician" as const,
  },
];

const roleRedirects: Record<string, string> = {
  patient: "/patient",
  caregiver: "/caregiver",
  clinician: "/clinical",
};

const Index = () => {
  const navigate = useNavigate();
  const { role, profile } = useAuth();

  useEffect(() => {
    if (role && roleRedirects[role]) {
      navigate(roleRedirects[role], { replace: true });
    }
  }, [role, navigate]);

  if (role && roleRedirects[role]) return null;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Alzheimer's Care Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif text-foreground mb-4 leading-tight"
          >
            Compassionate care,{" "}
            <span className="text-primary">powered by AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            {profile
              ? `Welcome back, ${profile.full_name}. Choose your dashboard below.`
              : "Supporting patients, caregivers, and clinicians with AI-driven insights and daily care tools."}
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {roles.map((r, i) => (
              <motion.button
                key={r.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => navigate(r.path)}
                className="group flex flex-3 sm:gap-4 p-6 sm:l items-center gap-4 p-8 rounded-2xl bg-card shadow-card border border-border hover:shadow-elevated transition-all cursor-pointer text-center"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${r.iconBg} group-hover:scale-110 transition-transform`}>
                  <r.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-serif text-foreground mb-1">{r.title}</h3>
                  <p className="text-xs font-medium text-primary mb-2">{r.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-6 px-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>MemoGuard — HIPAA-Compliant Alzheimer's Care Platform</p>
      </footer>
    </main>
  );
};

export default Index;
