"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { BookHeart, Loader2, RefreshCw, Sparkles } from "lucide-react";
import CreatePost from "@/components/Feed/CreatePost";
import PostCard from "@/components/Feed/PostCard";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pull, setPull] = useState(0);
  const startY = useRef<number | null>(null);

  const fetchFeed = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/posts/feed", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      setFetching(true);
      fetchFeed();
    }
  }, [user, loading, router, fetchFeed]);

  const doRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setPull(0);
  };

  // Pull-to-refresh
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 0) startY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (startY.current == null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && window.scrollY <= 0) setPull(Math.min(dy, 120));
    };
    const onTouchEnd = () => {
      if (pull > 70) doRefresh(); else setPull(0);
      startY.current = null;
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [pull]);

  const handleDeletePost = async (id: string) => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/posts/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchFeed();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBlockUser = async (blockedId: string) => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ blockedId })
      });
      if (res.ok) fetchFeed();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || (!user && fetching)) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4 sm:pt-8 pb-24 px-4 relative max-w-2xl mx-auto">
      {/* Pull indicator */}
      <div
        className="fixed top-20 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none"
        style={{ transform: `translate(-50%, ${Math.min(pull, 100)}px)`, opacity: Math.min(pull / 70, 1) }}
      >
        <div className="bg-card border border-border rounded-full px-4 py-2 shadow-md flex items-center gap-2 text-sm font-handwritten text-primary">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : pull > 70 ? "Release to refresh" : "Pull down"}
        </div>
      </div>

      <header className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-caveat font-bold flex items-center gap-3 m-0 text-foreground">
            <BookHeart className="w-8 h-8 text-primary" />
            Social Journal
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-handwritten flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            A cozy diary — share clips, snaps & reviews.
          </p>
        </div>
        <button
          onClick={doRefresh}
          disabled={refreshing || fetching}
          className="p-2.5 rounded-full bg-card border border-border hover:bg-secondary transition"
          aria-label="Refresh feed"
        >
          <RefreshCw className={`w-5 h-5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </header>

      <CreatePost onPostCreated={fetchFeed} />

      <div className="space-y-0">
        {fetching && posts.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length > 0 ? (
          <AnimatePresence initial={false}>
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onUpdate={fetchFeed} 
                onDelete={handleDeletePost}
                onBlock={handleBlockUser}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-16 px-4 bg-card border border-border border-dashed rounded-2xl">
            <BookHeart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-handwritten text-foreground mb-2">Your feed is empty</h3>
            <p className="text-sm text-muted-foreground font-handwritten">Be the first to share a clip or a tiny review!</p>
          </div>
        )}
      </div>
    </div>
  );
}
