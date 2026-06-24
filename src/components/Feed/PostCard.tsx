"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, MessageCircle, Trash2, Ban, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ReactionPicker, ReactionStamp, REACTIONS, ReactionKey } from "./ReactionStamps";

export default function PostCard({ post, onUpdate, onDelete, onBlock }: { post: any, onUpdate: () => void, onDelete: (id: string) => void, onBlock: (id: string) => void }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const isOwner = user?.email && post.user.id === user.uid; 
  
  const handleReaction = async (type: ReactionKey | null) => {
    if (!type) return;
    setShowReactions(false);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ postId: post.id, type })
      });
      if (res.ok) onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ postId: post.id, content: newComment })
      });
      if (res.ok) {
        setNewComment("");
        onUpdate();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/comments/${commentId}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  // Group reactions for display
  const reactionCounts: Record<string, number> = {};
  post.reactions.forEach((r: any) => {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
  });

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card border border-border rounded-2xl p-4 shadow-sm relative mb-5"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <Link href={`/users/${post.user.id}`} className="flex gap-3 group">
          <img 
            src={post.user.image || "/default-avatar.png"} 
            alt={post.user.name} 
            className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition" 
          />
          <div>
            <h4 className="m-0 font-bold text-foreground group-hover:text-primary transition">{post.user.name}</h4>
            <div className="flex items-center text-xs text-muted-foreground font-handwritten">
              <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
              <span className="mx-1.5 opacity-50">•</span>
              <span className="capitalize">{post.privacy.toLowerCase()}</span>
            </div>
          </div>
        </Link>

        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="p-1 rounded-full hover:bg-secondary text-muted-foreground transition"
          >
            <MoreHorizontal size={20} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                className="absolute top-full right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20 min-w-[150px]"
              >
                <button 
                  onClick={() => { setShowMenu(false); onDelete(post.id); }} 
                  className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-secondary flex items-center gap-2 transition"
                >
                  <Trash2 size={16} /> Delete Post
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onBlock(post.user.id); }} 
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary flex items-center gap-2 transition"
                >
                  <Ban size={16} /> Block User
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <p className="text-base sm:text-lg mb-4 whitespace-pre-wrap font-handwritten leading-relaxed text-foreground">
        {post.content}
      </p>

      {/* Media */}
      {post.mediaUrl && (
        <div className="rounded-xl overflow-hidden mb-4 border border-border max-h-[500px] flex items-center justify-center bg-black/5">
          {post.mediaType === "video" ? (
            <video src={post.mediaUrl} controls className="max-w-full max-h-[500px]" />
          ) : (
            <img src={post.mediaUrl} alt="Post media" className="max-w-full max-h-[500px] object-cover" />
          )}
        </div>
      )}

      {/* Linked Movie (Washi Tape Style) */}
      {post.movie && (
        <Link href={`/movies/${post.movie.id}`} className="block mb-4 transform -rotate-1 hover:rotate-0 transition">
          <div className="relative bg-secondary/50 rounded-lg p-3 flex items-center gap-3 border border-border border-dashed">
            {/* Washi tape detail */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-primary/20 backdrop-blur-sm transform rotate-2"></div>
            
            {post.movie.posterUrl ? (
              <img src={post.movie.posterUrl} alt={post.movie.title} className="w-10 h-14 object-cover rounded shadow-sm" />
            ) : (
              <div className="w-10 h-14 bg-muted rounded flex items-center justify-center"><Film size={20} className="text-muted-foreground" /></div>
            )}
            <div>
              <h5 className="m-0 text-foreground font-bold text-sm line-clamp-1">{post.movie.title}</h5>
              <span className="text-xs text-primary font-handwritten">View Movie details</span>
            </div>
          </div>
        </Link>
      )}

      {/* Stats Summary */}
      <div className="flex justify-between items-center py-2 mb-2 text-xs font-handwritten text-muted-foreground border-b border-border">
        <div className="flex gap-1.5">
          {Object.entries(reactionCounts).length > 0 ? (
            <>
              {Object.entries(reactionCounts).map(([type, count]) => (
                <ReactionStamp 
                  key={type} 
                  reaction={type as ReactionKey} 
                  size={16} 
                  count={count as number} 
                />
              ))}
            </>
          ) : <span>No reactions yet</span>}
        </div>
        <button onClick={() => setShowComments(!showComments)} className="hover:text-foreground transition">
          {post.comments.length} Comments
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex relative">
        <div 
          onMouseEnter={() => setShowReactions(true)} 
          onMouseLeave={() => setShowReactions(false)}
          className="flex-1 relative"
        >
          <button className="w-full py-2 flex justify-center items-center gap-2 text-sm font-bold text-muted-foreground hover:bg-secondary rounded-lg transition">
            <ReactionStamp reaction="love" size={18} /> React
          </button>
          
          <AnimatePresence>
            {showReactions && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-[calc(100%+5px)] left-0 z-20"
              >
                <ReactionPicker 
                  selected={null} 
                  onPick={(r) => handleReaction(r)} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setShowComments(!showComments)} 
          className="flex-1 py-2 flex justify-center items-center gap-2 text-sm font-bold text-muted-foreground hover:bg-secondary rounded-lg transition"
        >
          <MessageCircle size={18} /> Comment
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }} 
            className="overflow-hidden"
          >
            <div className="pt-4 mt-2 border-t border-border space-y-4">
              {/* Add Comment */}
              <div className="flex gap-3">
                <img 
                  src={user?.photoURL || "/default-avatar.png"} 
                  alt="You" 
                  className="w-8 h-8 rounded-full object-cover border border-border shrink-0" 
                />
                <div className="flex-1 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Write a sweet comment..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                    className="flex-1 px-4 py-2 rounded-full border border-border bg-muted/30 focus:bg-background outline-none font-handwritten text-sm transition"
                  />
                  <button 
                    onClick={handleComment} 
                    disabled={!newComment.trim()} 
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-full disabled:opacity-50 transition"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Comment List */}
              <div className="space-y-3">
                {post.comments.map((c: any) => (
                  <div key={c.id} className="flex gap-3 group">
                    <img src={c.user.image || "/default-avatar.png"} alt={c.user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="flex-1">
                      <div className="bg-secondary/50 px-3 py-2 rounded-2xl rounded-tl-sm inline-block max-w-full">
                        <span className="font-bold text-sm block text-foreground">{c.user.name}</span>
                        <span className="text-sm font-handwritten text-foreground break-words">{c.content}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-muted-foreground font-handwritten">
                        <span>{formatDistanceToNow(new Date(c.createdAt))} ago</span>
                        <button 
                          onClick={() => handleDeleteComment(c.id)} 
                          className="text-destructive opacity-0 group-hover:opacity-100 transition hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
