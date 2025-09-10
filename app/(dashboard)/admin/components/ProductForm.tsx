'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Product, SupplierProfile, User, ProductType } from '@prisma/client';
import toast from 'react-hot-toast';
import CustomFileInput from './CustomFileInput';

type SupplierType = SupplierProfile & { user: User };

// FIX 1: Add userRole to the props interface
interface ProductFormProps {
  onClose: () => void;
  initialData?: Product | null;
  userRole: 'ADMIN' | 'EMPLOYEE' | 'SUPPLIER'; // This line is added/updated
}

// FIX 2: Destructure userRole from the props
export default function ProductForm({ onClose, initialData, userRole }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialData?.categoryId || '');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const catRes = await fetch('/api/categories');
        if (!catRes.ok) throw new Error("Failed to fetch categories");
        const catData = await catRes.json();
        setCategories(catData);

        // Only Admins/Employees need the full supplier list for the dropdown
        if (userRole === 'ADMIN' || userRole === 'EMPLOYEE') {
            const supRes = await fetch('/api/suppliers');
            if (!supRes.ok) throw new Error("Failed to fetch suppliers");
            const supData = await supRes.json();
            setSuppliers(supData);
        }
      } catch (error) { toast.error('Failed to load form data.'); }
    }
    fetchData();
  }, [userRole]);

  useEffect(() => {
    if (selectedCategory) {
      setSubcategories(categories.filter(c => c.parentId === selectedCategory));
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const promise = fetch('/api/products', { method: 'POST', body: formData });

    toast.promise(promise, {
      loading: 'Saving product...',
      success: (res) => {
        if (!res.ok) {
          res.json().then(data => toast.error(`Failed: ${data.details || 'Could not create product.'}`));
          throw new Error('Failed to save.');
        }
        router.refresh();
        onClose();
        return 'Product created successfully!';
      },
      error: (err) => `Error: ${err.message}`,
    });
    promise.finally(() => setIsLoading(false));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {initialData ? 'Edit Product' : 'Add New Product'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-4">
        {/* All fields are now correctly typed and should work */}
        <div><label className="block text-sm font-medium text-gray-700">Name</label><input name="name" required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        
        {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && (
        <div><label className="block text-sm font-medium text-gray-700">Short Description</label><textarea name="shortDescription" rows={2} className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        )}

        <div><label className="block text-sm font-medium text-gray-700">Long Description</label><textarea name="description" required rows={4} className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        
        <CustomFileInput name="primaryImage" label="Primary Image (Thumbnail)" required={!initialData} />
        
        {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && (
        <CustomFileInput name="galleryImages" label="Gallery Images (Multiple)" multiple />
        )}
        
        {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && (
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm text-gray-900 font-medium">Retail Price</label><input type="number" name="price" step="0.01" required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
          <div><label className="block text-sm text-gray-900 font-medium">Wholesale Price</label><input type="number" name="wholesalePrice" step="0.01" required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
          <div><label className="block text-sm text-gray-900 font-medium">Stock</label><input type="number" name="stock" required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm text-gray-900 font-medium">Weight</label><input type="number" name="weight" step="0.01" className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
            <div>
                <label className="block text-sm text-gray-900 font-medium">Weight Unit</label>
                <select name="weightUnit" className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900">
                    <option value="">Select Unit</option>
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                    <option value="piece">piece</option>
                </select>
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-900 font-medium">Type</label>
            <select name="type" required className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900">
              {Object.values(ProductType).map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-900 font-medium">Category</label>
            <select name="categoryId" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900">
              <option value="">Select Main Category</option>
              {categories.filter(c => !c.parentId).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-900 font-medium">Sub-Category</label>
            <select name="subcategoryId" className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900" disabled={subcategories.length === 0}>
              <option value="">None</option>
              {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
        </div>
        
        {/* {(userRole === 'ADMIN' || userRole === 'EMPLOYEE') && (
        <div>
          <label className="block text-sm font-medium">Supplier</label>
          <select name="supplierId" required className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900">
            <option value="">Select Supplier</option>
            {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.user?.name ?? 'Unnamed Supplier'}</option>)}
          </select>
        </div>
        )} */}
        
        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}