'use client';

import { OrderStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UpdateOrderStatusProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export default function UpdateOrderStatus({ orderId, currentStatus }: UpdateOrderStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!orderId || !currentStatus) {
    return <p className="text-red-600">Order data not available.</p>;
  }

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        alert(`Order status updated to ${newStatus}`);
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update order status.');
    } finally {
      setIsLoading(false);
    }
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
      </div>
    </div>
  );
}