'use client';
import { Category } from '@prisma/client';
import { useEffect, useState, FormEvent, useRef } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    const res = await fetch('/api/categories', { cache: 'no-store' });
    if (res.ok) setCategories(await res.json());
    setIsLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const apiEndpoint = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(apiEndpoint, { method, body: formData });
      if (!res.ok) throw new Error('Action failed.');

      toast.success(`Category ${editingCategory ? 'updated' : 'created'}!`);
      setEditingCategory(null);
      formRef.current?.reset();
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || `Could not ${editingCategory ? 'update' : 'create'} category.`);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Could not delete.');
      }
      toast.success('Category deleted!');
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    if(formRef.current) {
      (formRef.current.elements.namedItem('name') as HTMLInputElement).value = category.name;
    }
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    formRef.current?.reset();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Category Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</CardTitle></CardHeader>
            <CardContent>
              <form ref={formRef} id="category-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input id="name" name="name" type="text" defaultValue={editingCategory?.name || ''} required />
                </div>
                <div>
                  <Label htmlFor="image">{editingCategory ? 'Change Image (Optional)' : 'Category Image (Optional)'}</Label>
                  <Input id="image" name="image" type="file" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingCategory ? 'Update Category' : 'Add Category'}</Button>
                  {editingCategory && (
                    <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Existing Categories</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image & Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map(cat => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium flex items-center gap-4">
                        {cat.imageUrl ? (
                          <Image src={cat.imageUrl} alt={cat.name} width={40} height={40} className="rounded-md object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-md"></div>
                        )}
                        <span>{cat.name}</span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
