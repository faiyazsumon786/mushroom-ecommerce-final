// src/app/(dashboard)/admin/components/AddProductModal.tsx
'use client';

import { useState } from 'react';
import ProductForm from './ProductForm';

export default function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Add New Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
          <div className="relative w-full max-w-2xl max-h-full overflow-y-auto bg-white rounded-xl shadow-lg border border-gray-200">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ProductForm onClose={handleClose} />
          </div>
        </div>
      )}
    </>
  );
}