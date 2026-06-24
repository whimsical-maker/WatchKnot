"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from "firebase/firestore";
import { Send, Image as ImageIcon, Smile } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatOverlay({ roomId, userId, userName }: { roomId: string, userId: string, userName: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;
    const q = query(collection(db, `watchRooms/${roomId}/chat`), orderBy("createdAt", "asc"), limit(100));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
    return () => unsub();
  }, [roomId]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, `watchRooms/${roomId}/chat`), {
        text: newMessage,
        userId,
        userName,
        createdAt: serverTimestamp(),
        type: "text"
      });
      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  const sendGif = async (gifUrl: string) => {
    try {
      await addDoc(collection(db, `watchRooms/${roomId}/chat`), {
        url: gifUrl,
        userId,
        userName,
        createdAt: serverTimestamp(),
        type: "gif"
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      
      <div style={{ padding: "15px", borderBottom: "1px solid #222", backgroundColor: "#151515" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
          Live Chat <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4CAF50", display: "inline-block" }}></span>
        </h3>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.map((msg) => {
          const isMe = msg.userId === userId;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}
            >
              {!isMe && <span style={{ fontSize: "0.75rem", color: "#888", marginBottom: "2px", marginLeft: "4px" }}>{msg.userName}</span>}
              <div style={{ 
                backgroundColor: isMe ? "var(--color-maroon)" : "#222", 
                padding: msg.type === "gif" ? "0" : "8px 14px", 
                borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                maxWidth: "85%",
                overflow: "hidden"
              }}>
                {msg.type === "gif" ? (
                  <img src={msg.url} alt="GIF" style={{ maxWidth: "100%", borderRadius: "8px" }} />
                ) : (
                  <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.4 }}>{msg.text}</p>
                )}
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: "15px", backgroundColor: "#151515", borderTop: "1px solid #222" }}>
        <form onSubmit={sendMessage} style={{ display: "flex", gap: "10px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input 
              type="text" 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)} 
              placeholder="Type a message..." 
              style={{ width: "100%", padding: "12px 40px 12px 15px", borderRadius: "20px", border: "1px solid #333", backgroundColor: "#0a0a0a", color: "white", outline: "none" }}
            />
            {/* Simple mock for GIF button until Tenor is fully integrated */}
            <button type="button" onClick={() => sendGif("https://media.tenor.com/images/3303c62da7ed8e4fb80415d8ecf631cd/tenor.gif")} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Send random popcor GIF">
              <ImageIcon size={18} />
            </button>
          </div>
          <button type="submit" disabled={!newMessage.trim()} style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: newMessage.trim() ? "var(--color-maroon)" : "#333", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: newMessage.trim() ? "pointer" : "not-allowed", color: "white", transition: "background 0.2s" }}>
            <Send size={18} style={{ marginLeft: "2px" }} />
          </button>
        </form>
      </div>

    </div>
  );
}
