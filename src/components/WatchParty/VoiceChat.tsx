"use client";

import { useEffect, useState, useRef } from "react";
import Peer, { MediaConnection } from "peerjs";
import { Mic, MicOff, Phone, PhoneOff, Volume2, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

export default function VoiceChat({ roomId, userId, userName, isHost }: { roomId: string, userId: string, userName: string, isHost: boolean }) {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string>("");
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  
  const [streams, setStreams] = useState<{ id: string, stream: MediaStream }[]>([]);
  const myStreamRef = useRef<MediaStream | null>(null);
  const connectionsRef = useRef<{ [key: string]: MediaConnection }>({});

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      leaveCall();
    };
  }, []);

  const joinCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      myStreamRef.current = stream;
      
      const newPeer = new Peer(); // Uses free public peerjs server
      
      newPeer.on("open", async (id) => {
        setMyPeerId(id);
        setPeer(newPeer);
        setInCall(true);

        // Add my peerId to firestore room
        const roomRef = doc(db, "watchRooms", roomId);
        await updateDoc(roomRef, {
          peerIds: arrayUnion(id)
        });
      });

      newPeer.on("call", (call) => {
        // Someone called us, answer with our stream
        call.answer(stream);
        
        call.on("stream", (remoteStream) => {
          addStream(call.peer, remoteStream);
        });

        call.on("close", () => {
          removeStream(call.peer);
        });

        connectionsRef.current[call.peer] = call;
      });

    } catch (err) {
      console.error("Failed to get local stream", err);
      alert("Failed to access microphone. Please check permissions.");
    }
  };

  const leaveCall = async () => {
    if (myStreamRef.current) {
      myStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (peer) {
      Object.values(connectionsRef.current).forEach(call => call.close());
      peer.destroy();
      setPeer(null);
    }
    
    if (myPeerId) {
      const roomRef = doc(db, "watchRooms", roomId);
      await updateDoc(roomRef, {
        peerIds: arrayRemove(myPeerId)
      });
    }

    setInCall(false);
    setStreams([]);
    connectionsRef.current = {};
  };

  const toggleMute = () => {
    if (myStreamRef.current) {
      const audioTrack = myStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMuted(!audioTrack.enabled);
      }
    }
  };

  // Listen to Firestore room changes to connect to new peers
  useEffect(() => {
    if (!inCall || !peer || !myPeerId) return;

    const roomRef = doc(db, "watchRooms", roomId);
    const unsub = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const roomPeerIds: string[] = data.peerIds || [];
        
        // Call any peer we haven't connected to yet
        roomPeerIds.forEach(pId => {
          if (pId !== myPeerId && !connectionsRef.current[pId]) {
            console.log("Calling new peer:", pId);
            const call = peer.call(pId, myStreamRef.current!);
            
            call.on("stream", (remoteStream) => {
              addStream(pId, remoteStream);
            });

            call.on("close", () => {
              removeStream(pId);
            });

            connectionsRef.current[pId] = call;
          }
        });
      }
    });

    return () => unsub();
  }, [inCall, peer, myPeerId, roomId]);

  const addStream = (id: string, stream: MediaStream) => {
    setStreams(prev => {
      if (prev.find(s => s.id === id)) return prev;
      return [...prev, { id, stream }];
    });
  };

  const removeStream = (id: string) => {
    setStreams(prev => prev.filter(s => s.id !== id));
    delete connectionsRef.current[id];
  };

  return (
    <div style={{ backgroundColor: "#151515", padding: "15px", borderRadius: "12px", border: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: inCall ? "#4CAF50" : "#aaa" }}>
          <Volume2 size={20} />
          <span style={{ fontWeight: "bold" }}>Voice Channel</span>
        </div>
        
        {inCall && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", backgroundColor: "#222", padding: "4px 8px", borderRadius: "12px" }}>
              {streams.length} connected
            </span>
            {/* Render audio elements for remote streams hidden */}
            {streams.map(s => (
              <AudioRenderer key={s.id} stream={s.stream} />
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        {inCall ? (
          <>
            <button onClick={toggleMute} style={{ padding: "10px", borderRadius: "50%", backgroundColor: muted ? "#ff4d4d" : "#333", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {muted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button onClick={leaveCall} style={{ padding: "10px 20px", borderRadius: "20px", backgroundColor: "#ff4d4d", border: "none", color: "white", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
              <PhoneOff size={18} /> Disconnect
            </button>
          </>
        ) : (
          <button onClick={joinCall} style={{ padding: "10px 20px", borderRadius: "20px", backgroundColor: "#4CAF50", border: "none", color: "white", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
            <Phone size={18} /> Join Voice
          </button>
        )}
      </div>
    </div>
  );
}

// Helper component to render and auto-play remote audio streams
function AudioRenderer({ stream }: { stream: MediaStream }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />;
}
