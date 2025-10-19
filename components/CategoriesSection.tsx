import prisma from '@/lib/prisma';
import CategoryGrid from './CategoryGrid'; // <-- নতুন 'ওয়েটার' কম্পোনেন্ট ইম্পোর্ট করা হয়েছে

// এই ফাংশনটি এখন সব মূল ক্যাটাগরি নিয়ে আসবে
async function getCategories() {
  return prisma.category.findMany({ 
    where: { parentId: null },
    orderBy: { name: 'asc' }
  });
}

// এটি এখন একটি বিশুদ্ধ Server Component (শেফ)
export default async function CategoriesSection() {
  const categories = await getCategories();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center">
            <h2 className="font-serif text-4xl font-bold text-dark">Shop By Category</h2>
            <p className="mt-2 text-gray-600">Find the perfect products from our curated collections.</p>
        </div>
        {/* শেফ এখন ওয়েটারকে ডেটা পাঠিয়ে দিচ্ছে */}
        <CategoryGrid categories={categories} />
      </div>
    </section>
  );
}