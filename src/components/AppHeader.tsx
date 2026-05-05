import { Brain, Phone, Bell, MessageCircle, Settings, LogOut, Menu, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const roleNavItems: Record<string, { label: string; path: string }[]> = {
  patient: [
    { label: "Dashboard", path: "/patient" },
    { label: "Games", path: "/games" },
    { label: "Vitals", path: "/vitals" },
    { label: "Documents", path: "/documents" },
    { label: "Safety", path: "/safety" },
  ],
  caregiver: [
    { label: "Dashboard", path: "/caregiver" },
    { label: "Vitals", path: "/vitals" },
    { label: "Documents", path: "/documents" },
    { label: "Safety", path: "/safety" },
  ],
  clinician: [
    { label: "Dashboard", path: "/clinical" },
    { label: "Caregiver View", path: "/caregiver" },
    { label: "Vitals", path: "/vitals" },
    { label: "Documents", path: "/documents" },
    { label: "Safety", path: "/safety" },
    { label: "Games", path: "/games" },
    { label: "Audit Logs", path: "/audit-logs" },
    { label: "Security", path: "/admin/security" },
  ],
};

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, profile, role } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = role ? roleNavItems[role] || [] : [];

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("id", { count: "exact", head: true })
      .eq("user_id", user.id).eq("is_read", false)
      .then(({ count }) => setUnreadCount(count || 0));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 rounded-lg gradient-calm flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl text-foreground hidden sm:inline">MemoGuard</span>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/notifications")} className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/privacy")}>
            <Settings className="w-5 h-5" />
          </Button>
          {role === "patient" && (
            <Button variant="emergency" size="sm" className="gap-2" onClick={() => navigate("/safety")}>
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">SOS</span>
            </Button>
          )}
          {user && (
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
              <LogOut className="w-5 h-5" />
            </Button>
          )}
          <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMenuOpen(false); }}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname === item.path ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { navigate("/help"); setMenuOpen(false); }}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground"
          >
            Help Desk
          </button>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
