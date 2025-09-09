'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PaymentActions({ paymentId }: { paymentId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleMarkAsPaid = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/supplier-payments/${paymentId}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        alert('Payment marked as PAID.');
        router.refresh();
      } else {
        alert('Failed to update payment status.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      alert('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkAsPaid}
      disabled={isLoading}
      className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
    >
      {isLoading ? 'Processing...' : 'Mark as Paid'}
    </button>
  );
}