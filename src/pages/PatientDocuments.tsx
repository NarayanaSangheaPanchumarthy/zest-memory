import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Download, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Doc = { id: string; title: string; description: string | null; file_path: string | null; file_type: string | null; created_at: string };

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "gif", "doc", "docx"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;


const PatientDocuments = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDocs = async () => {
    if (!user) return;
    const { data } = await supabase.from("patient_documents").select("id, title, description, file_url, file_type, created_at").eq("patient_id", user.id).order("created_at", { ascending: false });
    // file_url stores the storage path, not a public URL
    if (data) setDocs(data.map(d => ({ ...d, file_path: d.file_url })));
  };

  useEffect(() => { fetchDocs(); }, [user]);

  const upload = async () => {
    if (!user || !title.trim()) { toast.error("Title is required"); return; }

    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error("File type not allowed. Use PDF, JPG, PNG, GIF, DOC or DOCX.");
        return;
      }
      if (file.size > MAX_FILE_BYTES) { toast.error("File must be under 10 MB"); return; }
    }

    setLoading(true);
    let fileUrl: string | null = null;
    let fileType: string | null = null;

    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
      const filePath = `${user.id}/${Date.now()}_${safeName}`;
      const { error: uploadErr } = await supabase.storage
        .from("patient-documents")
        .upload(filePath, file, { contentType: file.type, upsert: false });
      if (uploadErr) { toast.error("File upload failed"); setLoading(false); return; }
      // Store the path, not a public URL — we'll generate signed URLs on-the-fly
      fileUrl = filePath;
      fileType = file.type;
    }


    const { error } = await supabase.from("patient_documents").insert({
      patient_id: user.id, uploaded_by: user.id, title: title.trim(),
      description: description.trim() || null, file_url: fileUrl, file_type: fileType,
    });
    setLoading(false);
    if (error) toast.error("Failed to save document");
    else {
      toast.success("Document saved!");
      setShowForm(false); setTitle(""); setDescription(""); setFile(null);
      fetchDocs();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-heading text-foreground">Documents</h1>
            <p className="text-muted-foreground">Medical records & reports</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="hero" className="gap-2">
            <Plus className="w-4 h-4" /> Add Document
          </Button>
        </motion.div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="shadow-card">
              <CardHeader><CardTitle className="text-title">Upload Document</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={2} maxLength={500} />
                </div>
                <div className="space-y-2">
                  <Label>File (optional)</Label>
                  <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                </div>
                <Button onClick={upload} disabled={loading} className="w-full" variant="hero">
                  {loading ? "Uploading..." : "Save Document"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="space-y-3">
          {docs.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="shadow-card">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-calm-light flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-calm" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{d.title}</h3>
                    {d.description && <p className="text-sm text-muted-foreground">{d.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.file_type && <Badge variant="secondary" className="text-xs">{d.file_type.split("/")[1]?.toUpperCase()}</Badge>}
                    {d.file_path && (
                      <Button variant="ghost" size="icon" onClick={async () => {
                        const { data, error } = await supabase.storage.from("patient-documents").createSignedUrl(d.file_path!, 3600);
                        if (error || !data?.signedUrl) { toast.error("Failed to generate download link"); return; }
                        window.open(data.signedUrl, "_blank");
                      }}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {docs.length === 0 && !showForm && (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No documents uploaded yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientDocuments;
