"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Loader2 className="animate-spin" size={40} color="var(--color-maroon)" />
      </div>
    );
  }

  return (
    <main style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", minHeight: "calc(100vh - 64px)" }}>
      <div className="cute-card" style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 className="caveat" style={{ fontSize: "4rem", marginBottom: "10px" }}>Welcome to WatchKnot</h1>
        <p style={{ fontSize: "1.2rem", color: "var(--color-maroon)", marginBottom: "30px" }}>
          Hi {user.displayName || "Movie Lover"}! A cozy, vintage-aesthetic social platform for friends to collect, share, and watch movies together.
        </p>
        <Link href="/movies">
          <button className="btn-primary" style={{ fontSize: "1.2rem", padding: "12px 24px" }}>Go to My Movies</button>
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div className="cute-card">
          <h2 className="caveat" style={{ fontSize: "2rem", marginBottom: "10px" }}>Movie Journals</h2>
          <p>Collect your favorite movies and write personalized, cute journal entries for each one.</p>
        </div>
        <div className="cute-card">
          <h2 className="caveat" style={{ fontSize: "2rem", marginBottom: "10px" }}>Digital Tickets</h2>
          <p>Book beautifully crafted vintage digital movie tickets complete with generated personal messages.</p>
        </div>
        <div className="cute-card">
          <h2 className="caveat" style={{ fontSize: "2rem", marginBottom: "10px" }}>Watch Together</h2>
          <p>Sync your screen with friends in perfectly timed real-time watch rooms with live chat.</p>
        </div>
        <div className="cute-card">
          <h2 className="caveat" style={{ fontSize: "2rem", marginBottom: "10px" }}>Aesthetic Vibe</h2>
          <p>Wrapped in a warm maroon and cream color palette with handwritten Caveat typography.</p>
        </div>
      </div>
    </main>
  );
}
