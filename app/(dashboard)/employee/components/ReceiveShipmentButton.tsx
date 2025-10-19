// src/app/(dashboard)/employee/components/ReceiveShipmentButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ReceiveShipmentButton({ shipmentId }: { shipmentId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleReceive = async () => {
    if (!window.confirm("Are you sure you have received all items in this shipment?")) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/receive`, {
        method: 'PATCH',
      });

      if (response.ok) {
        alert('Shipment received and stock updated successfully!');
        router.refresh(); // পেজটি রিফ্রেশ করে তালিকা আপডেট করা হচ্ছে
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to process shipment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleReceive}
      disabled={isLoading}
      className="bg-green-600 text-white py-1 px-3 rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-50"
    >
      {isLoading ? 'Processing...' : 'Receive'}
    </button>
  );
}