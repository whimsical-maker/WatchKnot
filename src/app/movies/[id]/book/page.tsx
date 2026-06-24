"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const SEATS_PER_ROW = 10;

const SeatIcon = ({ status }: { status: "available" | "booked" | "selected" }) => {
  let fill = "transparent";
  let stroke = "#555";
  
  if (status === "booked") {
    fill = "#333";
    stroke = "#444";
  } else if (status === "selected") {
    fill = "var(--color-maroon)";
    stroke = "var(--color-maroon)";
  } else {
    stroke = "#888";
  }
  
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round">
      <rect x="6" y="3" width="12" height="11" rx="2" />
      <path d="M4 11v6h16v-6" />
      <path d="M3 10h3v6H3z" />
      <path d="M18 10h3v6h-3z" />
      <path d="M6 17v2h12v-2" />
    </svg>
  );
};

export default function BookTicketPage() {
  const { user, loading: authLoading, getToken } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [movie, setMovie] = useState<any>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<{ row: string, number: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && user && id) {
      fetchData();
    }
  }, [user, authLoading, id]);

  const fetchData = async () => {
    try {
      const token = await getToken();
      const [seatsRes, movieRes] = await Promise.all([
        fetch(`/api/tickets/movie/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/movies/${id}`)
      ]);
      
      if (seatsRes.ok) {
        const data = await seatsRes.json();
        setBookedSeats(data.bookedSeats || []);
      }
      if (movieRes.ok) {
        const data = await movieRes.json();
        setMovie(data.movie);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (row: string, number: number) => {
    const seatId = `${row}${number}`;
    if (bookedSeats.includes(seatId)) return;

    const isSelected = selectedSeats.some(s => s.row === row && s.number === number);
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => !(s.row === row && s.number === number)));
    } else {
      if (selectedSeats.length >= 2) {
        alert("You can only book a maximum of 2 seats at once.");
        return;
      }
      setSelectedSeats(prev => [...prev, { row, number }]);
    }
  };

  const handleBookTickets = async () => {
    if (selectedSeats.length === 0) return;
    setBooking(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ movieId: id, seats: selectedSeats }),
      });
      
      const data = await res.json();
      if (res.ok) {
        router.push(`/movies/${id}/ticket`);
      } else {
        alert(data.message);
        fetchData();
        setSelectedSeats([]);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to book tickets");
    } finally {
      setBooking(false);
    }
  };

  if (loading || authLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#181414" }}>
      <Loader2 className="animate-spin" size={50} color="var(--color-maroon)" />
    </div>;
  }

  const currentDate = new Date().toLocaleDateString("en-GB");
  const currentTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#181414", color: "#f0f0f0", display: "flex", flexDirection: "column", paddingBottom: "150px", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href={`/movies/${id}`} style={{ color: "#aaa", textDecoration: "none" }}>
          <ArrowLeft size={24} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.9rem", color: "#888", letterSpacing: "1px" }}>SEATS</span>
          <SeatIcon status="selected" />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* Curved Screen Indicator */}
        <div style={{ width: "100%", position: "relative", marginBottom: "40px", marginTop: "10px" }}>
          <svg width="100%" viewBox="0 0 300 40" style={{ filter: "drop-shadow(0 15px 25px rgba(124, 45, 59, 0.4))" }}>
            <path d="M 0 40 Q 150 -10 300 40" fill="none" stroke="var(--color-maroon)" strokeWidth="3" />
            <path d="M 0 40 Q 150 -10 300 40 L 300 60 L 0 60 Z" fill="url(#screenGlow)" opacity="0.3" />
            <defs>
              <linearGradient id="screenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-maroon)" stopOpacity="1" />
                <stop offset="100%" stopColor="#181414" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Seat Map */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%" }}>
          {ROWS.map(row => (
            <div key={row} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ width: "20px", color: "#666", fontSize: "0.8rem", textAlign: "left" }}>{row}</span>
              <div style={{ display: "flex", gap: "25px" }}>
                {/* Left Side */}
                <div style={{ display: "flex", gap: "10px" }}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const num = i + 1;
                    const seatId = `${row}${num}`;
                    const isBooked = bookedSeats.includes(seatId);
                    const isSelected = selectedSeats.some(s => s.row === row && s.number === num);
                    const status = isBooked ? "booked" : isSelected ? "selected" : "available";
                    return (
                      <div key={num} onClick={() => toggleSeat(row, num)} style={{ cursor: isBooked ? "not-allowed" : "pointer", transition: "transform 0.1s" }} className="seat-hover">
                        <SeatIcon status={status} />
                      </div>
                    );
                  })}
                </div>
                {/* Right Side */}
                <div style={{ display: "flex", gap: "10px" }}>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const num = i + 6;
                    const seatId = `${row}${num}`;
                    const isBooked = bookedSeats.includes(seatId);
                    const isSelected = selectedSeats.some(s => s.row === row && s.number === num);
                    const status = isBooked ? "booked" : isSelected ? "selected" : "available";
                    return (
                      <div key={num} onClick={() => toggleSeat(row, num)} style={{ cursor: isBooked ? "not-allowed" : "pointer", transition: "transform 0.1s" }} className="seat-hover">
                        <SeatIcon status={status} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <span style={{ width: "20px", color: "#666", fontSize: "0.8rem", textAlign: "right" }}>{row}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "40px", padding: "0 10px", color: "#888", fontSize: "0.8rem", letterSpacing: "1px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>BOOKED</span>
            <SeatIcon status="booked" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>BLANK</span>
            <SeatIcon status="available" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>SELECTED</span>
            <SeatIcon status="selected" />
          </div>
        </div>

      </div>

      {/* Bottom Floating Ticket Preview */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: selectedSeats.length > 0 ? 0 : 100, opacity: selectedSeats.length > 0 ? 1 : 0 }}
        style={{ position: "fixed", bottom: "80px", left: "0", right: "0", display: "flex", justifyContent: "center", pointerEvents: "none" }}
      >
        <div style={{ 
          backgroundColor: "#fdfdfd", 
          color: "#222", 
          borderRadius: "16px", 
          display: "flex", 
          width: "90%", 
          maxWidth: "500px", 
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          overflow: "hidden"
        }}>
          {/* Left Stub */}
          <div style={{ width: "80px", borderRight: "2px dashed #ddd", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#181414", position: "absolute", left: "-12px" }}></div>
            <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#181414" }}></div>
          </div>
          {/* Main Info */}
          <div style={{ flex: 1, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.9rem", color: "#666" }}>Film Name :</span>
              <strong style={{ textTransform: "uppercase", fontSize: "0.9rem" }}>{movie?.title.substring(0, 20)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <span style={{ fontSize: "0.9rem", color: "#666" }}>Cinema :</span>
              <strong style={{ fontSize: "0.9rem" }}>WatchKnot Screen 1</strong>
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "40px", borderTop: "1px solid #eee", paddingTop: "15px", marginBottom: "10px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "4px", fontWeight: "bold" }}>Time</div>
                <div style={{ fontSize: "1.1rem" }}>{currentTime}</div>
              </div>
              <div style={{ width: "1px", backgroundColor: "#eee" }}></div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "4px", fontWeight: "bold" }}>Date</div>
                <div style={{ fontSize: "1.1rem" }}>{currentDate}</div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", letterSpacing: "1px" }}>
                  {selectedSeats.map(s => `${s.row}${s.number}`).join(", ")}
                </div>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>Seats</span>
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--color-maroon)", fontWeight: "bold", textTransform: "uppercase" }}>
                Ticket By : WATCHKNOT
              </div>
            </div>
          </div>
          <div style={{ width: "20px", position: "relative", overflow: "hidden" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#181414", position: "absolute", bottom: "-20px", right: "0" }}></div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Sticky Action Button */}
      <div style={{ position: "fixed", bottom: "0", left: "0", right: "0", backgroundColor: "#181414" }}>
        <button 
          onClick={handleBookTickets}
          disabled={selectedSeats.length === 0 || booking}
          style={{ 
            width: "100%", 
            height: "60px", 
            border: "none", 
            background: selectedSeats.length > 0 ? "linear-gradient(to right, #ff4d4d, var(--color-maroon))" : "#333", 
            color: "white", 
            fontSize: "1.1rem", 
            fontWeight: "bold", 
            letterSpacing: "1px",
            cursor: selectedSeats.length === 0 ? "not-allowed" : "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "background 0.3s"
          }}
        >
          {booking ? <Loader2 className="animate-spin" /> : "CONFIRM BOOKING"}
        </button>
      </div>

      <style jsx>{`
        .seat-hover:hover svg {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
