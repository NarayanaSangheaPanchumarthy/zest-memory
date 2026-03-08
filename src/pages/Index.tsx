import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, Shield, Brain, ArrowRight, Sparkles, Clock, MapPin,
  Gamepad2, Activity, FileText, MessageCircle, Users,
  CheckCircle2, CalendarDays, Droplets, Pill, AlertTriangle,
  Phone, Globe, Home, Stethoscope, Eye, Sun, Moon, Sunrise, Sunset,
  TrendingUp, Lock, Zap, BarChart3, BellRing, HandHeart
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
  {
    icon: CalendarDays,
    title: "Structured Daily Routines",
    desc: "Pre-built morning, afternoon, evening & night routines — from brushing teeth and getting dressed to evening hygiene and bedtime preparation. Each task includes gentle prompts with step-by-step guidance designed for cognitive accessibility.",
  },
  {
    icon: Pill,
    title: "Smart Medication Management",
    desc: "Never miss Donepezil at 8 AM or Memantine after lunch again. MemoGuard tracks every prescription, sends timed alerts, and logs when doses are confirmed — giving caregivers peace of mind and doctors accurate adherence data.",
  },
  {
    icon: Droplets,
    title: "Hydration & Nutrition Tracking",
    desc: "Dehydration is the #1 preventable hospitalization for dementia patients. MemoGuard sends gentle \"Time to drink water\" alerts every 2 hours and meal reminders for breakfast, lunch, snacks, and dinner.",
  },
  {
    icon: Activity,
    title: "Real-Time Vitals Monitoring",
    desc: "Track blood pressure, heart rate, oxygen saturation & temperature. Automatic alerts when readings fall outside safe ranges — systolic above 140 mmHg or pulse below 50 bpm triggers instant caregiver notification.",
  },
  {
    icon: Gamepad2,
    title: "Cognitive Exercise Games",
    desc: "Pattern matching, word recall, and sequence memory games calibrated to the patient's cognitive level. Clinicians see performance trends over weeks — early detection of cognitive decline through gamified assessment.",
  },
  {
    icon: MapPin,
    title: "GPS Safety & Wandering Prevention",
    desc: "60% of Alzheimer's patients wander at least once. MemoGuard creates safe zones around home, the local park, or day care — and instantly alerts caregivers with location when boundaries are crossed.",
  },
  {
    icon: MessageCircle,
    title: "AI Care Companion",
    desc: "\"What day is it?\" \"When is my next appointment?\" \"I feel confused.\" — The AI assistant answers questions with patience and clarity, provides emotional support, and escalates concerning patterns to the care team.",
  },
  {
    icon: FileText,
    title: "Secure Medical Records",
    desc: "Upload prescriptions, MRI reports, neuropsychological evaluations, and care plans. Share securely between family members and the clinical team — HIPAA-compliant storage with role-based access control.",
  },
];

const whoCards = [
  {
    icon: Heart,
    title: "For Patients",
    subtitle: "Living with Alzheimer's or mild cognitive impairment",
    items: [
      "Simple, large-text interface designed for cognitive accessibility",
      "Step-by-step daily routines: wake up → brush teeth → breakfast → medication",
      "Mood diary to express feelings when words become difficult",
      "Memory games that feel rewarding, not frustrating",
      "One-tap Emergency SOS that contacts caregivers with GPS location",
      "Gentle reminders: \"It's 2 PM — time for a glass of water\"",
    ],
    scenario: "Margaret, 74, uses MemoGuard every morning. It guides her through brushing her teeth, taking her Aricept, and eating breakfast — tasks her daughter used to remind her about over the phone 5 times a day.",
    color: "text-[hsl(var(--calm-blue))]",
    bg: "bg-[hsl(var(--calm-blue-light))]",
  },
  {
    icon: Shield,
    title: "For Family Caregivers",
    subtitle: "Spouses, children, and home aides providing daily support",
    items: [
      "Real-time dashboard showing if tasks and medications were completed",
      "GPS tracking with geofence alerts — know if they leave the house",
      "Assign and prioritize care tasks across the care team",
      "Communication log shared between all caregivers — no details lost",
      "Instant emergency alerts with one-tap call and location",
      "Weekly reports on mood patterns, vitals, and activity completion",
    ],
    scenario: "David works full-time but cares for his father with Alzheimer's. MemoGuard alerts him when his dad skips lunch medication or leaves the safe zone — he no longer has to choose between his job and his father's safety.",
    color: "text-[hsl(var(--sage))]",
    bg: "bg-[hsl(var(--sage-light))]",
  },
  {
    icon: Brain,
    title: "For Clinicians",
    subtitle: "Neurologists, geriatricians, and memory clinic teams",
    items: [
      "AI-powered cognitive decline risk assessment based on real daily data",
      "Longitudinal trends: medication adherence, mood patterns, game scores",
      "Assign personalized routines remotely — morning, afternoon, evening, night",
      "Multi-patient dashboard with priority flagging",
      "Review vitals history without relying on patient recall",
      "Evidence-based insights to support treatment plan adjustments",
    ],
    scenario: "Dr. Patel reviews her MemoGuard dashboard before each appointment. She can see that Mr. Chen's memory game scores dropped 15% this month and his evening confusion episodes increased — data that would never surface in a 15-minute office visit.",
    color: "text-[hsl(var(--lavender))]",
    bg: "bg-[hsl(var(--lavender-light))]",
  },
];

const timelineBlocks = [
  {
    period: "Morning",
    time: "6:00 – 9:00 AM",
    icon: Sunrise,
    color: "text-[hsl(var(--warm-amber))]",
    bg: "bg-[hsl(var(--warm-amber-light))]",
    tasks: [
      "Wake-up prompt with today's date and weather",
      "Guided routine: bathroom → brush teeth → get dressed",
      "Morning medication reminder (e.g., Donepezil 10mg)",
      "Breakfast reminder with simple meal suggestions",
      "First hydration alert: \"Good morning! Start with a glass of water\"",
    ],
  },
  {
    period: "Afternoon",
    time: "12:00 – 3:00 PM",
    icon: Sun,
    color: "text-primary",
    bg: "bg-primary/10",
    tasks: [
      "Lunch reminder with nutrition guidance",
      "Post-lunch medication (e.g., Memantine 5mg)",
      "Hydration check: \"Have you had water since lunch?\"",
      "Cognitive game session — 10-minute memory exercise",
      "Vitals check prompt for afternoon blood pressure reading",
    ],
  },
  {
    period: "Evening",
    time: "5:00 – 7:00 PM",
    icon: Sunset,
    color: "text-[hsl(var(--coral))]",
    bg: "bg-[hsl(var(--coral-light))]",
    tasks: [
      "Evening medication reminder with dosage confirmation",
      "Dinner reminder: \"It's time for dinner\"",
      "Mood diary prompt: \"How are you feeling today?\"",
      "Hydration alert: \"One more glass before bedtime\"",
      "Review tomorrow's appointments and schedule",
    ],
  },
  {
    period: "Night",
    time: "8:00 – 10:00 PM",
    icon: Moon,
    color: "text-[hsl(var(--lavender))]",
    bg: "bg-[hsl(var(--lavender-light))]",
    tasks: [
      "Night routine: bathroom → brush teeth → change clothes",
      "Nighttime medication if prescribed",
      "Gentle wind-down prompt: \"Time to relax and rest\"",
      "Caregiver receives daily completion summary",
      "Safety check: doors locked, stove off reminders",
    ],
  },
];

const whereCards = [
  {
    icon: Home,
    title: "At Home",
    desc: "Most Alzheimer's patients live at home. MemoGuard transforms a smartphone or tablet into a personal care assistant — guiding daily routines, tracking medications, and sending SOS alerts. Caregivers receive real-time updates whether they're in the next room or across town.",
    stat: "70% of Alzheimer's patients are cared for at home by family members",
  },
  {
    icon: Stethoscope,
    title: "In Clinical Settings",
    desc: "During appointments, clinicians access weeks of real patient data — not just what the patient remembers to report. Medication adherence rates, cognitive game performance, mood trends, and vital signs are all available in the clinical dashboard for evidence-based decisions.",
    stat: "Clinicians save an average of 20 minutes per patient review",
  },
  {
    icon: Globe,
    title: "Anywhere with Internet",
    desc: "Family members across the country can coordinate care through shared dashboards. A daughter in New York monitors her mother in Chennai. A son in London reviews his father's daily tasks in Lagos. MemoGuard works on any device with a web browser — no app download required.",
    stat: "Accessible on phone, tablet, laptop, or desktop — any browser",
  },
];

const stats = [
  { value: "55M+", label: "People living with dementia worldwide as of 2024, projected to reach 139 million by 2050", icon: Users },
  { value: "60%", label: "Of Alzheimer's patients will wander at least once — GPS tracking saves lives", icon: MapPin },
  { value: "40%", label: "Reduction in medication errors with automated reminders and confirmation tracking", icon: Pill },
  { value: "83%", label: "Of caregivers report high stress — connected tools reduce anxiety and burnout", icon: HandHeart },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const Index = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (role && roleRedirects[role]) {
      navigate(roleRedirects[role], { replace: true });
    }
  }, [role, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  if (role && roleRedirects[role]) return null;

  const navLinks = [
    { label: "What", id: "what" },
    { label: "Why", id: "why" },
    { label: "Who", id: "who" },
    { label: "When", id: "when" },
    { label: "Where", id: "where" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <main className="min-h-screen bg-background scroll-smooth" style={{ scrollPaddingTop: "3.5rem" }}>
      {/* STICKY NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-soft border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-calm flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-lg text-foreground">MemoGuard</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
            <Button size="sm" onClick={() => navigate("/auth")}>Sign Up Free</Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-14">
        <div className="absolute inset-0 gradient-hero opacity-[0.07]" />

        <div className="relative max-w-6xl mx-auto px-6 pb-20 sm:pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Trusted by families and clinics managing Alzheimer's care daily
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif text-foreground mb-5 leading-tight"
          >
            Daily Alzheimer's care,{" "}
            <span className="text-primary">guided by AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed"
          >
            MemoGuard is the care platform that helps Alzheimer's patients follow structured daily routines — 
            from morning medication and breakfast to evening wind-down — while keeping family caregivers 
            informed and clinicians equipped with real patient data.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Medication reminders. Hydration alerts. Cognitive exercises. GPS safety. Mood tracking. 
            Emergency SOS. All in one place — because managing Alzheimer's shouldn't require 10 different apps.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button size="lg" className="text-base px-8" onClick={() => navigate("/auth")}>
              Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" onClick={() => document.getElementById("what")?.scrollIntoView({ behavior: "smooth" })}>
              See How It Works
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2"
          >
            <Lock className="w-3 h-3" /> HIPAA-compliant · No credit card required · Free for patients
          </motion.p>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-10 px-6 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.value}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={i} variants={fadeUp}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <s.icon className="w-5 h-5 text-primary mr-2" />
                <span className="text-2xl sm:text-3xl font-serif text-primary">{s.value}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHAT — Features */}
      <section id="what" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium text-sm uppercase tracking-wider mb-2">What MemoGuard Does</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
              8 essential tools for Alzheimer's care
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed around the real daily challenges of living with or caring for someone with Alzheimer's disease — from the moment they wake up until they fall asleep.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
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

      {/* WHY — The Problem */}
      <section id="why" className="py-20 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium text-sm uppercase tracking-wider mb-2">Why MemoGuard Exists</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
              The reality of Alzheimer's care today
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
              <Card className="h-full border-destructive/20 bg-destructive/5">
                <CardContent className="p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                    <h3 className="text-lg font-serif text-foreground">Without MemoGuard</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Medications missed because the patient forgot — or took double doses",
                      "Dehydration goes unnoticed until a hospital visit",
                      "Caregiver calls 5 times a day to check if tasks were done",
                      "Patient wanders from home and no one knows for hours",
                      "Clinician sees the patient once every 3 months with no data between visits",
                      "Family members disagree about care because no one has the full picture",
                      "Cognitive decline goes undetected until it's too late to adjust treatment",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-destructive mt-1 shrink-0">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
              <Card className="h-full border-primary/20 bg-primary/5">
                <CardContent className="p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-serif text-foreground">With MemoGuard</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      "Every medication has a timed alert — patient confirms each dose with one tap",
                      "Hydration reminders every 2 hours keep fluid intake on track",
                      "Caregiver sees a live dashboard — completed tasks, mood, and vitals at a glance",
                      "GPS geofencing alerts the moment a patient leaves the safe zone",
                      "Clinicians review weeks of real daily data before every appointment",
                      "Shared communication log keeps every caregiver on the same page",
                      "Memory game trends detect subtle changes weeks before a clinical assessment would",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHO — Detailed role cards */}
      <section id="who" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium text-sm uppercase tracking-wider mb-2">Who It's For</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
              Designed for everyone in the care circle
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're living with Alzheimer's, caring for a loved one, or treating patients professionally — MemoGuard adapts to your role with the right tools and the right information.
            </motion.p>
          </motion.div>

          <div className="space-y-8">
            {whoCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
              >
                <Card className="border-border hover:shadow-elevated transition-shadow overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      <div className="lg:w-2/3 p-7 sm:p-9">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                          </div>
                          <div>
                            <h3 className="text-xl font-serif text-foreground">{card.title}</h3>
                            <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                          </div>
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mt-5">
                          {card.items.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className={`lg:w-1/3 ${card.bg} p-7 sm:p-9 flex flex-col justify-center`}>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Real-World Scenario</p>
                        <p className="text-sm text-foreground leading-relaxed italic">"{card.scenario}"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHEN — Daily timeline blocks */}
      <section id="when" className="py-20 px-6 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium text-sm uppercase tracking-wider mb-2">When It Helps — All Day, Every Day</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
              A typical day with MemoGuard
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-xl mx-auto">
              From the first alarm to the last goodnight — here's how MemoGuard structures a patient's entire day with gentle, timely guidance.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {timelineBlocks.map((block, i) => (
              <motion.div
                key={block.period}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
              >
                <Card className="h-full border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-xl ${block.bg} flex items-center justify-center`}>
                        <block.icon className={`w-5 h-5 ${block.color}`} />
                      </div>
                      <div>
                        <h3 className="font-serif text-foreground text-lg">{block.period}</h3>
                        <p className="text-xs text-muted-foreground">{block.time}</p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {block.tasks.map((task) => (
                        <li key={task} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                          {task}
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

      {/* WHERE — Usage contexts */}
      <section id="where" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium text-sm uppercase tracking-wider mb-2">Where It Works</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
              Care doesn't stop at the front door
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground max-w-2xl mx-auto">
              MemoGuard works wherever care happens — at home, in the clinic, or across continents. All you need is a web browser.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whereCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
              >
                <Card className="h-full border-border hover:shadow-elevated transition-shadow">
                  <CardContent className="p-7 flex flex-col h-full">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                      <card.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-serif text-foreground mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{card.desc}</p>
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {card.stat}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO GET STARTED */}
      <section className="py-20 px-6 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.p variants={fadeUp} custom={0} className="text-primary font-medium text-sm uppercase tracking-wider mb-2">Get Started in 3 Steps</motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-serif text-foreground mb-4">
              Set up takes less than 2 minutes
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Create Your Account", desc: "Sign up as a Patient, Caregiver, or Clinician. Each role gets a tailored dashboard with the right tools.", icon: Users },
              { step: "2", title: "Set Up Daily Routines", desc: "Choose from pre-built morning, afternoon, evening & night routine templates — or create custom tasks for your specific needs.", icon: CalendarDays },
              { step: "3", title: "Stay Connected", desc: "Patients follow their routines. Caregivers monitor in real time. Clinicians review trends. Everyone stays in sync.", icon: Zap },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full gradient-calm flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-serif text-lg">{item.step}</span>
                </div>
                <h3 className="font-serif text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl gradient-calm p-12 sm:p-16"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-serif text-primary-foreground mb-4">
            Every day matters. Start today.
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-primary-foreground/80 mb-3 max-w-lg mx-auto">
            MemoGuard is free for patients. Caregivers and clinicians can sign up in under 2 minutes. 
            No credit card. No complex setup. Just better care, starting now.
          </motion.p>
          <motion.p variants={fadeUp} custom={2} className="text-primary-foreground/60 text-sm mb-8 max-w-md mx-auto">
            Join families worldwide who use MemoGuard to bring structure, safety, and peace of mind to Alzheimer's care.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center">
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

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 bg-muted/30">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">Frequently Asked Questions</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-foreground mb-3">Common Questions About MemoGuard</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Answers to the questions families, caregivers, and healthcare providers ask most often.</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "What is MemoGuard and how does it help Alzheimer's patients?",
                a: "MemoGuard is an AI-powered care platform designed specifically for people living with Alzheimer's and other forms of dementia. It provides structured daily routines, medication reminders, cognitive exercises, GPS safety monitoring, and real-time vitals tracking — all in one place. The goal is to help patients maintain independence longer while giving caregivers and clinicians the tools to provide better, more informed care."
              },
              {
                q: "Is MemoGuard free to use?",
                a: "Yes, MemoGuard is completely free for patients. Caregivers and clinicians can create accounts at no cost and start managing care in under 2 minutes. There are no hidden fees, no credit card required, and no premium tiers that lock essential features behind a paywall."
              },
              {
                q: "How does MemoGuard protect patient privacy and data?",
                a: "MemoGuard is built with HIPAA-compliant infrastructure. All data is encrypted in transit and at rest. Patients control exactly what information is shared with caregivers and clinicians through granular privacy settings. We never sell patient data, and access is strictly controlled through role-based permissions and patient assignment relationships."
              },
              {
                q: "Can MemoGuard detect if a patient is wandering?",
                a: "Yes. MemoGuard's GPS Safety feature allows caregivers to define safe zones — such as around the patient's home, a local park, or a day care center. If the patient moves outside these boundaries, an instant alert with their real-time location is sent to designated caregivers. This is critical because 60% of Alzheimer's patients wander at least once, and timely intervention can prevent serious harm."
              },
              {
                q: "What kind of cognitive exercises does MemoGuard offer?",
                a: "MemoGuard includes pattern matching, word recall, and sequence memory games that are calibrated to each patient's cognitive level. These aren't just entertainment — clinicians can track performance trends over weeks and months, helping detect early signs of cognitive decline. The games are designed to be engaging and accessible, even for patients with moderate dementia."
              },
              {
                q: "How does the medication reminder system work?",
                a: "You or a caregiver enters the patient's medications, dosages, and scheduled times. MemoGuard sends timed alerts at the exact moment each dose is due — for example, Donepezil at 8:00 AM or Memantine after lunch. When the patient confirms they've taken their medication, it's logged automatically. Caregivers and clinicians can view adherence reports to ensure no doses are being missed."
              },
              {
                q: "Can family members monitor a patient remotely?",
                a: "Absolutely. MemoGuard is designed for families who can't always be physically present. A daughter in another city can check her mother's daily task completion, medication adherence, vitals readings, and location — all from her own device. Real-time notifications ensure she's alerted immediately if something needs attention, like a missed medication or an abnormal blood pressure reading."
              },
              {
                q: "What should I do in an emergency?",
                a: "MemoGuard includes a one-tap Emergency SOS feature accessible from every screen. Activating it immediately alerts all designated emergency contacts with the patient's current location and relevant health information. For life-threatening emergencies, always call your local emergency number (911 in the US) first, then use MemoGuard to coordinate with family and caregivers."
              },
              {
                q: "Is MemoGuard suitable for all stages of Alzheimer's?",
                a: "MemoGuard is designed to support patients across the spectrum — from mild cognitive impairment to moderate and advanced Alzheimer's. For early-stage patients, the platform emphasizes independence through self-managed routines and cognitive exercises. For later stages, it shifts focus to caregiver-managed care with enhanced monitoring, safety alerts, and clinical reporting tools."
              },
              {
                q: "How do clinicians use MemoGuard?",
                a: "Clinicians can manage multiple patients through a dedicated clinical panel. They can review vitals trends, medication adherence, cognitive game performance, and mood diary entries — all between appointments. The AI-powered clinical assistant can analyze patient data and flag concerns, helping doctors make more informed decisions during the limited time they have with each patient."
              },
            ].map((item, i) => (
              <motion.details
                key={i}
                variants={fadeUp}
                custom={i}
                className="group rounded-xl border border-border bg-card overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 text-left font-medium text-foreground hover:bg-muted/50 transition-colors list-none">
                  <span className="pr-4">{item.q}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </motion.details>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md gradient-calm flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-sm text-foreground">MemoGuard</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} MemoGuard — AI-Powered Alzheimer's Care Platform. HIPAA Compliant. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" /> Secure & Private
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;