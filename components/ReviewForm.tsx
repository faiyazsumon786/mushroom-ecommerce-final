// src/components/ReviewForm.tsx
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ReviewForm({ productId }: { productId: string }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, rating, comment }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Review submitted successfully!");
                router.refresh(); // Refresh the page to show the new review
            } else {
                toast.error(data.error || "Failed to submit review.");
            }
        } catch (error) {
            toast.error("An error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
            {/* Star Rating Input */}
            <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} onClick={() => setRating(star)} className={`cursor-pointer text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                    </span>
                ))}
            </div>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your thoughts about this product..."
                className="w-full p-2 border rounded-md text-gray-900"
            />
            <button type="submit" disabled={isLoading} className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
                {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}