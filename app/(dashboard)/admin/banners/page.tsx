'use client';
import { Banner } from '@prisma/client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BannerManagementPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // <-- নতুন preview state
    const router = useRouter();

    const fetchBanners = async () => {
        setIsLoading(true);
        const res = await fetch('/api/banners', { cache: 'no-store' });
        if (res.ok) setBanners(await res.json());
        setIsLoading(false);
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file)); // প্রিভিউ URL তৈরি করা
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const promise = fetch('/api/admin/banners', { method: 'POST', body: formData });

        toast.promise(promise, {
            loading: 'Uploading banner...',
            success: (res) => {
                if (!res.ok) throw new Error('Failed to upload.');
                fetchBanners();
                (e.target as HTMLFormElement).reset();
                setPreviewUrl(null); // প্রিভিউ রিসেট করা
                return 'Banner added successfully!';
            },
            error: 'Could not add banner.'
        });
    };
    
    const handleDelete = async (bannerId: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        const promise = fetch(`/api/admin/banners/${bannerId}`, { method: 'DELETE' });
        toast.promise(promise, {
            loading: 'Deleting banner...',
            success: 'Banner deleted!',
            error: 'Could not delete.'
        });
        promise.then(() => fetchBanners());
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold">Homepage Banner Management</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader><CardTitle>Add New Banner</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="image">Banner Image</Label>
                                    <Input id="image" name="image" type="file" required onChange={handleFileChange} />
                                </div>
                                <div>
                                    <Label htmlFor="title">Banner Title (Optional)</Label>
                                    <Input id="title" name="title" type="text" placeholder="e.g., Fresh Summer Collection" />
                                </div>
                                <div>
                                    <Label htmlFor="link">Link (Optional)</Label>
                                    <Input id="link" name="link" type="text" placeholder="/products/category/xyz" />
                                </div>
                                <Button type="submit">Add Banner</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader><CardTitle>Current Banners</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {/* লাইভ প্রিভিউ */}
                            {previewUrl && (
                                <div className="relative w-full h-48 rounded-md overflow-hidden border shadow-lg bg-gray-200">
                                    <Image src={previewUrl} alt="Live Banner Preview" fill className="object-cover" />
                                </div>
                            )}

                            {/* বিদ্যমান ব্যানারগুলোর তালিকা */}
                            {isLoading ? <p>Loading banners...</p> : banners.map(banner => (
                                <div key={banner.id} className="flex items-center justify-between p-2 border rounded-lg">
                                    <Image src={banner.imageUrl} alt={banner.title || ''} width={100} height={50} className="object-cover rounded-md" />
                                    <p className="font-semibold">{banner.title}</p>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(banner.id)}>Delete</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}