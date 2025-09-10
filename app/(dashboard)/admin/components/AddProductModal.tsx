'use client';
import { useState } from 'react';
import ProductForm from './ProductForm';
import { useSession } from 'next-auth/react';

export default function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const handleClose = () => setIsOpen(false);
  
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'EMPLOYEE') {
    return null;
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white py-2 px-6 ...">
        Add New Product
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 ...">
          <div className="relative w-full max-w-2xl ...">
            <button onClick={handleClose} className="absolute top-4 right-4 ...">&times;</button>
            <ProductForm onClose={handleClose} initialData={null} />
          </div>
        </div>
      )}
    </>
  );
}