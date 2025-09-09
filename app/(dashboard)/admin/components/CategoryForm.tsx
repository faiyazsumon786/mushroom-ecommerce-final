'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Category created successfully!');
        setName('');
        router.refresh();
      } else {
        setMessage(`Error: ${data.error || 'Something went wrong'}`);
      }
    } catch (error: unknown) {
      console.error(error); // <-- Avoid ESLint 'unused-vars' warning
      setMessage('Network error or server unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Category</h2>
      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Enter category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-grow p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2.5 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Category'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
