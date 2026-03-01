import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, MapPin, Heart, Brain, Users, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PrivacySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    share_location: false,
    share_vitals_with_caregiver: true,
    share_vitals_with_clinician: true,
    allow_ai_analysis: true,
    emergency_contacts_visible: true,
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("privacy_settings").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setSettings({
          share_location: data.share_location,
          share_vitals_with_caregiver: data.share_vitals_with_caregiver,
          share_vitals_with_clinician: data.share_vitals_with_clinician,
          allow_ai_analysis: data.allow_ai_analysis,
          emergency_contacts_visible: data.emergency_contacts_visible,
        });
      }
    });
  }, [user]);

  const updateSetting = async (key: keyof typeof settings, value: boolean) => {
    if (!user) return;
    setSettings((prev) => ({ ...prev, [key]: value }));
    const { error } = await supabase.from("privacy_settings").update({ [key]: value }).eq("user_id", user.id);
    if (error) toast.error("Failed to save setting");
    else toast.success("Privacy setting updated");
  };

  const privacyItems = [
    { key: "share_location" as const, label: "Share Location", desc: "Allow GPS tracking for safety monitoring", icon: MapPin },
    { key: "share_vitals_with_caregiver" as const, label: "Share Vitals with Caregiver", desc: "Allow your caregiver to view your health data", icon: Heart },
    { key: "share_vitals_with_clinician" as const, label: "Share Vitals with Clinician", desc: "Allow your doctor to access your vitals", icon: Users },
    { key: "allow_ai_analysis" as const, label: "AI Analysis", desc: "Allow AI to analyze your data for insights", icon: Brain },
    { key: "emergency_contacts_visible" as const, label: "Emergency Contacts Visible", desc: "Show emergency contacts to care team", icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-heading text-foreground">Privacy & Security</h1>
          <p className="text-muted-foreground">Control how your data is shared — HIPAA compliant</p>
        </motion.div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-title">
              <Shield className="w-5 h-5 text-primary" /> Data Sharing Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {privacyItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <Label className="font-medium text-foreground">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={(v) => updateSetting(item.key, v)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-title font-serif">HIPAA Compliance</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              All data is encrypted at rest and in transit. Your health information is protected under HIPAA regulations. 
              Access is restricted by role-based authentication. Full audit logs are maintained for all data access.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PrivacySettings;
