'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Product, Category, User, ProductStatus } from '@prisma/client';
import ProductForm from './ProductForm';

// এখানে SupplierProfile এবং User-এর সম্পর্ক আর প্রয়োজন নেই
type FullProduct = Product & {
  category: Category;
  createdBy: User;
};

export default function ProductTable({ products }: { products: FullProduct[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FullProduct | null>(null);

  const handleApprove = async (productId: string) => {
    const promise = fetch(`/api/products/${productId}/approve`, { method: 'PATCH' });
    toast.promise(promise, {
      loading: 'Approving...',
      success: 'Product approved and is now LIVE!',
      error: 'Could not approve product.',
    });
    promise.then(res => res.ok && router.refresh());
  };

  const handleEdit = (product: FullProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure?')) {
      const promise = fetch(`/api/products/${productId}`, { method: 'DELETE' });
      toast.promise(promise, {
        loading: 'Deleting...',
        success: 'Product deleted!',
        error: 'Could not delete product.',
      });
      promise.then(res => res.ok && router.refresh());
    }
  };
  
  const getStatusBadgeClass = (status: ProductStatus) => { /* ... */ };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-semibold mb-5">Existing Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-sm">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4"><Image src={product.image} alt={product.name} width={50} height={50} className="rounded-lg object-cover" /></td>
                  <td className="py-2 px-4 font-semibold">{product.name}</td>
                  <td className="py-2 px-4">{product.category.name}</td>
                  <td className="py-2 px-4">{product.price.toFixed(2)} BDT</td>
                  <td className="py-2 px-4">{product.stock}</td>
                  <td className="py-2 px-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(product.status)}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right space-x-2">
                    {product.status === 'PENDING_APPROVAL' && (
                      <button onClick={() => handleApprove(product.id)} className="text-green-600 hover:text-green-800 text-sm font-medium">Approve</button>
                    )}
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
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
          <div className="relative w-full max-w-2xl max-h-full bg-white rounded-xl shadow-lg border">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10">&times;</button>
            <ProductForm
              onClose={() => setIsModalOpen(false)}
              initialData={editingProduct}
            />
          </div>
        </div>
      )}
    </>
  );
}