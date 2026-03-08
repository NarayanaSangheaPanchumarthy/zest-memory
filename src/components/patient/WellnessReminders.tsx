import { useState, useEffect, useMemo } from "react";
import { Droplets, UtensilsCrossed, Pill, Bell, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Reminder {
  id: string;
  icon: typeof Droplets;
  message: string;
  color: string;
  bgColor: string;
}

const WellnessReminders = ({ userId }: { userId: string }) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [hasMeds, setHasMeds] = useState(false);

  useEffect(() => {
    supabase
      .from("medications")
      .select("id")
      .eq("patient_id", userId)
      .eq("is_active", true)
      .limit(1)
      .then(({ data }) => setHasMeds((data?.length || 0) > 0));
  }, [userId]);

  const reminders = useMemo(() => {
    const h = new Date().getHours();
    const list: Reminder[] = [];

    // Water reminders every ~2 hours during waking hours
    if (h >= 7 && h < 22) {
      list.push({
        id: "water",
        icon: Droplets,
        message: "Time to drink water! Stay hydrated 💧",
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
      });
    }

    // Meal reminders
    if (h >= 7 && h < 9) {
      list.push({ id: "breakfast", icon: UtensilsCrossed, message: "Don't forget to eat breakfast! 🍳", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30" });
    } else if (h >= 11 && h < 13) {
      list.push({ id: "lunch", icon: UtensilsCrossed, message: "Lunchtime — eat a healthy meal! 🥗", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/30" });
    } else if (h >= 15 && h < 17) {
      list.push({ id: "snack", icon: UtensilsCrossed, message: "Have a light snack with some fluids 🍎", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/30" });
    } else if (h >= 17 && h < 19) {
      list.push({ id: "dinner", icon: UtensilsCrossed, message: "Time for dinner! 🍽️", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/30" });
    }

    // Medicine reminders
    if (hasMeds) {
      if (h >= 7 && h < 9) {
        list.push({ id: "med-morning", icon: Pill, message: "Take your morning medications 💊", color: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-950/30" });
      } else if (h >= 12 && h < 14) {
        list.push({ id: "med-afternoon", icon: Pill, message: "Time for afternoon medications 💊", color: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-950/30" });
      } else if (h >= 18 && h < 20) {
        list.push({ id: "med-evening", icon: Pill, message: "Take your evening medications 💊", color: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-950/30" });
      } else if (h >= 21 && h < 22) {
        list.push({ id: "med-night", icon: Pill, message: "Take your night medications 💊", color: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-950/30" });
      }
    }

    return list.filter((r) => !dismissed.has(r.id));
  }, [dismissed, hasMeds]);

  if (reminders.length === 0) return null;

  return (
    <div className="space-y-2">
      {reminders.map((r) => {
        const Icon = r.icon;
        return (
          <Card key={r.id} className={`${r.bgColor} border-0 shadow-sm`}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${r.bgColor}`}>
                <Icon className={`w-4 h-4 ${r.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${r.color}`}>{r.message}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setDismissed((p) => new Set(p).add(r.id))}
              >
                <X className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WellnessReminders;
