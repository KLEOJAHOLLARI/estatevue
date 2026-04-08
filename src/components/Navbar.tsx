import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Home, Heart, LayoutDashboard, LogOut, Menu, X, User } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, hasRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-heading text-xl font-bold text-foreground">EstateVue</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/listings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Listings
          </Link>
          {user && (
            <Link to="/favorites" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Heart className="h-4 w-4 inline mr-1" />Favorites
            </Link>
          )}
          {(hasRole("agent") || hasRole("admin")) && (
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <LayoutDashboard className="h-4 w-4 inline mr-1" />Dashboard
            </Link>
          )}
          {hasRole("admin") && (
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground"><User className="h-4 w-4 inline mr-1" />{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>Login</Button>
              <Button size="sm" onClick={() => navigate("/register")}>Register</Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t bg-card p-4 md:hidden space-y-3">
          <Link to="/listings" className="block text-sm font-medium" onClick={() => setOpen(false)}>Listings</Link>
          {user && <Link to="/favorites" className="block text-sm font-medium" onClick={() => setOpen(false)}>Favorites</Link>}
          {(hasRole("agent") || hasRole("admin")) && (
            <Link to="/dashboard" className="block text-sm font-medium" onClick={() => setOpen(false)}>Dashboard</Link>
          )}
          {user ? (
            <Button variant="outline" size="sm" className="w-full" onClick={() => { handleSignOut(); setOpen(false); }}>Logout</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { navigate("/login"); setOpen(false); }}>Login</Button>
              <Button size="sm" className="flex-1" onClick={() => { navigate("/register"); setOpen(false); }}>Register</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
