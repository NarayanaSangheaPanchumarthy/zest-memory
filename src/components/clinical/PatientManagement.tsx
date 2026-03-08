import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Eye, FileText, Trash2, UserPlus, Edit2,
  Activity, Brain, AlertTriangle, X, Save, Phone, MapPin,
  ChevronDown, ChevronUp, Filter, List
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PatientData {
  patient_id: string;
  full_name: string;
  phone?: string | null;
  latestVitals: any | null;
  cogScore: number | null;
  cogTrend: { date: string; accuracy: number }[];
  unresolvedAlerts: number;
}

interface Assignment {
  id: string;
  patient_id: string;
  assigned_user_id: string;
}

interface ProfileData {
  user_id: string;
  full_name: string;
  phone?: string | null;
}

interface RoleData {
  user_id: string;
  role: string;
}

interface Props {
  patients: PatientData[];
  allProfiles: ProfileData[];
  allRoles: RoleData[];
  assignments: Assignment[];
  allAlerts: any[];
  onReload: () => void;
  currentUserId: string;
}

const PatientManagement = ({
  patients, allProfiles, allRoles, assignments, allAlerts, onReload, currentUserId,
}: Props) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "alerts" | "clear">("all");
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedCaregiver, setSelectedCaregiver] = useState("");
  const [activeTab, setActiveTab] = useState("registry");

  const patientProfiles = allProfiles.filter((p) =>
    allRoles.some((r) => r.user_id === p.user_id && r.role === "patient")
  );
  const caregiverProfiles = allProfiles.filter((p) =>
    allRoles.some((r) => r.user_id === p.user_id && (r.role === "caregiver" || r.role === "clinician"))
  );

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "alerts" && p.unresolvedAlerts > 0) ||
      (filterStatus === "clear" && p.unresolvedAlerts === 0);
    return matchesSearch && matchesFilter;
  });

  const handleAssign = async () => {
    if (!selectedPatient || !selectedCaregiver) {
      toast.error("Please select both a patient and a caregiver/clinician");
      return;
    }
    const { error } = await supabase.from("patient_assignments").insert({
      patient_id: selectedPatient,
      assigned_user_id: selectedCaregiver,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Assignment created!");
    setAssignDialogOpen(false);
    setSelectedPatient("");
    setSelectedCaregiver("");
    onReload();
  };

  const removeAssignment = async (id: string) => {
    const { error } = await supabase.from("patient_assignments").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Assignment removed");
    onReload();
  };

  const startEdit = (patient: PatientData) => {
    setEditingPatient(patient.patient_id);
    setEditName(patient.full_name);
    setEditPhone(patient.phone || "");
  };

  const saveEdit = async () => {
    if (!editingPatient || !editName.trim()) {
      toast.error("Name is required");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editName.trim(), phone: editPhone.trim() || null })
      .eq("user_id", editingPatient);
    if (error) {
      toast.error("Failed to update profile");
      return;
    }
    toast.success("Patient profile updated");
    setEditingPatient(null);
    onReload();
  };

  const removePatient = async (patientId: string) => {
    // Remove all assignments for this patient
    const { error } = await supabase
      .from("patient_assignments")
      .delete()
      .eq("patient_id", patientId);
    if (error) {
      toast.error("Failed to remove patient assignments");
      return;
    }
    toast.success("Patient removed from your care list");
    onReload();
  };

  const getPatientAssignments = (patientId: string) =>
    assignments.filter((a) => a.patient_id === patientId);

  const getPatientAlerts = (patientId: string) =>
    allAlerts.filter((a) => a.patient_id === patientId && !a.is_resolved);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-title">
            <Users className="w-5 h-5 text-primary" />
            Patient Management
          </CardTitle>
          <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Assign Patient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Caregiver to Patient</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger><SelectValue placeholder="Select a patient" /></SelectTrigger>
                    <SelectContent>
                      {patientProfiles.map((p) => (
                        <SelectItem key={p.user_id} value={p.user_id}>
                          {p.full_name || p.user_id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Caregiver / Clinician</Label>
                  <Select value={selectedCaregiver} onValueChange={setSelectedCaregiver}>
                    <SelectTrigger><SelectValue placeholder="Select a caregiver" /></SelectTrigger>
                    <SelectContent>
                      {caregiverProfiles.map((p) => (
                        <SelectItem key={p.user_id} value={p.user_id}>
                          {p.full_name || p.user_id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssign} className="w-full">Create Assignment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="alerts">With Alerts</SelectItem>
              <SelectItem value="clear">Clear Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="registry" className="text-xs sm:text-sm">Registry ({filteredPatients.length})</TabsTrigger>
            <TabsTrigger value="list" className="text-xs sm:text-sm">
              <List className="w-4 h-4 mr-1" /> List
            </TabsTrigger>
            <TabsTrigger value="assignments" className="text-xs sm:text-sm">Assigns ({assignments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="registry">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">
                  {patients.length === 0
                    ? "No patients assigned yet"
                    : "No patients match your search"}
                </p>
                <p className="text-sm mt-1">
                  {patients.length === 0
                    ? 'Use "Assign Patient" to add patients to your care list.'
                    : "Try adjusting your search or filter."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((p, i) => {
                  const isExpanded = expandedPatient === p.patient_id;
                  const patientAssignments = getPatientAssignments(p.patient_id);
                  const patientAlerts = getPatientAlerts(p.patient_id);

                  return (
                    <motion.div
                      key={p.patient_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border border-border rounded-xl overflow-hidden"
                    >
                      {/* Patient Row */}
                      <div
                        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => setExpandedPatient(isExpanded ? null : p.patient_id)}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {p.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{p.full_name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {p.cogScore != null && (
                              <span className="flex items-center gap-1">
                                <Brain className="w-3 h-3" /> {Math.round(p.cogScore)}%
                              </span>
                            )}
                            {p.latestVitals?.pulse_rate && (
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" /> {p.latestVitals.pulse_rate} bpm
                              </span>
                            )}
                            <span>{patientAssignments.length} caregiver(s)</span>
                          </div>
                        </div>
                        {p.unresolvedAlerts > 0 ? (
                          <Badge className="bg-coral-light text-coral shrink-0">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {p.unresolvedAlerts}
                          </Badge>
                        ) : (
                          <Badge className="bg-sage-light text-sage shrink-0">Clear</Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </div>

                      {/* Expanded Detail */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1 border-t border-border space-y-4">
                              {/* Quick Stats */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <p className="text-xs text-muted-foreground">Cognitive</p>
                                  <p className="text-lg font-serif text-foreground">
                                    {p.cogScore != null ? `${Math.round(p.cogScore)}%` : "—"}
                                  </p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <p className="text-xs text-muted-foreground">Heart Rate</p>
                                  <p className="text-lg font-serif text-foreground">
                                    {p.latestVitals?.pulse_rate || "—"}
                                  </p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <p className="text-xs text-muted-foreground">Blood Pressure</p>
                                  <p className="text-lg font-serif text-foreground">
                                    {p.latestVitals?.blood_pressure_systolic
                                      ? `${p.latestVitals.blood_pressure_systolic}/${p.latestVitals.blood_pressure_diastolic}`
                                      : "—"}
                                  </p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                  <p className="text-xs text-muted-foreground">O₂ Sat</p>
                                  <p className="text-lg font-serif text-foreground">
                                    {p.latestVitals?.oxygen_saturation
                                      ? `${Number(p.latestVitals.oxygen_saturation)}%`
                                      : "—"}
                                  </p>
                                </div>
                              </div>

                              {/* Active Alerts */}
                              {patientAlerts.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-foreground">Active Alerts</p>
                                  {patientAlerts.map((alert) => (
                                    <div
                                      key={alert.id}
                                      className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                                        alert.severity === "critical" ? "bg-coral-light" : "bg-amber-light"
                                      }`}
                                    >
                                      <AlertTriangle className="w-3 h-3 shrink-0" />
                                      <span className="flex-1 capitalize">{alert.alert_type}</span>
                                      <span className="text-muted-foreground">
                                        {new Date(alert.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Assigned Caregivers */}
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-foreground">Assigned Caregivers</p>
                                {patientAssignments.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No caregivers assigned</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {patientAssignments.map((a) => {
                                      const name = allProfiles.find((pr) => pr.user_id === a.assigned_user_id)?.full_name || "Unknown";
                                      const role = allRoles.find((r) => r.user_id === a.assigned_user_id)?.role || "—";
                                      return (
                                        <Badge key={a.id} variant="secondary" className="gap-1 pr-1">
                                          {name} <span className="text-muted-foreground capitalize">({role})</span>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); removeAssignment(a.id); }}
                                            className="ml-1 hover:text-destructive transition-colors"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate("/vitals")}>
                                  <Eye className="w-3 h-3" /> View Vitals
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate("/documents")}>
                                  <FileText className="w-3 h-3" /> Documents
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => navigate("/safety")}>
                                  <MapPin className="w-3 h-3" /> Location
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => startEdit(p)}>
                                      <Edit2 className="w-3 h-3" /> Edit Profile
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Patient Profile</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-2">
                                      <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <Input
                                          value={editName}
                                          onChange={(e) => setEditName(e.target.value)}
                                          placeholder="Patient name"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Phone</Label>
                                        <Input
                                          value={editPhone}
                                          onChange={(e) => setEditPhone(e.target.value)}
                                          placeholder="Phone number"
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button onClick={saveEdit} className="gap-1">
                                        <Save className="w-4 h-4" /> Save Changes
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="gap-1 text-xs text-destructive hover:text-destructive ml-auto">
                                      <Trash2 className="w-3 h-3" /> Remove
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Patient</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will remove all caregiver assignments for {p.full_name}. The patient account will remain active.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        onClick={() => removePatient(p.patient_id)}
                                      >
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="list">
            {patientProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No patients found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Assigned Caregivers</TableHead>
                      <TableHead>Assigned Clinicians</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientProfiles.map((patient) => {
                      const patientAssigns = assignments.filter((a) => a.patient_id === patient.user_id);
                      const assignedCaregivers = patientAssigns
                        .filter((a) => allRoles.find((r) => r.user_id === a.assigned_user_id)?.role === "caregiver")
                        .map((a) => allProfiles.find((p) => p.user_id === a.assigned_user_id)?.full_name || "Unknown");
                      const assignedClinicians = patientAssigns
                        .filter((a) => allRoles.find((r) => r.user_id === a.assigned_user_id)?.role === "clinician")
                        .map((a) => allProfiles.find((p) => p.user_id === a.assigned_user_id)?.full_name || "Unknown");

                      return (
                        <TableRow key={patient.user_id}>
                          <TableCell className="font-medium">{patient.full_name || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{patient.phone || "—"}</TableCell>
                          <TableCell>
                            {assignedCaregivers.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {assignedCaregivers.map((name, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{name}</Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {assignedClinicians.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {assignedClinicians.map((name, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{name}</Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>


          <TabsContent value="assignments">
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No assignments yet. Click "Assign Patient" to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {assignments.map((a) => {
                  const patientName = allProfiles.find((p) => p.user_id === a.patient_id)?.full_name || a.patient_id.slice(0, 8);
                  const caregiverName = allProfiles.find((p) => p.user_id === a.assigned_user_id)?.full_name || a.assigned_user_id.slice(0, 8);
                  const caregiverRole = allRoles.find((r) => r.user_id === a.assigned_user_id)?.role || "unknown";
                  return (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">{patientName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{patientName}</p>
                          <p className="text-xs text-muted-foreground">Patient</p>
                        </div>
                        <span className="text-muted-foreground">→</span>
                        <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-sage">{caregiverName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{caregiverName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{caregiverRole}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeAssignment(a.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PatientManagement;
