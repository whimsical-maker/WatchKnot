"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Users, Play, Clock, Link as LinkIcon, Copy } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import MediaPlayer from "@/components/MediaPlayer";
import ChatOverlay from "@/components/WatchParty/ChatOverlay";
import VoiceChat from "@/components/WatchParty/VoiceChat";
import ReactionOverlay from "@/components/WatchParty/ReactionOverlay";

export default function WatchRoomPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const roomId = params?.roomId as string;

  const [roomData, setRoomData] = useState<any>(null);
  const [movieData, setMovieData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  // Fetch Movie Data
  useEffect(() => {
    if (!id) return;
    fetch(`/api/movies/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.movie) setMovieData(data.movie);
      })
      .catch(console.error);
  }, [id]);

  // Firestore Sync Logic
  useEffect(() => {
    if (!user || !roomId || !id || !movieData) return;

    const roomRef = doc(db, "watchRooms", roomId);
    
    // Initialize room if it doesn't exist
    const initRoom = async () => {
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        await setDoc(roomRef, {
          movieId: id,
          movieTitle: movieData.title,
          hostId: user.uid,
          hostName: user.displayName || "Unknown Host",
          createdAt: serverTimestamp(),
          participants: [user.uid],
          state: "waiting", // waiting, countdown, playing
          countdownAt: null,
        });
      } else {
        // Add self to participants
        const data = snap.data();
        if (!data.participants.includes(user.uid)) {
          await updateDoc(roomRef, {
            participants: arrayUnion(user.uid)
          });
        }
      }
    };

    initRoom();

    // Listen to room changes
    const unsub = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRoomData(data);
        
        // Handle Countdown logic
        if (data.state === "countdown" && data.countdownAt) {
          const targetTime = data.countdownAt.toMillis();
          const checkTimer = setInterval(() => {
            const now = Date.now();
            const diff = Math.ceil((targetTime - now) / 1000);
            if (diff <= 0) {
              setCountdown(0);
              clearInterval(checkTimer);
            } else {
              setCountdown(diff);
            }
          }, 100);
          return () => clearInterval(checkTimer);
        } else {
          setCountdown(null);
        }
      }
    });

    return () => unsub();
  }, [user, roomId, id, movieData]);

  // Wait for initial load
  useEffect(() => {
    if (roomData && movieData) setLoading(false);
  }, [roomData, movieData]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Room link copied!");
  };

  const startCountdown = async () => {
    if (!roomData || roomData.hostId !== user?.uid) return;
    const roomRef = doc(db, "watchRooms", roomId);
    // Start countdown for 5 seconds in the future
    await updateDoc(roomRef, {
      state: "countdown",
      countdownAt: new Date(Date.now() + 5000)
    });
  };

  if (loading || authLoading) {
    return (
      <div style={{ height: "100vh", backgroundColor: "#111", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Loader2 className="animate-spin" size={50} color="var(--color-maroon)" />
      </div>
    );
  }

  const isHost = roomData?.hostId === user?.uid;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#fff", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      
      {/* Header */}
      <div style={{ padding: "15px 30px", backgroundColor: "#111", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href={`/movies/${id}`} style={{ color: "#aaa", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
            <ArrowLeft size={20} /> Leave Room
          </Link>
          <div style={{ height: "24px", width: "1px", backgroundColor: "#333" }} />
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>{movieData.title}</h2>
          <span style={{ backgroundColor: "var(--color-maroon)", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "1px" }}>LIVE</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#888", backgroundColor: "#1a1a1a", padding: "6px 12px", borderRadius: "20px" }}>
            <Users size={16} /> {roomData.participants?.length || 1} Watching
          </div>
          <button onClick={copyLink} className="btn-primary" style={{ padding: "8px 16px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", border: "none", cursor: "pointer", backgroundColor: "#333" }}>
            <Copy size={16} /> Invite Friends
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", position: "relative" }}>
        
        {/* Left Side: Video & Voice */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px", position: "relative" }}>
          
          <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
            
            {/* The Video Player */}
            <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
              <MediaPlayer 
                videoUrl={movieData.videoUrl || `https://vidsrc.me/embed/movie?tmdb=${movieData.title}`} 
                title={movieData.title} 
                movieId={id} 
              />

              {/* Ready Check / Countdown Overlay */}
              <AnimatePresence>
                {roomData.state !== "playing" && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "16px" }}
                  >
                    {countdown !== null ? (
                      <div style={{ textAlign: "center" }}>
                        <motion.h1 
                          key={countdown}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          style={{ fontSize: "8rem", margin: 0, color: countdown === 0 ? "var(--color-maroon)" : "white", textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
                        >
                          {countdown === 0 ? "PLAY!" : countdown}
                        </motion.h1>
                        {countdown === 0 && <p style={{ fontSize: "1.2rem", color: "#aaa", marginTop: "10px" }}>Click play on the video player now!</p>}
                      </div>
                    ) : (
                      <div style={{ textAlign: "center" }}>
                        <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>Waiting for Host</h2>
                        <p style={{ color: "#aaa", marginBottom: "30px" }}>The host will initiate a synchronized countdown so everyone starts together.</p>
                        {isHost && (
                          <button onClick={startCountdown} className="btn-primary" style={{ padding: "16px 32px", fontSize: "1.2rem", borderRadius: "30px", display: "flex", alignItems: "center", gap: "10px", border: "none", cursor: "pointer", margin: "0 auto" }}>
                            <Clock size={24} /> Start Ready Check Sync
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Voice Chat Component */}
            <div style={{ marginTop: "20px", maxWidth: "1200px", margin: "20px auto 0 auto", width: "100%" }}>
              <VoiceChat roomId={roomId} userId={user?.uid!} userName={user?.displayName!} isHost={isHost} />
            </div>

          </div>
        </div>

        {/* Right Side: Chat & Reactions */}
        <div style={{ width: "350px", borderLeft: "1px solid #222", backgroundColor: "#111", display: "flex", flexDirection: "column", position: "relative" }}>
          <ChatOverlay roomId={roomId} userId={user?.uid!} userName={user?.displayName!} />
          <ReactionOverlay roomId={roomId} userId={user?.uid!} />
        </div>

      </div>
    </div>
  );
}
