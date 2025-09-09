'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
// Prisma থেকে সরাসরি আসল এবং সম্পূর্ণ টাইপগুলো ইম্পোর্ট করা হয়েছে
import { Product, Category, SupplierProfile, User, ProductStatus } from '@prisma/client';
import ProductForm from './ProductForm';

// প্রোডাক্টের সাথে সম্পর্কিত সব তথ্যসহ একটি নতুন টাইপ তৈরি করা হয়েছে
type FullProduct = Product & {
  category: Category;
  supplier: SupplierProfile & { user: User };
};

export default function ProductTable({ products }: { products: FullProduct[] }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FullProduct | null>(null);

  // প্রোডাক্ট অনুমোদন (Approve) করার ফাংশন
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

  // প্রোডাক্ট এডিট করার জন্য Modal খোলার ফাংশন
  const handleEdit = (product: FullProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // প্রোডাক্ট ডিলিট করার ফাংশন
  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const promise = fetch(`/api/products/${productId}`, { method: 'DELETE' });
      toast.promise(promise, {
        loading: 'Deleting...',
        success: (res) => {
            if (!res.ok) throw new Error('Failed to delete.');
            router.refresh();
            return 'Product deleted!';
        },
        error: 'Could not delete product.'
      });
    }
  };

  // স্ট্যাটাস অনুযায়ী ভিন্ন ভিন্ন রঙের ব্যাজ দেখানোর জন্য
  const getStatusBadgeClass = (status: ProductStatus) => {
    switch (status) {
      case 'LIVE': return 'bg-green-100 text-green-800';
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover"
                    />
                  </td>
                  <td className="py-2 px-4 font-semibold">{product.name}</td>
                  <td className="py-2 px-4">${product.price.toFixed(2)}</td>
                  <td className="py-2 px-4">{product.stock}</td>
                  <td className="py-2 px-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(product.status)}`}>
                      {product.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-right space-x-2">
                    {product.status === 'PENDING_APPROVAL' && (
                      <button onClick={() => handleApprove(product.id)} className="text-green-600 hover:text-green-800 text-sm font-medium">
                        Approve
                      </button>
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

      {/* প্রোডাক্ট এডিট করার জন্য Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-75">
          <div className="relative w-full max-w-2xl max-h-full bg-white rounded-xl shadow-lg border">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10">&times;</button>
            <ProductForm onClose={() => setIsModalOpen(false)} initialData={editingProduct} />
          </div>
        </div>
      )}
    </>
  );
}