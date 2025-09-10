'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Product, ProductType } from '@prisma/client';
import toast from 'react-hot-toast';
import CustomFileInput from './CustomFileInput';

interface ProductFormProps {
  onClose: () => void;
  initialData?: Product | null;
}

export default function ProductForm({ onClose, initialData }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialData?.categoryId || '');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) { toast.error('Failed to load categories.'); }
    }
    fetchCategories();
  }, []);

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
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-4">
        <div><label className="block text-sm font-medium text-gray-700">Name</label><input name="name" required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Short Description</label><textarea name="shortDescription" rows={2} className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Long Description</label><textarea name="description" required rows={4} className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        
        <CustomFileInput name="primaryImage" label="Primary Image (Thumbnail)" required={!initialData} />
        <CustomFileInput name="galleryImages" label="Gallery Images (Multiple)" multiple />
        
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium">Retail Price</label><input type="number" name="price" step="0.01" required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
          <div><label className="block text-sm font-medium">Wholesale Price</label><input type="number" name="wholesalePrice" step="0.01" required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
          <div><label className="block text-sm font-medium">Stock</label><input type="number" name="stock" required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium">Weight</label><input type="number" name="weight" step="0.01" className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
            <div>
                <label className="block text-sm font-medium">Weight Unit</label>
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
            <label className="block text-sm font-medium">Type</label>
            <select name="type" required className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900">
              {Object.values(ProductType).map(type => (<option key={type} value={type}>{type}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select name="categoryId" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900">
              <option value="">Select Main Category</option>
              {categories.filter(c => !c.parentId).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Sub-Category</label>
            <select name="subcategoryId" className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900" disabled={subcategories.length === 0}>
              <option value="">None</option>
              {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
        </div>

        {/* --- সাপ্লায়ার সিলেক্ট করার সেকশনটি এখান থেকে মুছে ফেলা হয়েছে --- */}
        
        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}