import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Shield, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const roles = [
  {
    title: "I'm a Patient",
    description: "Access your daily routine, memory exercises, and AI assistant",
    icon: Heart,
    path: "/patient",
    color: "bg-calm-light text-calm",
    role: "patient" as const,
  },
  {
    title: "I'm a Caregiver",
    description: "Monitor loved ones, track medication, and receive AI insights",
    icon: Shield,
    path: "/caregiver",
    color: "bg-sage-light text-sage",
    role: "caregiver" as const,
  },
  {
    title: "I'm a Clinician",
    description: "View clinical analytics, cognitive assessments, and reports",
    icon: Brain,
    path: "/clinical",
    color: "bg-lavender-light text-lavender",
    role: "clinician" as const,
  },
];

const roleRedirects: Record<string, string> = {
  patient: "/patient",
  caregiver: "/caregiver",
  clinician: "/clinical",
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Index = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  // Auto-redirect if user already has a role
  useEffect(() => {
    if (role && roleRedirects[role]) {
      navigate(roleRedirects[role], { replace: true });
    }
  }, [role, navigate]);

  // If redirecting, show nothing
  if (role && roleRedirects[role]) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-calm-light text-calm text-sm font-medium mb-8"
          >
            <Brain className="w-4 h-4" />
            AI-Powered Alzheimer's Care
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-display font-serif text-foreground mb-6"
          >
            Compassionate care,{" "}
            <span className="text-primary">powered by AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-accessible text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            A secure platform that supports Alzheimer's patients with daily living
            while giving caregivers and clinicians actionable AI-driven insights.
          </motion.p>

          <div className="grid sm:grid-cols-3 gap-5 max-w-2xl mx-auto">
            {roles.map((r, i) => (
              <motion.button
                key={r.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => navigate(r.path)}
                className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card shadow-card border border-border hover:shadow-elevated transition-shadow cursor-pointer text-center"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${r.color}`}>
                  <r.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-title font-serif text-foreground mb-1">{r.title}</h3>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>MemoGuard — HIPAA-Compliant Alzheimer's Care Platform</p>
      </footer>
    </main>
  );
};

export default Index;