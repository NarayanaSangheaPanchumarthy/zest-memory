import { useState } from "react";
import { Brain, FileText, AlertTriangle, TrendingDown, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const analysisTypes = [
  { value: "risk_assessment", label: "Risk Assessment", icon: AlertTriangle, color: "text-coral" },
  { value: "treatment_suggestions", label: "Treatment Suggestions", icon: Sparkles, color: "text-sage" },
  { value: "report", label: "Clinical Report", icon: FileText, color: "text-primary" },
  { value: "cognitive_prediction", label: "Cognitive Prediction", icon: TrendingDown, color: "text-lavender" },
];

interface Props {
  patients: { patient_id: string; full_name: string }[];
}

const ClinicalAIPanel = ({ patients }: Props) => {
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.patient_id || "");
  const [analysisType, setAnalysisType] = useState("risk_assessment");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    if (!selectedPatient) { toast.error("Select a patient"); return; }
    setLoading(true);
    setResult("");

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clinical-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: analysisType, patientId: selectedPatient }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Analysis failed" }));
        toast.error(err.error || "Analysis failed");
        setLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setResult(content);
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to run analysis");
    }
    setLoading(false);
  };

  const currentType = analysisTypes.find(t => t.value === analysisType);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-title">
          <Brain className="w-5 h-5 text-primary" />
          AI Clinical Analysis
          <Badge className="bg-primary/10 text-primary text-xs ml-2">AI Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.patient_id} value={p.patient_id}>{p.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {analysisTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={runAnalysis} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>

        {/* Analysis Type Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {analysisTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setAnalysisType(t.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${
                analysisType === t.value ? "bg-primary/10 ring-2 ring-primary" : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <t.icon className={`w-5 h-5 ${t.color}`} />
              <span className="text-xs font-medium text-foreground text-center">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Result */}
        {result && (
          <div className="border border-border rounded-xl p-4 bg-card max-h-[500px] overflow-y-auto">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Select a patient and analysis type</p>
            <p className="text-sm mt-1">AI will analyze patient data and generate clinical insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClinicalAIPanel;
