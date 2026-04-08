import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Home, Heart, LayoutDashboard, LogOut, Menu, X, User, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, hasRole, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { to: "/listings", label: "Listings", show: true },
    { to: "/favorites", label: "Favorites", icon: Heart, show: !!user },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: hasRole("agent") || hasRole("admin") },
    { to: "/admin", label: "Admin", icon: ShieldCheck, show: hasRole("admin") },
  ].filter((l) => l.show);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Home className="h-4 w-4" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">EstateVue</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
          <div className="ml-3 h-6 w-px bg-border" />
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {(profile?.full_name || user.email || "?")[0].toUpperCase()}
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4 mr-1.5" />Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 ml-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Login</Button>
              <Button size="sm" onClick={() => navigate("/register")}>Register</Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden rounded-lg p-2 hover:bg-muted transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-card p-4 md:hidden space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.icon && <link.icon className="h-4 w-4" />}
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t mt-2">
            {user ? (
              <Button variant="outline" size="sm" className="w-full" onClick={() => { handleSignOut(); setOpen(false); }}>
                <LogOut className="h-4 w-4 mr-1.5" />Logout
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { navigate("/login"); setOpen(false); }}>Login</Button>
                <Button size="sm" className="flex-1" onClick={() => { navigate("/register"); setOpen(false); }}>Register</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
