'use client';

import { PortfolioArticle, PortfolioImage } from '@prisma/client';
import { useEffect, useState, FormEvent, useRef } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TiptapEditor from '@/components/TiptapEditor';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

type FullPortfolioArticle = PortfolioArticle & { images: PortfolioImage[] };

export default function PortfolioManagementPage() {
  const [article, setArticle] = useState<FullPortfolioArticle | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmittingArticle, setIsSubmittingArticle] = useState(false);
  const [isSubmittingImages, setIsSubmittingImages] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/admin/portfolio', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setArticle(data);
          setTitle(data.title);
          setContent(data.content);
        }
      }
    } catch (error) {
      toast.error("Could not fetch portfolio data.");
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleTextSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingArticle(true);
    const promise = fetch('/api/admin/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    toast.promise(promise, {
      loading: 'Saving article...',
      success: 'Article saved successfully!',
      error: 'Failed to save article.',
    });
    promise.finally(() => setIsSubmittingArticle(false));
  };
  
  const handleImageSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return toast.error("Please select images to upload.");
    
    setIsSubmittingImages(true);
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));

    const promise = fetch('/api/admin/portfolio/images', { method: 'POST', body: formData });

    toast.promise(promise, {
      loading: 'Uploading images...',
      success: 'Images uploaded!',
      error: 'Failed to upload images.',
    });

    promise.then(async (res) => {
      if (res.ok) {
        setImages([]);
        if (imageInputRef.current) imageInputRef.current.value = "";
        await fetchPortfolio();
      }
    }).finally(() => setIsSubmittingImages(false));
  };
  
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure?')) return;
    
    const promise = fetch('/api/admin/portfolio/images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    });

    toast.promise(promise, {
      loading: 'Deleting image...',
      success: 'Image deleted!',
      error: 'Failed to delete.',
    }).then(async (result) => {
      if (typeof result === 'string') {
        await fetchPortfolio();
      }
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Edit Portfolio Page</h1>
      <Card>
        <CardHeader><CardTitle>Article Section</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div>
              <Label className="text-lg font-semibold">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label className="text-lg font-semibold">Content / Story</Label>
              <TiptapEditor content={content} onChange={setContent} />
            </div>
            <Button type="submit" disabled={isSubmittingArticle}>
              {isSubmittingArticle ? 'Saving...' : 'Save Article'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Gallery Section</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleImageSubmit} className="space-y-4">
            <div>
              <Label>Add New Images to Gallery</Label>
              <Input ref={imageInputRef} name="images" type="file" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} />
            </div>
            <Button type="submit" disabled={isSubmittingImages}>
              {isSubmittingImages ? 'Uploading...' : 'Upload Images'}
            </Button>
          </form>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Current Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {article?.images?.map((item: PortfolioImage) => (
                <div key={item.id} className="relative group aspect-square">
                  <Image src={item.imageUrl} alt={item.caption || 'Portfolio Image'} fill className="rounded-md object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button type="button" variant="destructive" size="icon" onClick={() => handleDeleteImage(item.id)}><Trash2 /></Button>
                  </div>
                </div>
              ))}
            </div>
            {article?.images?.length === 0 && <p className="text-gray-500">No images in the gallery yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}