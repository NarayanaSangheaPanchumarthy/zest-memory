import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, Navigation, AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import AppHeader from "@/components/AppHeader";
import EmergencySOS from "@/components/EmergencySOS";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const patientIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
}

interface PatientLocation {
  latitude: number;
  longitude: number;
  recorded_at: string;
}

// Component to recenter map
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
};

const SafetyMap = () => {
  const { user } = useAuth();
  const [zones, setZones] = useState<GeofenceZone[]>([]);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [wanderingAlert, setWanderingAlert] = useState(false);
  const [newZone, setNewZone] = useState({ name: "", radius: 200 });
  const [showAddZone, setShowAddZone] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Load geofence zones
  useEffect(() => {
    if (!user) return;
    supabase
      .from("geofence_zones")
      .select("*")
      .eq("patient_id", user.id)
      .eq("is_active", true)
      .then(({ data }) => {
        if (data) setZones(data as GeofenceZone[]);
      });
  }, [user]);

  // Check if patient is outside all geofence zones
  const checkWandering = useCallback(
    (lat: number, lng: number) => {
      if (zones.length === 0) return;
      const isInsideAny = zones.some((zone) => {
        const distance = getDistance(lat, lng, zone.latitude, zone.longitude);
        return distance <= zone.radius_meters;
      });
      if (!isInsideAny && !wanderingAlert) {
        setWanderingAlert(true);
        sendWanderingAlert(lat, lng);
      } else if (isInsideAny) {
        setWanderingAlert(false);
      }
    },
    [zones, wanderingAlert]
  );

  // Watch GPS position
  useEffect(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCurrentPos({ lat, lng });
        checkWandering(lat, lng);

        // Save location to DB
        if (user) {
          supabase.from("patient_locations").insert({
            patient_id: user.id,
            latitude: lat,
            longitude: lng,
            accuracy: pos.coords.accuracy,
          });
        }
      },
      (err) => {
        console.warn("GPS error:", err.message);
        // Fallback position for demo
        setCurrentPos({ lat: 40.7128, lng: -74.006 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user, checkWandering]);

  const sendWanderingAlert = async (lat: number, lng: number) => {
    if (!user) return;
    try {
      await supabase.from("emergency_alerts").insert({
        patient_id: user.id,
        alert_type: "wandering",
        severity: "high",
        message: `⚠️ Wandering detected! Patient is outside safe zones. Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      });

      // Notify assigned caregivers/clinicians
      const { data: assignments } = await supabase
        .from("patient_assignments")
        .select("assigned_user_id")
        .eq("patient_id", user.id);

      if (assignments && assignments.length > 0) {
        await supabase.from("notifications").insert(
          assignments.map((a) => ({
            user_id: a.assigned_user_id,
            title: "⚠️ Wandering Alert",
            message: `Patient has left safe zone! Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            type: "warning",
            related_patient_id: user.id,
          }))
        );
      }

      toast.warning("You've left your safe zone! Caregivers have been notified.");
    } catch (e) {
      console.error(e);
    }
  };

  const addGeofenceZone = async () => {
    if (!user || !currentPos || !newZone.name.trim()) return;

    const { data, error } = await supabase
      .from("geofence_zones")
      .insert({
        patient_id: user.id,
        name: newZone.name.trim(),
        latitude: currentPos.lat,
        longitude: currentPos.lng,
        radius_meters: newZone.radius,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add safe zone");
      return;
    }

    setZones((prev) => [...prev, data as GeofenceZone]);
    setNewZone({ name: "", radius: 200 });
    setShowAddZone(false);
    toast.success("Safe zone added!");
  };

  const removeZone = async (id: string) => {
    await supabase.from("geofence_zones").update({ is_active: false }).eq("id", id);
    setZones((prev) => prev.filter((z) => z.id !== id));
    toast.success("Safe zone removed");
  };

  const mapCenter = currentPos || { lat: 40.7128, lng: -74.006 };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-title font-serif text-foreground flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              Safety & Location
            </h1>
            <p className="text-muted-foreground text-sm mt-1">GPS tracking, geofencing & wandering detection</p>
          </div>
        </motion.div>

        {/* Wandering Alert Banner */}
        {wanderingAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
            <div>
              <p className="font-medium text-destructive">Wandering Detected!</p>
              <p className="text-sm text-muted-foreground">You are outside your safe zones. Caregivers have been notified.</p>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="shadow-card overflow-hidden">
              <div className="h-[500px] relative">
                <MapContainer
                  center={[mapCenter.lat, mapCenter.lng]}
                  zoom={15}
                  className="h-full w-full z-0"
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap lat={mapCenter.lat} lng={mapCenter.lng} />

                  {/* Patient marker */}
                  {currentPos && (
                    <Marker position={[currentPos.lat, currentPos.lng]} icon={patientIcon}>
                      <Popup>
                        <strong>📍 Your Location</strong>
                        <br />
                        {currentPos.lat.toFixed(5)}, {currentPos.lng.toFixed(5)}
                      </Popup>
                    </Marker>
                  )}

                  {/* Geofence zones */}
                  {zones.map((zone) => (
                    <Circle
                      key={zone.id}
                      center={[zone.latitude, zone.longitude]}
                      radius={zone.radius_meters}
                      pathOptions={{
                        color: "hsl(200, 35%, 45%)",
                        fillColor: "hsl(200, 35%, 45%)",
                        fillOpacity: 0.15,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <strong>🛡️ {zone.name}</strong>
                        <br />
                        Radius: {zone.radius_meters}m
                      </Popup>
                    </Circle>
                  ))}
                </MapContainer>
              </div>
            </Card>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Current location */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  Current Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentPos ? (
                  <div className="text-sm text-muted-foreground">
                    <p>Lat: {currentPos.lat.toFixed(5)}</p>
                    <p>Lng: {currentPos.lng.toFixed(5)}</p>
                    <p className={`mt-2 font-medium ${wanderingAlert ? "text-destructive" : "text-sage"}`}>
                      {wanderingAlert ? "⚠️ Outside safe zone" : "✅ Inside safe zone"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Acquiring GPS...</p>
                )}
              </CardContent>
            </Card>

            {/* Safe Zones */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Safe Zones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {zones.length === 0 && (
                  <p className="text-sm text-muted-foreground">No safe zones set. Add one to enable wandering detection.</p>
                )}
                {zones.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{zone.name}</p>
                      <p className="text-xs text-muted-foreground">{zone.radius_meters}m radius</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeZone(zone.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}

                {showAddZone ? (
                  <div className="space-y-3 border-t border-border pt-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Zone Name</Label>
                      <Input
                        placeholder="e.g., Home, Hospital"
                        value={newZone.name}
                        onChange={(e) => setNewZone((p) => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Radius (meters)</Label>
                      <Input
                        type="number"
                        min={50}
                        max={5000}
                        value={newZone.radius}
                        onChange={(e) => setNewZone((p) => ({ ...p, radius: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addGeofenceZone} className="flex-1">
                        Save Zone
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddZone(false)}>
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Zone will be centered on your current location.</p>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setShowAddZone(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Safe Zone
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warm-amber" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentAlerts />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <EmergencySOS />
    </div>
  );
};

const RecentAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("emergency_alerts")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setAlerts(data);
      });

    // Subscribe to real-time alerts
    const channel = supabase
      .channel("emergency-alerts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "emergency_alerts", filter: `patient_id=eq.${user.id}` },
        (payload) => {
          setAlerts((prev) => [payload.new as any, ...prev].slice(0, 5));
          toast.warning("New alert received!");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (alerts.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent alerts</p>;
  }

  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div
          key={a.id}
          className={`rounded-lg px-3 py-2 text-xs ${
            a.severity === "critical"
              ? "bg-destructive/10 text-destructive"
              : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
          }`}
        >
          <p className="font-medium">{a.alert_type === "sos" ? "🚨 SOS" : "⚠️ Wandering"}</p>
          <p className="mt-0.5 opacity-80">{new Date(a.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

// Haversine distance in meters
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default SafetyMap;
