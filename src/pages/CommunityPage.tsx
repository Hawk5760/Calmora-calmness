import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, MessageCircle, Plus, Send, Shield, Users, Clock, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Post { id: string; title: string; content: string; is_anonymous: boolean; author_id: string; likes_count: number; comments_count: number; tags: string[] | null; created_at: string; pseudo_id: string | null; }
interface Comment { id: string; content: string; is_anonymous: boolean; author_id: string; likes_count: number; created_at: string; }

const TAGS = ["Anxiety", "Stress", "Depression", "Self-Care", "Motivation", "Relationships", "Academic", "General"];
const HARMFUL_KEYWORDS = ["kill", "suicide", "self-harm", "cut myself", "end my life", "die", "hate you", "kys", "worthless", "hang myself", "overdose", "abuse", "violent", "assault", "threat", "bully"];

const moderateContent = (text: string): { approved: boolean; reason?: string } => {
  const lower = text.toLowerCase();
  for (const keyword of HARMFUL_KEYWORDS) {
    if (lower.includes(keyword)) return { approved: false, reason: "Content flagged for review: potentially harmful language detected. A moderator will review your post." };
  }
  return { approved: true };
};

const CommunityPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [commentAnonymous, setCommentAnonymous] = useState(true);

  useEffect(() => { fetchPosts(); if (user) fetchLikedPosts(); }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase.from("peer_support_posts_safe").select("*").order("created_at", { ascending: false }).limit(50);
    if (!error && data) setPosts(data as unknown as Post[]);
    setLoading(false);
  };

  const fetchLikedPosts = async () => {
    if (!user) return;
    const { data } = await supabase.from("peer_support_likes").select("post_id").eq("user_id", user.id).not("post_id", "is", null);
    if (data) setLikedPosts(new Set(data.map((l) => l.post_id!)));
  };

  const fetchComments = async (postId: string) => {
    const { data } = await supabase.from("peer_support_comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
    if (data) setComments((prev) => ({ ...prev, [postId]: data }));
  };

  const handleCreatePost = async () => {
    if (!user || !newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    // Server-side trigger handles moderation - no client-side is_flagged/is_moderated
    const { error } = await supabase.from("peer_support_posts").insert({
      title: newTitle.trim(),
      content: newContent.trim(),
      author_id: user.id,
      is_anonymous: isAnonymous,
      tags: selectedTags.length > 0 ? selectedTags : null,
    });
    if (error) {
      toast({ variant: "destructive", title: "Failed to post", description: "Something went wrong. Please try again." });
    } else {
      // Client-side check for UX feedback only (server enforces it regardless)
      const titleCheck = moderateContent(newTitle);
      const contentCheck = moderateContent(newContent);
      if (!titleCheck.approved || !contentCheck.approved) {
        toast({ title: "Post under review", description: titleCheck.reason || contentCheck.reason });
      } else {
        toast({ title: "Post shared!", description: "Your post is now live." });
      }
      fetchPosts();
    }
    setNewTitle(""); setNewContent(""); setSelectedTags([]); setDialogOpen(false); setCreating(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    if (likedPosts.has(postId)) {
      await supabase.from("peer_support_likes").delete().eq("user_id", user.id).eq("post_id", postId);
      setLikedPosts((p) => { const n = new Set(p); n.delete(postId); return n; });
      setPosts((p) => p.map((x) => x.id === postId ? { ...x, likes_count: Math.max(0, (x.likes_count || 0) - 1) } : x));
    } else {
      await supabase.from("peer_support_likes").insert({ user_id: user.id, post_id: postId });
      setLikedPosts((p) => new Set(p).add(postId));
      setPosts((p) => p.map((x) => x.id === postId ? { ...x, likes_count: (x.likes_count || 0) + 1 } : x));
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !commentText[postId]?.trim()) return;
    const { error } = await supabase.from("peer_support_comments").insert({ post_id: postId, content: commentText[postId].trim(), author_id: user.id, is_anonymous: commentAnonymous });
    if (!error) { setCommentText((p) => ({ ...p, [postId]: "" })); fetchComments(postId); setPosts((p) => p.map((x) => x.id === postId ? { ...x, comments_count: (x.comments_count || 0) + 1 } : x)); }
  };

  const toggleExpand = (postId: string) => {
    if (expandedPost === postId) setExpandedPost(null);
    else { setExpandedPost(postId); if (!comments[postId]) fetchComments(postId); }
  };

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">Community Support</h1>
                  <p className="text-xs text-muted-foreground">Share anonymously & support each other</p>
                </div>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 rounded-full shadow-lg">
                  <Plus className="w-4 h-4" /> Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-base">Share with the community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="rounded-xl" />
                  <Textarea placeholder="What's on your mind?" value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={4} className="rounded-xl resize-none" />
                  <div className="flex flex-wrap gap-1.5">
                    {TAGS.map((tag) => (
                      <Badge key={tag} variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer text-xs rounded-full transition-all"
                        onClick={() => setSelectedTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag])}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30">
                    <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} id="anon" />
                    <Label htmlFor="anon" className="flex items-center gap-1.5 text-sm"><Shield className="w-3.5 h-3.5" /> Post anonymously</Label>
                  </div>
                  <Button onClick={handleCreatePost} disabled={creating || !newTitle.trim() || !newContent.trim()} className="w-full gap-2 rounded-full">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Share Post
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" /> Auto-moderated for safety
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <Separator className="mb-6" />

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <Card className="text-center py-16 bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent>
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-base font-medium text-foreground">No posts yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Be the first to share!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {posts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 hover:shadow-md transition-all">
                    <CardContent className="p-4 sm:p-5">
                      {/* Author & time */}
                      <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          {post.is_anonymous ? <Shield className="w-3 h-3 text-primary" /> : <Users className="w-3 h-3 text-primary" />}
                        </div>
                        <span>{post.is_anonymous ? "Anonymous" : "User"}</span>
                        <span>·</span>
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(post.created_at!), { addSuffix: true })}</span>
                      </div>

                      {/* Title & content */}
                      <h3 className="font-semibold text-sm text-foreground mb-1.5">{post.title}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3 line-clamp-4">{post.content}</p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.map((tag) => <Badge key={tag} variant="secondary" className="text-[10px] rounded-full">{tag}</Badge>)}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" className={`gap-1.5 rounded-full h-8 px-3 text-xs ${likedPosts.has(post.id) ? "text-destructive" : "text-muted-foreground"}`} onClick={() => handleLike(post.id)}>
                          <Heart className={`w-3.5 h-3.5 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                          {post.likes_count || 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5 rounded-full h-8 px-3 text-xs text-muted-foreground" onClick={() => toggleExpand(post.id)}>
                          <MessageCircle className="w-3.5 h-3.5" />
                          {post.comments_count || 0}
                          {expandedPost === post.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                      </div>

                      {/* Comments */}
                      <AnimatePresence>
                        {expandedPost === post.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="pt-3 mt-3 space-y-2.5 border-t border-border/50">
                              {comments[post.id]?.map((c) => (
                                <div key={c.id} className="pl-3 border-l-2 border-primary/20 py-1">
                                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-0.5">
                                    {c.is_anonymous ? <><Shield className="w-2.5 h-2.5" /> Anonymous</> : "User"}
                                    <span>· {formatDistanceToNow(new Date(c.created_at!), { addSuffix: true })}</span>
                                  </div>
                                  <p className="text-xs text-foreground">{c.content}</p>
                                </div>
                              ))}
                              <div className="flex gap-2 items-end pt-1">
                                <div className="flex-1 space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <Switch checked={commentAnonymous} onCheckedChange={setCommentAnonymous} id={`ca-${post.id}`} className="scale-75" />
                                    <Label htmlFor={`ca-${post.id}`} className="text-[10px] text-muted-foreground">Anonymous</Label>
                                  </div>
                                  <Input placeholder="Write a supportive comment..." value={commentText[post.id] || ""} onChange={(e) => setCommentText((p) => ({ ...p, [post.id]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)} className="rounded-xl text-sm h-9" />
                                </div>
                                <Button size="icon" onClick={() => handleComment(post.id)} disabled={!commentText[post.id]?.trim()} className="rounded-full h-9 w-9">
                                  <Send className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CommunityPage;
