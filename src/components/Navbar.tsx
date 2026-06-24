"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Film, Home, User, LogOut, Moon, Sun, Menu, X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const navLinks = [
    { href: "/", label: "Home", icon: <Home size={18} /> },
    { href: "/movies", label: "Movies", icon: <Film size={18} /> },
    { href: "/profile", label: "Profile", icon: <User size={18} /> },
  ];

  const linkStyle = (href: string) => ({
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 14px", borderRadius: "8px",
    fontWeight: pathname === href ? "bold" : "normal" as any,
    color: pathname === href ? "var(--color-maroon)" : "var(--color-text)",
    backgroundColor: pathname === href ? "rgba(128,0,0,0.08)" : "transparent",
    transition: "all 0.2s", fontSize: "0.95rem", textDecoration: "none",
  });

  if (!user) return null;

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      backgroundColor: "var(--color-card)",
      borderBottom: "2px dashed var(--color-border)",
      padding: "0 24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>

        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Film size={28} color="var(--color-maroon)" />
          <span className="caveat" style={{ fontSize: "1.8rem", color: "var(--color-maroon)" }}>WatchKnot</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="desktop-nav">
          {user && navLinks.map(link => (
            <Link key={link.href} href={link.href} style={linkStyle(link.href)}>
              {link.icon} {link.label}
            </Link>
          ))}

          {user && (
            <Link href="/movies/add" style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "8px",
              backgroundColor: "var(--color-maroon)", color: "white",
              fontWeight: "bold", fontSize: "0.9rem", textDecoration: "none"
            }}>
              <Plus size={16} /> Add Movie
            </Link>
          )}

          {mounted && (
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{
              background: "none", border: "1px solid var(--color-border)",
              borderRadius: "8px", padding: "8px", cursor: "pointer",
              color: "var(--color-text)", display: "flex", alignItems: "center"
            }}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {user ? (
            <button onClick={handleSignOut} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "1px solid var(--color-border)",
              borderRadius: "8px", padding: "8px 14px", cursor: "pointer",
              color: "var(--color-text)", fontSize: "0.9rem"
            }}>
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <Link href="/login" style={{
              padding: "8px 20px", borderRadius: "8px",
              backgroundColor: "var(--color-maroon)", color: "white",
              fontWeight: "bold", fontSize: "0.9rem", textDecoration: "none"
            }}>
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: "none", background: "none", border: "none",
          cursor: "pointer", color: "var(--color-text)"
        }} className="mobile-menu-btn">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div style={{ borderTop: "1px dashed var(--color-border)", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {user && navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{ ...linkStyle(link.href), display: "flex" }}>
              {link.icon} {link.label}
            </Link>
          ))}
          {user && <Link href="/movies/add" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", backgroundColor: "var(--color-maroon)", color: "white", fontWeight: "bold", textDecoration: "none" }}><Plus size={16} /> Add Movie</Link>}
          {user && <button onClick={handleSignOut} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", background: "none", border: "1px solid var(--color-border)", cursor: "pointer", color: "var(--color-text)", width: "100%" }}><LogOut size={16} /> Sign Out</button>}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
