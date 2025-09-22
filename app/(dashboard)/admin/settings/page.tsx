// src/app/(dashboard)/admin/settings/page.tsx
'use client';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SiteSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        const promise = fetch('/api/admin/settings', {
            method: 'POST',
            body: formData,
        });

        toast.promise(promise, {
            loading: 'Uploading new logo...',
            success: (res) => {
                if (!res.ok) throw new Error("Upload failed.");
                // We can also trigger a router.refresh() if needed, but a full reload might be better to see the new header logo
                window.location.reload();
                return 'Logo updated successfully! The page will now reload.';
            },
            error: 'Could not update logo.'
        });

        promise.finally(() => setIsLoading(false));
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold">Site Settings</h1>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Website Logo</CardTitle>
                    <CardDescription>Update the main logo for your e-commerce site.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="logo">New Logo Image</Label>
                            <Input id="logo" name="logo" type="file" required />
                            <p className="text-sm text-gray-500 mt-2">Recommended: PNG with a transparent background, approx. 70x50 pixels.</p>
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Uploading...' : 'Save New Logo'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}