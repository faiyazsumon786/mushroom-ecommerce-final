'use client';
import { Post, Product, PostStatus } from '@prisma/client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TiptapEditor from '@/components/TiptapEditor'; // <-- নতুন এডিটর ইম্পোর্ট করুন

export default function PostEditorPage() {
    const router = useRouter();
    const params = useParams();
    const postId = params.postId as string;
    const isNewPost = postId === 'new';

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<PostStatus>('DRAFT');
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await fetch('/api/products', { cache: 'no-store' });
            if (res.ok) setProducts(await res.json());
        };
        fetchProducts();

        if (!isNewPost) {
            const fetchPost = async () => {
                const res = await fetch(`/api/admin/posts/${postId}`);
                if (res.ok) {
                    const data = await res.json();
                    setTitle(data.title);
                    setContent(data.content);
                    setStatus(data.status);
                    setSelectedProducts(data.products.map((p: Product) => p.id));
                }
            };
            fetchPost();
        }
    }, [isNewPost, postId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title || !content || (!featuredImage && isNewPost)) {
            return toast.error("Title, content, and a featured image are required for a new post.");
        }
        setIsLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('status', status);
        if (featuredImage) {
            formData.append('featuredImage', featuredImage);
        }
        selectedProducts.forEach(productId => formData.append('productIds', productId));
        
        const apiEndpoint = isNewPost ? '/api/admin/posts' : `/api/admin/posts/${postId}`;
        const method = isNewPost ? 'POST' : 'PUT';
        
        const body = isNewPost ? formData : JSON.stringify({ title, content, status, productIds: selectedProducts });
        const headers = isNewPost ? {} : { 'Content-Type': 'application/json' };

        const promise = fetch(apiEndpoint, { method, body, headers });

        toast.promise(promise, {
            loading: 'Saving post...',
            success: (res) => {
                if (!res.ok) throw new Error('Failed to save post.');
                router.push('/admin/blog');
                return 'Post saved successfully!';
            },
            error: 'Could not save post.'
        });

        promise.finally(() => setIsLoading(false));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold">{isNewPost ? 'Create New Post' : 'Edit Post'}</h1>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (isNewPost ? 'Publish Post' : 'Update Post')}
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <Label className="font-semibold text-lg">Post Title</Label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your amazing blog title" />
                            </div>
                            <div>
                                <Label className="font-semibold text-lg">Content</Label>
                                <div className="mt-2">
                                    <TiptapEditor content={content} onChange={setContent} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Post Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <Label>Status</Label>
                                <Select onValueChange={(value: PostStatus) => setStatus(value)} value={status}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="PUBLISHED">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{isNewPost ? 'Featured Image' : 'Change Image (Optional)'}</Label>
                                <Input type="file" onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Link Products</CardTitle></CardHeader>
                        <CardContent className="max-h-60 overflow-y-auto">
                            <div className="space-y-2">
                                {products.map(product => (
                                    <div key={product.id} className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            id={`product-${product.id}`}
                                            value={product.id}
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedProducts([...selectedProducts, product.id]);
                                                } else {
                                                    setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                                                }
                                            }}
                                        />
                                        <label htmlFor={`product-${product.id}`} className="text-sm">{product.name}</label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}