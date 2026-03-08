import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart, Shield, Brain, ArrowRight, Sparkles, Clock, MapPin,
  Bell, Gamepad2, Activity, FileText, MessageCircle, Users,
  CheckCircle2, CalendarDays, Droplets, Pill
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const roleRedirects: Record<string, string> = {
  patient: "/patient",
  caregiver: "/caregiver",
  clinician: "/clinical",
};

const features = [
  { icon: CalendarDays, title: "Daily Routine Management", desc: "Morning, afternoon, evening & night routines with guided task checklists tailored to each patient's needs." },
  { icon: Pill, title: "Medication Reminders", desc: "Timely alerts for every prescription — never miss a dose with smart scheduling and confirmation tracking." },
  { icon: Droplets, title: "Hydration & Nutrition Alerts", desc: "Regular drink water, eat meals, and take fluids notifications throughout the day to maintain health." },
  { icon: Activity, title: "Vitals Monitoring", desc: "Track blood pressure, heart rate, temperature & oxygen levels with trend analysis and abnormality alerts." },
  { icon: Gamepad2, title: "Cognitive Memory Games", desc: "Scientifically-inspired memory exercises that track cognitive performance over time." },
  { icon: MapPin, title: "GPS Safety & Geofencing", desc: "Real-time location tracking with safe zone alerts — caregivers are notified if a patient wanders." },
  { icon: MessageCircle, title: "AI Care Assistant", desc: "24/7 conversational AI trained on Alzheimer's care best practices for patients and caregivers." },
  { icon: FileText, title: "Medical Documents", desc: "Securely store and share prescriptions, lab reports, and care plans between the care team." },
];

const whoCards = [
  {
    icon: Heart,
    title: "Patients",
    items: ["Guided daily routines", "Medication & hydration alerts", "Mood diary & memory games", "Emergency SOS button"],
    color: "text-[hsl(var(--calm-blue))]",
    bg: "bg-[hsl(var(--calm-blue-light))]",
  },
  {
    icon: Shield,
    title: "Caregivers",
    items: ["Monitor patient activity", "Assign & track care tasks", "Communication logs", "Real-time safety alerts"],
    color: "text-[hsl(var(--sage))]",
    bg: "bg-[hsl(var(--sage-light))]",
  },
  {
    icon: Brain,
    title: "Clinicians",
    items: ["AI-powered risk assessment", "Cognitive trend analytics", "Assign patient routines", "Multi-patient dashboard"],
    color: "text-[hsl(var(--lavender))]",
    bg: "bg-[hsl(var(--lavender-light))]",
  },
];

const whenItems = [
  { time: "6:00 AM", label: "Morning routine & medication reminder" },
  { time: "8:00 AM", label: "Breakfast & hydration alert" },
  { time: "10:00 AM", label: "Memory game session" },
  { time: "12:00 PM", label: "Lunch reminder & vitals check" },
  { time: "2:00 PM", label: "Afternoon hydration & activity" },
  { time: "5:00 PM", label: "Evening medication & mood diary" },
  { time: "8:00 PM", label: "Night routine & wind-down" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const Index = () => {
  const navigate = useNavigate();
  const { user, role, profile } = useAuth();

  useEffect(() => {
    if (role && roleRedirects[role]) {
      navigate(roleRedirects[role], { replace: true });
    }
  }, [role, navigate]);

  if (role && roleRedirects[role]) return null;

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.07]" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Alzheimer's Care Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif text-foreground mb-5 leading-tight"
          >
            Compassionate daily care,{" "}
            <span className="text-primary">powered by AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            MemoGuard helps Alzheimer's patients maintain independence with structured daily routines,
            medication reminders, hydration alerts, and cognitive exercises — while keeping caregivers
            and clinicians connected in real time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button size="lg" className="text-base px-8" onClick={() => navigate("/auth")}>
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" onClick={() => document.getElementById("what")?.scrollIntoView({ behavior: "smooth" })}>
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* WHAT — Features */}
      <section id="what" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium text-sm uppercase tracking-wider mb-2">What We Offer</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
              Everything for comprehensive Alzheimer's care
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-2xl mx-auto">
              From morning wake-up routines to nighttime wind-down — MemoGuard covers every aspect of daily living, health monitoring, and cognitive wellness.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                <Card className="h-full border-border hover:shadow-elevated transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-serif text-foreground text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY — Benefits */}
      <section className="py-20 px-6 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium text-sm uppercase tracking-wider mb-2">Why MemoGuard</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
              Because every moment of care matters
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-2xl mx-auto">
              Alzheimer's affects 55 million people worldwide. Structured routines, timely reminders, and connected care teams
              significantly improve quality of life and slow cognitive decline.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { stat: "40%", label: "Reduction in missed medications with automated reminders and confirmation tracking." },
              { stat: "24/7", label: "Real-time safety monitoring with GPS tracking, geofencing, and instant emergency alerts." },
              { stat: "3-in-1", label: "Unified platform connecting patients, caregivers, and clinicians — no more fragmented tools." },
            ].map((item, i) => (
              <motion.div
                key={item.stat}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="text-center p-8 rounded-2xl bg-background border border-border"
              >
                <p className="text-4xl font-serif text-primary mb-3">{item.stat}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO — Role cards */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium text-sm uppercase tracking-wider mb-2">Who It's For</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
              Built for the entire care circle
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whoCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
              >
                <Card className="h-full border-border hover:shadow-elevated transition-shadow">
                  <CardContent className="p-7">
                    <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-5`}>
                      <card.icon className={`w-7 h-7 ${card.color}`} />
                    </div>
                    <h3 className="text-xl font-serif text-foreground mb-4">{card.title}</h3>
                    <ul className="space-y-2.5">
                      {card.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHEN — Daily timeline */}
      <section className="py-20 px-6 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium text-sm uppercase tracking-wider mb-2">When It Helps</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
              A full day of guided care
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-xl mx-auto">
              MemoGuard sends timely notifications from morning to night, ensuring patients stay on track with routines, meals, hydration, and medications.
            </motion.p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {whenItems.map((item, i) => (
                <motion.div
                  key={item.time}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  custom={i} variants={fadeUp}
                  className="flex items-center gap-4 sm:gap-6 pl-2"
                >
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0 z-10">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-background border border-border">
                    <span className="text-xs font-medium text-primary">{item.time}</span>
                    <p className="text-sm text-foreground mt-0.5">{item.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHERE — Accessibility */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium text-sm uppercase tracking-wider mb-2">Where To Use</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
              Accessible anywhere, anytime
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Users, title: "At Home", desc: "Patients follow daily routines on their phone or tablet. Caregivers get real-time updates from anywhere." },
              { icon: Activity, title: "In the Clinic", desc: "Clinicians access patient dashboards, AI risk assessments, and cognitive analytics during appointments." },
              { icon: MapPin, title: "On the Go", desc: "GPS safety tracking and geofencing keep patients safe outdoors. Emergency SOS works from any location." },
            ].map((item, i) => (
              <motion.div key={item.title} custom={i} variants={fadeUp}>
                <Card className="h-full border-border hover:shadow-elevated transition-shadow text-center">
                  <CardContent className="p-7">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-serif text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl gradient-calm p-12 sm:p-16"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-serif text-primary-foreground mb-4">
            Start caring smarter today
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join families and care teams already using MemoGuard to bring structure, safety, and peace of mind to Alzheimer's care.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Button
              size="lg"
              variant="secondary"
              className="text-base px-10 font-semibold"
              onClick={() => navigate("/auth")}
            >
              Create Your Free Account <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} MemoGuard — AI-Powered Alzheimer's Care Platform. All rights reserved.
        </p>
      </footer>
    </main>
  );
};

export default Index;