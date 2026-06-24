"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const REACTIONS = [
  { id: "wow", emoji: "😲", label: "Wow" },
  { id: "care", emoji: "🥰", label: "Care" },
  { id: "love", emoji: "❤️", label: "Love" },
  { id: "angry", emoji: "😡", label: "Angry" },
  { id: "cry", emoji: "😭", label: "Cry" },
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "laugh", emoji: "😂", label: "Laugh" },
  { id: "like", emoji: "👍", label: "Like" },
  { id: "dislike", emoji: "👎", label: "Dislike" },
];

export default function ReactionOverlay({ roomId, userId }: { roomId: string, userId: string }) {
  const [floatingReactions, setFloatingReactions] = useState<{ id: string, emoji: string, left: number }[]>([]);
  const [localReactions, setLocalReactions] = useState<any[]>([]);

  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, "watchRooms", roomId);
    
    const unsub = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.recentReaction && data.recentReaction.timestamp) {
          // Check if this is a new reaction we haven't seen yet
          // In a real app we might use a subcollection to track all reactions, 
          // but for ephemeral floating animations, updating a field on the room doc is very fast.
          const r = data.recentReaction;
          const isNew = Date.now() - r.timestamp < 5000; // Ignore old ones on load
          
          if (isNew && r.id !== localReactions[localReactions.length - 1]?.id) {
            triggerFloatingReaction(r.emoji);
            setLocalReactions(prev => [...prev, r]);
          }
        }
      }
    });

    return () => unsub();
  }, [roomId, localReactions]);

  const triggerFloatingReaction = (emoji: string) => {
    const newReaction = {
      id: Math.random().toString(36).substr(2, 9),
      emoji,
      left: Math.random() * 80 + 10 // Random position between 10% and 90%
    };
    setFloatingReactions(prev => [...prev, newReaction]);

    // Remove it after animation completes
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);
  };

  const sendReaction = async (emoji: string) => {
    // Show locally immediately for responsiveness
    triggerFloatingReaction(emoji);
    
    // Sync to others
    try {
      const roomRef = doc(db, "watchRooms", roomId);
      await updateDoc(roomRef, {
        recentReaction: {
          emoji,
          userId,
          timestamp: Date.now(),
          id: Math.random().toString(36).substr(2, 9)
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Floating Reactions Container - Overlay on top of video */}
      <div style={{ position: "absolute", bottom: "80px", left: 0, right: 0, height: "300px", pointerEvents: "none", zIndex: 100, overflow: "hidden" }}>
        <AnimatePresence>
          {floatingReactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ y: 300, opacity: 0, scale: 0.5, x: `${r.left}%` }}
              animate={{ y: -50, opacity: [0, 1, 1, 0], scale: 1.5, x: `${r.left + (Math.random() * 10 - 5)}%` }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              style={{ position: "absolute", fontSize: "2rem", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction Bar (Bottom of chat) */}
      <div style={{ padding: "10px", backgroundColor: "#111", borderTop: "1px solid #222", display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
        {REACTIONS.map((r) => (
          <button 
            key={r.id}
            onClick={() => sendReaction(r.emoji)}
            style={{ 
              background: "none", 
              border: "none", 
              fontSize: "1.5rem", 
              cursor: "pointer", 
              padding: "4px",
              borderRadius: "50%",
              transition: "transform 0.2s, background 0.2s"
            }}
            className="reaction-btn"
            title={r.label}
          >
            {r.emoji}
          </button>
        ))}
      </div>
      <style jsx>{`
        .reaction-btn:hover {
          transform: scale(1.2);
          background-color: rgba(255,255,255,0.1);
        }
      `}</style>
    </>
  );
}
