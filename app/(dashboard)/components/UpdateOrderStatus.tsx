'use client';

import { Order, OrderStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function UpdateOrderStatus({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    // বাতিল করার জন্য একটি আলাদা কনফার্মেশন মেসেজ
    if (newStatus === OrderStatus.CANCELLED) {
        if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
            return;
        }
    }

    setIsLoading(true);
    const promise = fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    toast.promise(promise, {
      loading: 'Updating status...',
      success: (res) => {
        if (!res.ok) {
          throw new Error('Failed to update.');
        }
        router.refresh();
        return `Order status updated to ${newStatus}`;
      },
      error: 'Could not update status.',
    });

    promise.finally(() => setIsLoading(false));
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold text-lg mb-2">Actions</h3>
      <div className="flex flex-col space-y-2">
        {currentStatus === OrderStatus.PENDING && (
          <button
            onClick={() => handleUpdateStatus(OrderStatus.CONFIRMED)}
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Confirming...' : 'Confirm Order'}
          </button>
        )}
        {currentStatus === OrderStatus.CONFIRMED && (
          <button
            onClick={() => handleUpdateStatus(OrderStatus.SHIPPED)}
            disabled={isLoading}
            className="bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Shipping...' : 'Mark as Shipped'}
          </button>
        )}
        {currentStatus === OrderStatus.SHIPPED && (
          <button
            onClick={() => handleUpdateStatus(OrderStatus.DELIVERED)}
            disabled={isLoading}
            className="bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? 'Completing...' : 'Mark as Delivered'}
          </button>
        )}

        {/* নতুন Cancel Order বাটন */}
        {(currentStatus === OrderStatus.PENDING || currentStatus === OrderStatus.CONFIRMED) && (
            <button
                onClick={() => handleUpdateStatus(OrderStatus.CANCELLED)}
                disabled={isLoading}
                className="bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
            >
                {isLoading ? 'Cancelling...' : 'Cancel Order'}
            </button>
        )}
      </div>
    </div>
  );
}