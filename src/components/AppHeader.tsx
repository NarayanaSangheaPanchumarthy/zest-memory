import { Brain, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Patient", path: "/patient" },
  { label: "Caregiver", path: "/caregiver" },
  { label: "Clinical", path: "/clinical" },
];

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 rounded-lg gradient-calm flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl text-foreground">MemoGuard</span>
        </button>

        <nav className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <Button variant="emergency" size="sm" className="gap-2">
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">Emergency</span>
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
