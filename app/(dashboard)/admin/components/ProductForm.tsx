'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Product, ProductType } from '@prisma/client';
import toast from 'react-hot-toast';
import CustomFileInput from './CustomFileInput';
import imageCompression from 'browser-image-compression';

interface ProductFormProps {
  onClose: () => void;
  initialData?: Product | null;
}

const formatEnum = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

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
    toast.loading(initialData ? 'Updating product...' : 'Saving product...');
    
    const form = e.currentTarget;
    const formData = new FormData();

    new FormData(form).forEach((value, key) => {
      if (!(value instanceof File)) {
        formData.append(key, value);
      }
    });
    
    const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };

    try {
      const primaryImageFile = (form.elements.namedItem('primaryImage') as HTMLInputElement).files?.[0];
      if (primaryImageFile && primaryImageFile.size > 0) {
        const compressedFile = await imageCompression(primaryImageFile, options);
        formData.append('primaryImage', compressedFile, compressedFile.name);
      } else if (!initialData) {
        toast.error("Primary image is required.");
        setIsLoading(false);
        toast.dismiss();
        return;
      }

      const galleryImageFiles = Array.from((form.elements.namedItem('galleryImages') as HTMLInputElement).files || []);
      for (const file of galleryImageFiles) {
        if (file.size > 0) {
          const compressedFile = await imageCompression(file, options);
          formData.append('galleryImages', compressedFile, compressedFile.name);
        }
      }

      // Edit functionality will require a different API endpoint and method
      const apiEndpoint = initialData ? `/api/products/${initialData.id}` : '/api/products';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(apiEndpoint, { method, body: formData });
      
      toast.dismiss();

      if (response.ok) {
        toast.success(`Product ${initialData ? 'updated' : 'created'} successfully!`);
        router.refresh();
        onClose();
      } else {
        const data = await response.json();
        toast.error(`Failed: ${data.details || 'Could not save product.'}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('An error occurred during image processing or upload.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {initialData ? 'Edit Product' : 'Add New Product'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-4">
        {/* All fields except supplier */}
        <div><label className="block text-sm font-medium text-gray-800">Name</label><input name="name" defaultValue={initialData?.name} required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        <div><label className="block text-sm font-medium text-gray-800">Short Description</label><textarea name="shortDescription" defaultValue={initialData?.shortDescription || ''} rows={2} className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        <div><label className="block text-sm font-medium text-gray-800">Long Description</label><textarea name="description" defaultValue={initialData?.description} required rows={4} className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        
        <CustomFileInput name="primaryImage" label="Primary Image (Thumbnail)" required={!initialData} />
        <CustomFileInput name="galleryImages" label="Gallery Images (Multiple)" multiple />
        
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-gray-800">Retail Price</label><input type="number" name="price" defaultValue={initialData?.price} step="0.01" required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
          <div><label className="block text-sm font-medium text-gray-800">Wholesale Price</label><input type="number" name="wholesalePrice" defaultValue={initialData?.wholesalePrice} step="0.01" required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
          <div><label className="block text-sm font-medium text-gray-800">Stock</label><input type="number" name="stock" defaultValue={initialData?.stock} required className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-800">Weight</label><input type="number" name="weight" step="0.01" defaultValue={initialData?.weight || ''} className="w-full mt-1 p-2 border rounded-md text-gray-900" /></div>
            <div>
                <label className="block text-sm font-medium text-gray-800">Weight Unit</label>
                <select name="weightUnit" defaultValue={initialData?.weightUnit || ''} className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900">
                    <option value="">Select Unit</option>
                    <option value="kg">kg</option>
                    <option value="gram">gram</option>
                    <option value="piece">piece</option>
                </select>
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-800">Type</label>
            <select name="type" defaultValue={initialData?.type} required className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900">
              {Object.values(ProductType).map(type => (<option key={type} value={type}>{formatEnum(type)}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Category</label>
            <select name="categoryId" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900">
              <option value="">Select Main Category</option>
              {categories.filter(c => !c.parentId).map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800">Sub-Category</label>
            <select name="subcategoryId" defaultValue={initialData?.subcategoryId || ''} className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900" disabled={subcategories.length === 0}>
              <option value="">None</option>
              {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
            </select>
          </div>
        </div>
        
        <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
          {isLoading ? (initialData ? 'Updating...' : 'Saving...') : (initialData ? 'Save Changes' : 'Save Product')}
        </button>
      </form>
    </div>
  );
}