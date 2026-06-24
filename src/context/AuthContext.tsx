"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  getToken: async () => null,
  logOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const res = await fetch("/api/user/me", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user?.isBanned) {
              setIsBanned(true);
            }
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setIsBanned(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const getToken = async () => {
    if (!user) return null;
    return await user.getIdToken();
  };

  const logOut = async () => {
    await signOut(auth);
  };

  if (isBanned) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "var(--color-bg)", color: "var(--color-text)", textAlign: "center", padding: "20px" }}>
        <h1 className="caveat" style={{ fontSize: "4rem", color: "var(--color-maroon)", margin: 0 }}>Banned</h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "400px", marginTop: "20px" }}>
          You have been banned from WatchKnot. You can no longer access the platform.
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, getToken, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
