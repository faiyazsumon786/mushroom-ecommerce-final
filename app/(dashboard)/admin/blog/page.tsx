'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Post {
  id: string;
  title: string;
  status: string;
  featuredImageUrl?: string;
  author?: { name?: string };
  createdAt: string;
}

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 📨 Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/posts");
      if (!res.ok) throw new Error("Failed to load posts");
      const data = await res.json();
      setPosts(data || []);
    } catch (error) {
      toast.error("Error loading posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 🗑️ Delete post
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post deleted successfully");
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        const json = await res.json();
        toast.error("Delete failed: " + (json.error ?? "Unknown error"));
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* 🏷️ Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          📰 Blog Management
        </h1>
        <Link href="/admin/blog/new">
          <Button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
            <PlusCircle className="h-4 w-4" /> New Post
          </Button>
        </Link>
      </div>

      <Card className="shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
            </div>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No blog posts found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full border rounded-lg">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {posts.map((post, i) => (
                      <motion.tr
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{post.author?.name ?? "Unknown"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={post.status === "PUBLISHED" ? "default" : "secondary"}
                          >
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(post.createdAt), "dd MMM, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            {/* ✏️ Edit Button */}
                            <Link href={`/admin/blog/${post.id}`}>
                              <Button variant="outline" size="icon">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </Link>

                            {/* 🗑️ Delete Button */}
                            <Button
                              size="icon"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleDelete(post.id)}
                              disabled={deletingId === post.id}
                            >
                              {deletingId === post.id ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
