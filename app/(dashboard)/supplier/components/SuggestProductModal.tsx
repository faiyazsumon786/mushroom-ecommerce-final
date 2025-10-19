// src/app/(dashboard)/supplier/components/SuggestProductModal.tsx
'use client';

import { useState } from 'react';
import ProductForm from '../../admin/components/ProductForm';
import { useSession } from 'next-auth/react';

export default function SuggestProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession(); // Get session on the client

  // Ensure userRole is a string that matches our expected roles
  const userRole = session?.user?.role as 'ADMIN' | 'EMPLOYEE' | 'SUPPLIER';

  if (!userRole) return null; // Or some fallback UI

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700"
      >
        Suggest New Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
          <div className="relative w-full max-w-2xl max-h-full overflow-y-auto bg-white rounded-xl shadow-lg border">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 ...">
              {/* Close Icon SVG */}
            </button>
            <ProductForm onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}