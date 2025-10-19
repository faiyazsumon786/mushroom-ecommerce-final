// src/app/(dashboard)/supplier/my-products/page.tsx
'use client';

import { SupplierProduct } from '@prisma/client';
import { useEffect, useState, FormEvent } from 'react';
import toast from 'react-hot-toast';

export default function MyProductsPage() {
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupplierProduct | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    const res = await fetch('/api/supplier-products');
    if (res.ok) {
      const data = await res.json();
      setProducts(data);
    } else {
      toast.error("Could not fetch products.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  
  const openModal = (product: SupplierProduct | null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const apiEndpoint = editingProduct ? `/api/supplier-products/${editingProduct.id}` : '/api/supplier-products';
    const method = editingProduct ? 'PUT' : 'POST';

    const promise = fetch(apiEndpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    toast.promise(promise, {
      loading: 'Saving...',
      success: (res) => {
        if (!res.ok) throw new Error('Failed to save.');
        closeModal();
        fetchProducts();
        return `Product ${editingProduct ? 'updated' : 'created'}!`;
      },
      error: 'Could not save product.'
    });
  };
  
  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const promise = fetch(`/api/supplier-products/${productId}`, { method: 'DELETE' });
      toast.promise(promise, {
        loading: 'Deleting...',
        success: (res) => {
          if (!res.ok) throw new Error('Failed to delete.');
          fetchProducts();
          return 'Product deleted!';
        },
        error: 'Could not delete product.'
      });
    }
  };

  if (isLoading) return <div className="p-8">Loading your products...</div>;

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-gray-900">My Product Catalog</h1>
          <button onClick={() => openModal(null)} className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold">Add New Product</button>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Wholesale Price</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{product.name}</td>
                  <td className="py-3 px-4">${product.wholesalePrice.toFixed(2)}</td>
                  <td className="py-3 px-4">{product.unit}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => openModal(product)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-lg border">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input name="name" type="text" defaultValue={editingProduct?.name} required className="w-full p-2.5 border rounded-lg text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea name="description" defaultValue={editingProduct?.description || ''} required rows={3} className="w-full p-2.5 border rounded-lg text-gray-900" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Wholesale Price</label>
                      <input name="wholesalePrice" type="number" step="0.01" defaultValue={editingProduct?.wholesalePrice} required className="w-full p-2.5 border rounded-lg text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Unit (kg, box, piece)</label>
                      <input name="unit" type="text" defaultValue={editingProduct?.unit} required className="w-full p-2.5 border rounded-lg text-gray-900" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700">Save Product</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}