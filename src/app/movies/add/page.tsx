"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Film, Star, Calendar, Tag, FileText, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const GENRES = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Fantasy", "Horror", "Musical", "Mystery", "Romance", "Sci-Fi", "Thriller", "Western"];

export default function AddMoviePage() {
  const { user, loading: authLoading, getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", year: "", genre: "", posterUrl: "", rating: "", description: "" });

  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const handleScrape = async () => {
    if (!scrapeUrl) return;
    setScraping(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/movies/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: scrapeUrl }),
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server timeout or unexpected response. You can manually type the movie details below.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to scrape");

      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        year: data.year ? String(data.year) : prev.year,
        genre: GENRES.includes(data.genre) ? data.genre : prev.genre,
        posterUrl: data.posterUrl || prev.posterUrl,
        rating: data.rating ? String(data.rating) : prev.rating,
        description: data.description || prev.description,
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      router.push("/movies");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "11px 11px 11px 38px", borderRadius: "8px", border: "1px solid var(--color-border)", outline: "none", fontFamily: "var(--font-inter)", backgroundColor: "var(--color-bg)", color: "var(--color-text)" };

  if (authLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><Loader2 className="animate-spin" size={40} color="var(--color-maroon)" /></div>;

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", padding: "40px 20px", backgroundColor: "var(--color-bg)" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Link href="/movies" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#888", marginBottom: "24px", fontSize: "0.9rem", textDecoration: "none" }}>
          <ArrowLeft size={16} /> Back to Movies
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="cute-card">
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <Film size={40} color="var(--color-maroon)" style={{ marginBottom: "10px" }} />
            <h1 className="caveat" style={{ fontSize: "3rem", margin: 0 }}>Add a Movie</h1>
            <p style={{ color: "#888", marginTop: "4px" }}>Add a film to your collection</p>
          </div>

          {error && <p style={{ color: "red", textAlign: "center", marginBottom: "16px", fontSize: "0.9rem" }}>{error}</p>}

          <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "var(--color-bg)", borderRadius: "10px", border: "2px dashed var(--color-border)" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px", fontSize: "0.9rem" }}>Auto-Fill via Link (IMDb, TMDB)</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="url" placeholder="https://..." value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} style={{ ...inputStyle, padding: "11px" }} />
              <button type="button" onClick={handleScrape} disabled={scraping || !scrapeUrl} className="btn-primary" style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                {scraping ? <Loader2 size={18} className="animate-spin" /> : "Auto-Fill"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px", fontSize: "0.9rem" }}>Movie Title *</label>
              <div style={{ position: "relative" }}>
                <Film size={18} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                <input type="text" placeholder="e.g. The Dark Knight" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px", fontSize: "0.9rem" }}>Year</label>
                <div style={{ position: "relative" }}>
                  <Calendar size={18} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                  <input type="number" placeholder="2024" value={form.year} min="1900" max="2030" onChange={e => setForm({ ...form, year: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px", fontSize: "0.9rem" }}>Rating (1-10)</label>
                <div style={{ position: "relative" }}>
                  <Star size={18} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                  <input type="number" placeholder="8.5" value={form.rating} min="1" max="10" step="0.1" onChange={e => setForm({ ...form, rating: e.target.value })} style={inputStyle} />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px", fontSize: "0.9rem" }}>Genre</label>
              <div style={{ position: "relative" }}>
                <Tag size={18} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                <select value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} style={{ ...inputStyle, appearance: "none" as any }}>
                  <option value="">Select a genre...</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px", fontSize: "0.9rem" }}>Poster Image URL</label>
              <div style={{ position: "relative" }}>
                <Film size={18} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                <input type="url" placeholder="https://..." value={form.posterUrl} onChange={e => setForm({ ...form, posterUrl: e.target.value })} style={inputStyle} />
              </div>
              {form.posterUrl && <div style={{ marginTop: "8px", borderRadius: "8px", overflow: "hidden", height: "120px", width: "80px" }}><img src={form.posterUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px", fontSize: "0.9rem" }}>Your Review / Notes</label>
              <div style={{ position: "relative" }}>
                <FileText size={18} style={{ position: "absolute", left: "10px", top: "14px", color: "#999" }} />
                <textarea placeholder="What did you think?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" as any }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: "14px", fontSize: "1.1rem", borderRadius: "10px", marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {loading ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <><Film size={20} /> Add to Collection</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
