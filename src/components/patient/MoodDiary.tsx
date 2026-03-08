import { useState, useEffect } from "react";
import { Smile, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const moods = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "😔", label: "Sad", value: "sad" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "😡", label: "Frustrated", value: "frustrated" },
];

const symptoms = ["Confusion", "Fatigue", "Headache", "Dizziness", "Memory gaps", "Difficulty sleeping"];

const MoodDiary = ({ userId }: { userId: string }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [energy, setEnergy] = useState(3);
  const [todayEntry, setTodayEntry] = useState<any>(null);
  const [recentMoods, setRecentMoods] = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    const [todayRes, recentRes] = await Promise.all([
      supabase.from("mood_entries").select("*").eq("patient_id", userId).eq("entry_date", today).maybeSingle(),
      supabase.from("mood_entries").select("mood, entry_date, energy_level").eq("patient_id", userId).order("entry_date", { ascending: false }).limit(7),
    ]);
    if (todayRes.data) {
      setTodayEntry(todayRes.data);
      setSelectedMood(todayRes.data.mood);
    }
    setRecentMoods(recentRes.data || []);
  };

  const saveMood = async () => {
    if (!selectedMood) { toast.error("Please select how you're feeling"); return; }
    
    if (todayEntry) {
      await supabase.from("mood_entries").update({
        mood: selectedMood,
        notes: notes || null,
        energy_level: energy,
        symptoms: selectedSymptoms,
      }).eq("id", todayEntry.id);
    } else {
      await supabase.from("mood_entries").insert({
        patient_id: userId,
        mood: selectedMood,
        notes: notes || null,
        energy_level: energy,
        symptoms: selectedSymptoms,
        entry_date: today,
      });
    }
    toast.success("Mood saved! 💛");
    loadData();
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const moodEmoji = (m: string) => moods.find(x => x.value === m)?.emoji || "😐";

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-title">
          <Smile className="w-5 h-5 text-amber" />
          How are you feeling?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood Selection */}
        <div className="grid grid-cols-6 gap-2">
          {moods.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMood(m.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
                selectedMood === m.value ? "bg-primary/10 ring-2 ring-primary scale-105" : "hover:bg-muted"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Energy Level */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Energy Level</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setEnergy(level)}
                className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors ${
                  level <= energy ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Any symptoms?</p>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((s) => (
              <Badge
                key={s}
                variant={selectedSymptoms.includes(s) ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleSymptom(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>

        {/* Notes */}
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about how you're feeling today..."
          className="resize-none"
          rows={2}
        />

        <Button onClick={saveMood} className="w-full">
          {todayEntry ? "Update Mood" : "Save Mood"}
        </Button>

        {/* Recent Mood History */}
        {recentMoods.length > 1 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Last 7 days
            </p>
            <div className="flex gap-2 justify-between">
              {recentMoods.slice(0, 7).reverse().map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{moodEmoji(m.mood)}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.entry_date).toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodDiary;
