// src/app/(dashboard)/admin/categories/page.tsx
import CategoryForm from '../components/CategoryForm';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Category Management</h1>
      
      <CategoryForm />

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-5 text-gray-800">Existing Categories</h2>
        
        {categories.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-lg">
            No categories found.
          </div>
        ) : (
          <ul className="space-y-3">
            {categories.map((category) => (
              <li key={category.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-medium text-gray-700">{category.name}</span>
                {/* Future Actions Here */}
                <div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4">Edit</button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}