'use client';

import { PostStatus, Product } from '@prisma/client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TiptapEditor from '@/components/TiptapEditor';

export default function PostEditorPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.postId as string;
  const isNewPost = postId === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<PostStatus>('DRAFT');
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  // Fetch products and post data
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        toast.error('Failed to load products.');
      }
    }

    fetchProducts();

    if (!isNewPost) {
      async function fetchPost() {
        try {
          const res = await fetch(`/api/admin/posts/${postId}`, { cache: 'no-store' });
          if (!res.ok) throw new Error('Failed to load post');
          const data = await res.json();
          setTitle(data.title);
          setContent(data.content);
          setStatus(data.status);
          setSelectedProducts(data.products.map((p: Product) => p.id));
          setFeaturedImageUrl(data.featuredImage || null);
          setEditorReady(true);
        } catch {
          toast.error('Failed to load post.');
        }
      }
      fetchPost();
    } else {
      setEditorReady(true);
    }
  }, [isNewPost, postId]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('status', status);
    selectedProducts.forEach(pid => formData.append('productIds', pid));
    if (featuredImage) formData.append('featuredImage', featuredImage);

    try {
      const res = await fetch(
        isNewPost ? '/api/admin/posts' : `/api/admin/posts/${postId}`,
        {
          method: isNewPost ? 'POST' : 'PUT',
          body: formData,
        }
      );
      if (!res.ok) throw new Error('Failed to save post');
      toast.success(isNewPost ? 'Post published successfully!' : 'Post updated successfully!');
      router.push('/admin/blog');
    } catch {
      toast.error('Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image preview
  const handleImageChange = (file: File | null) => {
    setFeaturedImage(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFeaturedImageUrl(previewUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          {isNewPost ? '📝 Create New Post' : '✏️ Edit Post'}
        </h1>
        <Button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200"
        >
          {isLoading ? 'Saving...' : isNewPost ? 'Publish Post 🚀' : 'Update Post 💾'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-md border border-gray-200">
            <CardContent className="p-8 space-y-8">
              <div>
                <Label htmlFor="title" className="font-semibold text-lg mb-2 block">
                  Post Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Your amazing blog title..."
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="font-semibold text-lg mb-2 block">Content</Label>
                <div className="border rounded-lg overflow-hidden min-h-[300px]">
                  {editorReady ? (
                    <TiptapEditor content={content} onChange={setContent} />
                  ) : (
                    <p className="p-4 text-gray-500">Loading editor...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Post Settings */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="status" className="mb-2 block font-semibold">
                  Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(value: PostStatus) => setStatus(value)}
                >
                  <SelectTrigger
                    id="status"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-gray-700"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-md shadow-lg border border-gray-200">
                    <SelectItem
                      value="DRAFT"
                      className="bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-gray-300 focus:text-gray-900 rounded-md cursor-pointer px-4 py-2"
                    >
                      Draft
                    </SelectItem>
                    <SelectItem
                      value="PUBLISHED"
                      className="bg-green-100 text-green-800 hover:bg-green-200 focus:bg-green-300 focus:text-green-900 rounded-md cursor-pointer px-4 py-2"
                    >
                      Published
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="featuredImage" className="mb-2 block font-semibold">
                  {isNewPost ? 'Featured Image' : 'Change Image (Optional)'}
                </Label>
                <Input
                  id="featuredImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                />
                {featuredImageUrl && (
                  <Image
                    src={featuredImageUrl}
                    alt="Preview"
                    width={400}
                    height={160}
                    className="mt-4 w-full h-40 object-cover rounded-lg border"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Linked Products */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Link Products</CardTitle>
            </CardHeader>
            <CardContent className="max-h-60 overflow-y-auto space-y-3">
              {products.length === 0 && <p className="text-gray-500">No products available.</p>}
              {products.map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`product-${product.id}`}
                    value={product.id}
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product.id]);
                      } else {
                        setSelectedProducts(selectedProducts.filter((id) => id !== product.id));
                      }
                    }}
                    className="cursor-pointer"
                  />
                  <label htmlFor={`product-${product.id}`} className="text-sm cursor-pointer select-none">
                    {product.name}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}