import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Eye, EyeOff, UserPlus, LogIn, Heart, Shield, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  role: z.enum(["patient", "caregiver", "clinician"], { required_error: "Please select a role" }),
});

type AuthView = "login" | "register" | "forgot";

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) { toast.error(result.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); }
    else { toast.success("Welcome back!"); navigate("/"); }
  };

  const handleRegister = async () => {
    const result = registerSchema.safeParse({ email, password, fullName, role });
    if (!result.success) { toast.error(result.error.errors[0].message); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
    });
    if (error) { setLoading(false); toast.error(error.message); return; }
    if (data.user) {
      await supabase.from("user_roles").insert({ user_id: data.user.id, role: role as any });
    }
    setLoading(false);
    toast.success("Account created! Please check your email to verify your account.");
  };

  const handleForgotPassword = async () => {
    if (!email.trim() || !z.string().email().safeParse(email).success) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); }
    else { toast.success("Password reset link sent! Check your email."); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg gradient-calm flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-serif text-2xl text-foreground">MemoGuard</span>
        </div>

        <Card className="shadow-elevated">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-serif">
              {view === "login" ? "Welcome Back" : view === "register" ? "Create Account" : "Reset Password"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {view === "login" ? "Sign in to your account" : view === "register" ? "Register to get started" : "Enter your email to receive a reset link"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {view === "register" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">
                        <span className="flex items-center gap-2"><Heart className="w-4 h-4" /> Patient</span>
                      </SelectItem>
                      <SelectItem value="caregiver">
                        <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Caregiver</span>
                      </SelectItem>
                      <SelectItem value="clinician">
                        <span className="flex items-center gap-2"><Brain className="w-4 h-4" /> Clinician</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>

            {view !== "forgot" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {view === "login" && (
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={(e) => e.key === "Enter" && (view === "login" ? handleLogin() : handleRegister())}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {view === "forgot" ? (
              <Button onClick={handleForgotPassword} disabled={loading} className="w-full" size="lg">
                {loading ? <span className="animate-pulse">Sending...</span> : <><Mail className="w-5 h-5 mr-2" />Send Reset Link</>}
              </Button>
            ) : (
              <Button
                onClick={view === "login" ? handleLogin : handleRegister}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : view === "login" ? (
                  <><LogIn className="w-5 h-5 mr-2" />Sign In</>
                ) : (
                  <><UserPlus className="w-5 h-5 mr-2" />Create Account</>
                )}
              </Button>
            )}

            <div className="text-center space-y-1">
              {view === "forgot" ? (
                <button
                  onClick={() => setView("login")}
                  className="text-sm text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to sign in
                </button>
              ) : (
                <button
                  onClick={() => setView(view === "login" ? "register" : "login")}
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  {view === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
};

export default Auth;
