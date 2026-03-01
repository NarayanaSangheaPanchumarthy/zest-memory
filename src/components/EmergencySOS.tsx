import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const EmergencySOS = () => {
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);

  const sendSOS = async () => {
    if (!user) return;
    setSending(true);

    try {
      // Get current location
      let lat = 0, lng = 0;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // Location unavailable, continue without it
      }

      // Create emergency alert
      const { error: alertError } = await supabase.from("emergency_alerts").insert({
        patient_id: user.id,
        alert_type: "sos",
        severity: "critical",
        message: `🚨 EMERGENCY SOS triggered by patient! ${lat ? `Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Location unavailable."}`,
      });

      if (alertError) throw alertError;

      // Fetch all caregiver user IDs and notify them
      const { data: caregivers } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "caregiver");

      if (caregivers && caregivers.length > 0) {
        const notifications = caregivers.map((c) => ({
          user_id: c.user_id,
          title: "🚨 Emergency SOS Alert",
          message: `A patient has triggered an emergency SOS! ${lat ? `Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Location unavailable."}`,
          type: "emergency",
          related_patient_id: user.id,
        }));

        await supabase.from("notifications").insert(notifications);
      }

      // Also notify clinicians
      const { data: clinicians } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "clinician");

      if (clinicians && clinicians.length > 0) {
        const notifications = clinicians.map((c) => ({
          user_id: c.user_id,
          title: "🚨 Emergency SOS Alert",
          message: `A patient has triggered an emergency SOS! ${lat ? `Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Location unavailable."}`,
          type: "emergency",
          related_patient_id: user.id,
        }));

        await supabase.from("notifications").insert(notifications);
      }

      toast.success("SOS alert sent to all caregivers and clinicians!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to send SOS alert");
    }

    setSending(false);
    setConfirming(false);
  };

  return (
    <>
      {/* Floating SOS Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setConfirming(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-destructive text-destructive-foreground shadow-elevated flex items-center justify-center cursor-pointer"
        aria-label="Emergency SOS"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Phone className="w-7 h-7" />
        </motion.div>
      </motion.button>

      {/* Confirmation overlay */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-elevated text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-serif text-foreground">Emergency SOS</h2>
              <p className="text-muted-foreground text-sm">
                This will immediately alert all caregivers and clinicians with your location. Are you sure?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirming(false)}
                  disabled={sending}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={sendSOS}
                  disabled={sending}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Phone className="w-4 h-4 mr-1" />
                  )}
                  Send SOS
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EmergencySOS;
