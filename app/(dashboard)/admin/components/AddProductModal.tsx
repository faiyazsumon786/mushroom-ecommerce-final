'use client';
import { useState } from 'react';
import ProductForm from './ProductForm';

export default function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);

  // এখানে তুমি role ডাইনামিকভাবে আনতে পারো (session / context থেকে)
  // আপাতত hardcoded করলাম
  const userRole: "ADMIN" | "EMPLOYEE" = "ADMIN";

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add New Product
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
          <div className="relative w-full max-w-2xl max-h-full bg-white rounded-xl shadow-lg border">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
            >
              &times;
            </button>

            {/* এখন userRole সঠিকভাবে pass হচ্ছে */}
            <ProductForm onClose={handleClose} userRole={userRole} />
          </div>
        </div>
      )}
    </>
  );
}
