"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Film, Star, Plus, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MoviesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") fetchMovies();
  }, [status]);

  const fetchMovies = async () => {
    try {
      const res = await fetch("/api/movies");
      if (res.ok) {
        const data = await res.json();
        setMovies(data.movies || []);
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 className="animate-spin" size={40} color="var(--color-maroon)" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", backgroundColor: "var(--color-bg)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div>
            <h1 className="caveat" style={{ fontSize: "3.5rem", margin: 0 }}>🎬 My Movies</h1>
            <p style={{ color: "#888", marginTop: "4px" }}>{movies.length} film{movies.length !== 1 ? "s" : ""} in your collection</p>
          </div>
          <Link href="/movies/add" style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 24px", borderRadius: "12px",
            backgroundColor: "var(--color-maroon)", color: "white",
            fontWeight: "bold", fontSize: "1rem", textDecoration: "none"
          }}>
            <Plus size={20} /> Add Movie
          </Link>
        </div>

        {/* Empty State */}
        {movies.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <Film size={80} color="var(--color-border)" style={{ marginBottom: "20px" }} />
            <h2 className="caveat" style={{ fontSize: "2.5rem", marginBottom: "12px" }}>Your collection is empty!</h2>
            <p style={{ color: "#888", marginBottom: "30px" }}>Start adding movies you've watched or want to watch with friends.</p>
            <Link href="/movies/add" className="btn-primary" style={{ padding: "14px 32px", fontSize: "1.1rem", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <Plus size={20} /> Add Your First Movie
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
            {movies.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="cute-card"
                style={{ padding: "0", overflow: "hidden", cursor: "pointer" }}
                onClick={() => router.push(`/movies/${movie.id}`)}
              >
                {/* Poster */}
                <div style={{ width: "100%", aspectRatio: "2/3", backgroundColor: "var(--color-border)", position: "relative", overflow: "hidden" }}>
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: "8px" }}>
                      <Film size={40} color="#999" />
                      <span style={{ color: "#999", fontSize: "0.8rem" }}>No Poster</span>
                    </div>
                  )}
                  {/* Genre Badge */}
                  {movie.genre && (
                    <span style={{
                      position: "absolute", top: "8px", right: "8px",
                      backgroundColor: "var(--color-maroon)", color: "white",
                      padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold"
                    }}>
                      {movie.genre}
                    </span>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: "14px" }}>
                  <h3 className="caveat" style={{ fontSize: "1.3rem", margin: "0 0 6px 0", lineHeight: 1.2 }}>{movie.title}</h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {movie.year && (
                      <span style={{ fontSize: "0.85rem", color: "#888", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={12} /> {movie.year}
                      </span>
                    )}
                    {movie.rating && (
                      <span style={{ fontSize: "0.85rem", color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Star size={12} fill="#f59e0b" /> {movie.rating}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
