"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Film, Star, Plus, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MoviesPage() {
  const { user, loading: authLoading, getToken } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && user) fetchMovies();
  }, [user, authLoading]);

  const fetchMovies = async () => {
    const token = await getToken();
    const res = await fetch("/api/movies", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setMovies(data.movies || []);
    }
    setLoading(false);
  };

  const [editingMovie, setEditingMovie] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const GENRES = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Fantasy", "Horror", "Musical", "Mystery", "Romance", "Sci-Fi", "Thriller", "Western"];

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/movies/${editingMovie.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingMovie),
      });
      if (res.ok) {
        setMovies(movies.map((m) => (m.id === editingMovie.id ? editingMovie : m)));
        setEditingMovie(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)", outline: "none", backgroundColor: "var(--color-bg)", color: "var(--color-text)", marginBottom: "12px" };

  if (authLoading || loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><Loader2 className="animate-spin" size={40} color="var(--color-maroon)" /></div>;
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", padding: "40px 20px", backgroundColor: "var(--color-bg)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="caveat" style={{ fontSize: "3.5rem", margin: 0 }}>🎬 My Movies</h1>
            <p style={{ color: "#888", marginTop: "4px" }}>{movies.length} film{movies.length !== 1 ? "s" : ""} in your collection</p>
          </div>
          <Link href="/movies/add" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "12px", backgroundColor: "var(--color-maroon)", color: "white", fontWeight: "bold", fontSize: "1rem", textDecoration: "none" }}>
            <Plus size={20} /> Add Movie
          </Link>
        </div>

        {movies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Film size={80} color="var(--color-border)" style={{ marginBottom: "20px" }} />
            <h2 className="caveat" style={{ fontSize: "2.5rem", marginBottom: "12px" }}>Your collection is empty!</h2>
            <p style={{ color: "#888", marginBottom: "30px" }}>Start adding movies you've watched.</p>
            <Link href="/movies/add" className="btn-primary" style={{ padding: "14px 32px", fontSize: "1.1rem", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <Plus size={20} /> Add Your First Movie
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "24px" }}>
            {movies.map((movie, i) => (
              <motion.div key={movie.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="cute-card group" style={{ padding: 0, overflow: "hidden", cursor: "pointer", position: "relative" }}>
                <div onClick={() => router.push(`/movies/${movie.id}`)}>
                  <div style={{ width: "100%", aspectRatio: "2/3", backgroundColor: "#e0d8b0", position: "relative", overflow: "hidden" }}>
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}><Film size={40} color="#999" /></div>
                    )}
                    {movie.genre && (
                      <span style={{ position: "absolute", top: "8px", left: "8px", backgroundColor: "var(--color-maroon)", color: "white", padding: "3px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "bold", zIndex: 10 }}>{movie.genre}</span>
                    )}
                  </div>
                  <div style={{ padding: "14px" }}>
                    <h3 className="caveat" style={{ fontSize: "1.2rem", margin: "0 0 6px 0", lineHeight: 1.2 }}>{movie.title}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {movie.year && <span style={{ fontSize: "0.8rem", color: "#888", display: "flex", alignItems: "center", gap: "3px" }}><Calendar size={11} />{movie.year}</span>}
                      {movie.rating && <span style={{ fontSize: "0.8rem", color: "#f59e0b", display: "flex", alignItems: "center", gap: "3px" }}><Star size={11} fill="#f59e0b" />{movie.rating}</span>}
                    </div>
                  </div>
                </div>
                
                {/* Edit Button overlay */}
                {user?.uid === movie.addedById && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingMovie(movie); }} 
                    style={{ position: "absolute", top: "8px", right: "8px", background: "white", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", zIndex: 20 }}
                  >
                    ✏️
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        {editingMovie && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="cute-card" style={{ width: "100%", maxWidth: "500px", padding: "30px", backgroundColor: "var(--color-bg)", maxHeight: "90vh", overflowY: "auto" }}>
              <h2 className="caveat" style={{ fontSize: "2rem", marginBottom: "20px", marginTop: 0 }}>Edit Movie</h2>
              <form onSubmit={handleEdit}>
                <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Title</label>
                <input type="text" value={editingMovie.title} onChange={e => setEditingMovie({ ...editingMovie, title: e.target.value })} required style={inputStyle} />
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Year</label>
                    <input type="number" value={editingMovie.year || ""} onChange={e => setEditingMovie({ ...editingMovie, year: Number(e.target.value) })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Rating</label>
                    <input type="number" step="0.1" value={editingMovie.rating || ""} onChange={e => setEditingMovie({ ...editingMovie, rating: Number(e.target.value) })} style={inputStyle} />
                  </div>
                </div>

                <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Genre</label>
                <select value={editingMovie.genre || ""} onChange={e => setEditingMovie({ ...editingMovie, genre: e.target.value })} style={{ ...inputStyle, appearance: "none" as any }}>
                  <option value="">Select a genre...</option>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>

                <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Poster URL</label>
                <input type="url" value={editingMovie.posterUrl || ""} onChange={e => setEditingMovie({ ...editingMovie, posterUrl: e.target.value })} style={inputStyle} />

                <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Description</label>
                <textarea value={editingMovie.description || ""} onChange={e => setEditingMovie({ ...editingMovie, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" as any }} />

                <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                  <button type="button" onClick={() => setEditingMovie(null)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "transparent", cursor: "pointer", fontWeight: "bold" }}>Cancel</button>
                  <button type="submit" disabled={editLoading} className="btn-primary" style={{ flex: 1, padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {editLoading ? <Loader2 size={18} className="animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
