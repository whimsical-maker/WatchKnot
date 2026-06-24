"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserPlus, Check, User, Search, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading, getToken } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && user) fetchFriends();
  }, [user, authLoading]);

  const fetchFriends = async () => {
    const token = await getToken();
    const res = await fetch("/api/friends", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
    }
    setLoading(false);
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const token = await getToken();
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: "ADD_BY_EMAIL", email: searchEmail }),
    });
    const data = await res.json();
    setMessage(data.message);
    setSearchEmail("");
  };

  const handleAccept = async (targetUserId: string) => {
    const token = await getToken();
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: "ACCEPT", targetUserId }),
    });
    if (res.ok) fetchFriends();
  };

  if (authLoading || loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><Loader2 className="animate-spin" size={40} color="var(--color-maroon)" /></div>;
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", padding: "40px 20px", backgroundColor: "var(--color-bg)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "grid", gap: "24px", gridTemplateColumns: "1fr 1fr" }}>

        {/* Profile Card */}
        <div className="cute-card" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "var(--color-maroon)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
            <User size={36} />
          </div>
          <div>
            <h1 className="caveat" style={{ fontSize: "2.8rem", margin: 0 }}>{user?.displayName || "Movie Lover"}</h1>
            <p style={{ color: "var(--color-maroon)", margin: 0, fontSize: "0.95rem" }}>{user?.email}</p>
          </div>
        </div>

        {/* Add Friend */}
        <div className="cute-card">
          <h2 className="caveat" style={{ fontSize: "1.8rem", marginTop: 0, paddingBottom: "10px", borderBottom: "2px dashed var(--color-border)" }}>Add a Friend</h2>
          <form onSubmit={handleAddFriend} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
              <input type="email" placeholder="Friend's email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} style={{ width: "100%", padding: "10px 10px 10px 34px", borderRadius: "8px", border: "1px solid var(--color-border)", outline: "none", backgroundColor: "var(--color-bg)", color: "var(--color-text)" }} />
            </div>
            <button type="submit" className="btn-primary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px" }}>
              <UserPlus size={16} /> Send Request
            </button>
          </form>
          {message && <p style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--color-maroon)", textAlign: "center" }}>{message}</p>}
        </div>

        {/* Pending */}
        <div className="cute-card">
          <h2 className="caveat" style={{ fontSize: "1.8rem", marginTop: 0, paddingBottom: "10px", borderBottom: "2px dashed var(--color-border)" }}>Pending Requests</h2>
          {pendingRequests.length === 0 ? (
            <p style={{ color: "#888", textAlign: "center", padding: "20px 0", fontStyle: "italic" }}>No pending requests</p>
          ) : pendingRequests.map(req => (
            <div key={req.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px", backgroundColor: "var(--color-bg)", borderRadius: "8px", marginBottom: "8px" }}>
              <div>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>{req.user1.name}</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>{req.user1.email}</p>
              </div>
              <button onClick={() => handleAccept(req.user1.id)} className="btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                <Check size={14} /> Accept
              </button>
            </div>
          ))}
        </div>

        {/* Friends List */}
        <div className="cute-card" style={{ gridColumn: "1 / -1" }}>
          <h2 className="caveat" style={{ fontSize: "1.8rem", marginTop: 0, paddingBottom: "10px", borderBottom: "2px dashed var(--color-border)" }}>Your Friends ({friends.length})</h2>
          {friends.length === 0 ? (
            <p style={{ color: "#888", textAlign: "center", padding: "40px 0", fontStyle: "italic" }}>No friends yet — invite someone!</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
              {friends.map(friend => (
                <div key={friend.id} style={{ padding: "12px", backgroundColor: "var(--color-bg)", borderRadius: "8px", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--color-maroon)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
                    <User size={18} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.85rem" }}>{friend.name}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>{friend.email?.split("@")[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
