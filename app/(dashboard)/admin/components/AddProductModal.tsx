'use client';

import { useState } from 'react';
import ProductForm from './ProductForm';
import { useSession } from 'next-auth/react';

export default function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession(); // সেশন থেকে ডেটা নিন

  const handleClose = () => {
    setIsOpen(false);
  };
  
  // অ্যাডমিন বা এমপ্লয়ি না হলে বাটনটিই দেখানো হবে না
  const userRole = session?.user?.role as 'ADMIN' | 'EMPLOYEE' | 'SUPPLIER';
  if (userRole !== 'ADMIN' && userRole !== 'EMPLOYEE') {
    return null;
  }

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
          <div className="relative w-full max-w-2xl max-h-full overflow-y-auto bg-white rounded-xl shadow-lg border">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* এখানে userRole prop টি পাস করা হয়েছে */}
            <ProductForm onClose={handleClose} userRole={userRole} />
          </div>
        </div>
      )}
    </>
  );
}