'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product, Category, SupplierProfile, User, ProductStatus } from '@prisma/client';
import { useState } from 'react';
import ProductForm from './ProductForm';
import { useSession } from 'next-auth/react';

type FullProduct = Product & {
  category: Category;
  supplier: SupplierProfile & { user: User };
};

export default function ProductTable({ products }: { products: FullProduct[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role as 'ADMIN' | 'EMPLOYEE' | 'SUPPLIER' | undefined;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FullProduct | null>(null);

  const handleApprove = async (productId: string) => {
    if (!window.confirm("Are you sure you want to approve this product?")) return;
    try {
      const response = await fetch(`/api/products/${productId}/approve`, { method: 'PATCH' });
      if (response.ok) {
        alert('Product approved successfully and is now LIVE!');
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert('Failed to approve product.');
    }
  };

  const handleEdit = (product: FullProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Product deleted successfully!');
        router.refresh();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch {
      alert('Failed to delete product.');
    }
  };

  const getStatusBadgeClass = (status: ProductStatus) => {
    switch (status) {
      case 'LIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Existing Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left bg-white border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 uppercase text-sm">
                <th className="py-3 px-4 font-semibold">Image</th>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Stock</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-base">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <Image
                        src={product.image}
                        alt={product.name ?? 'Product Image'}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                    </td>
                    <td className="py-2 px-4 font-semibold">{product.name ?? 'Unnamed Product'}</td>
                    <td className="py-2 px-4">${product.price.toFixed(2)}</td>
                    <td className="py-2 px-4">{product.stock}</td>
                    <td className="py-2 px-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(product.status)}`}>
                        {product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right space-x-2">
                      {product.status === 'PENDING_APPROVAL' && userRole === 'ADMIN' && (
                        <button
                          onClick={() => handleApprove(product.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
          <div className="relative w-full max-w-2xl max-h-full overflow-y-auto bg-white rounded-xl shadow-lg border">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
              aria-label="Close modal"
            >
              &times;
            </button>
            <ProductForm
              onClose={() => {
                setIsModalOpen(false);
                setEditingProduct(null);
                router.refresh();
              }}
              initialData={editingProduct}
              userRole={userRole ?? 'SUPPLIER'}
            />
          </div>
        </div>
      )}
    </>
  );
}