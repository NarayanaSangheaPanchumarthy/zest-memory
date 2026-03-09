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

            {view !== "forgot" && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    const { lovable } = await import("@/integrations/lovable/index");
                    const { error } = await lovable.auth.signInWithOAuth("google", {
                      redirect_uri: window.location.origin,
                    });
                    if (error) toast.error(error.message);
                  }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Sign in with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    const { lovable } = await import("@/integrations/lovable/index");
                    const { error } = await lovable.auth.signInWithOAuth("apple", {
                      redirect_uri: window.location.origin,
                    });
                    if (error) toast.error(error.message);
                  }}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Sign in with Apple
                </Button>
              </>
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
