'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Product, Category, User, ProductStatus } from '@prisma/client';
import ProductForm from './ProductForm';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/formatCurrency';

type FullProduct = Product & {
  category: Category;
  createdBy: User;
};

export default function ProductTable({ products }: { products: FullProduct[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FullProduct | null>(null);

  const userRole = session?.user?.role;

  const handleApprove = async (productId: string) => {
    const promise = fetch(`/api/products/${productId}/approve`, { method: 'PATCH' });
    toast.promise(promise, {
      loading: 'Approving...',
      success: (res) => {
        if (!res.ok) throw new Error('Failed to approve.');
        router.refresh();
        return 'Product approved and is now LIVE!';
      },
      error: 'Could not approve product.'
    });
  };

  const handleEdit = (product: FullProduct) => {
    setEditingProduct(product); // 'setEditingProduct' is now used here
    setIsModalOpen(true);
  };

  const handleArchive = async (productId: string) => {
    if (confirm('Are you sure you want to archive this product?')) {
      // 'productId' is now used here
      const promise = fetch(`/api/products/${productId}`, { method: 'DELETE' });
      toast.promise(promise, {
        loading: 'Archiving...',
        success: (res) => {
          if (!res.ok) throw new Error('Failed to archive.');
          router.refresh();
          return 'Product archived!';
        },
        error: 'Could not archive product.'
      });
    }
  };
  
  const getStatusBadgeClass = (status: ProductStatus) => {
    switch (status) {
      case ProductStatus.LIVE: return 'bg-green-100 text-green-800';
      case ProductStatus.PENDING_APPROVAL: return 'bg-yellow-100 text-yellow-800';
      case ProductStatus.ARCHIVED: return 'bg-gray-200 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

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
                  <td className="py-2 px-4">{formatCurrency(product.price)}</td>
                  <td className="py-2 px-4">{product.stock}</td>
                  <td className="py-2 px-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(product.status)}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right space-x-2">
                    {product.status === ProductStatus.PENDING_APPROVAL && userRole === 'ADMIN' && (
                      <button onClick={() => handleApprove(product.id)} className="text-green-600 hover:text-green-800 text-sm font-medium">Approve</button>
                    )}
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                    {product.status !== ProductStatus.ARCHIVED && (
                      <button onClick={() => handleArchive(product.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Archive</button>
                    )}
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