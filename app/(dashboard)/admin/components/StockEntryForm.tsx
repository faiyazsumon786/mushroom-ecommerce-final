'use client';

import { SupplierProfile, User, Product } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type SupplierWithOptions = SupplierProfile & { user: User };

export default function StockEntryForm({
    suppliers,
    products,
}: {
    suppliers: SupplierWithOptions[];
    products: Pick<Product, 'id' | 'name'>[];
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const formData = new FormData(e.currentTarget);

        const supplierId = formData.get('supplierId');
        const productId = formData.get('productId');
        const quantityValue = formData.get('quantity');

        if (
            typeof supplierId !== 'string' ||
            typeof productId !== 'string' ||
            typeof quantityValue !== 'string'
        ) {
            setMessage('Invalid form data');
            setIsLoading(false);
            return;
        }

        const quantity = Number(quantityValue);
        if (isNaN(quantity) || quantity <= 0) {
            setMessage('Quantity must be a positive number');
            setIsLoading(false);
            return;
        }

        const data = { supplierId, productId, quantity };

        try {
            const response = await fetch('/api/stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setMessage('Stock updated successfully!');
                (e.target as HTMLFormElement).reset();
                router.refresh();
            } else {
                const errorData = await response.json();
                setMessage(`Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setMessage('Failed to connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Supplier</label>
                    <select
                        name="supplierId"
                        required
                        className="w-full p-2.5 border rounded-lg bg-white text-gray-900"
                    >
                        <option value="">Select a supplier</option>
                        {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.user.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Product</label>
                    <select
                        name="productId"
                        required
                        className="w-full p-2.5 border rounded-lg bg-white text-gray-900"
                    >
                        <option value="">Select a product</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity Received</label>
                    <input
                        name="quantity"
                        type="number"
                        min="1"
                        required
                        className="w-full p-2.5 border rounded-lg text-gray-900"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                    {isLoading ? 'Updating Stock...' : 'Add to Stock'}
                </button>
                {message && (
                    <p
                        className={`mt-4 text-center text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'
                            }`}
                    >
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}