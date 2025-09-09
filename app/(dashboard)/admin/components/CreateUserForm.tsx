// src/app/(dashboard)/admin/components/CreateUserForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // For refreshing
import { Role } from '@prisma/client'; // Prisma's Role enum

export default function CreateUserForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.EMPLOYEE); // Explicitly type Role
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state for button
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true); // Set loading true on submit

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('User created successfully!');
        // Reset form
        setEmail('');
        setName('');
        setPassword('');
        setRole(Role.EMPLOYEE);
        // Refresh the user list by revalidating the path
        router.refresh();
      } else {
        setMessage(`Error: ${data.error || 'Something went wrong!'}`);
      }
    } catch (error) {
      console.error('Registration Error:', error);
      setMessage('Network error or server unavailable.');
    } finally {
      setIsLoading(false); // Set loading false after request
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter user's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter user's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Set a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              User Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)} // Cast to Role enum
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
            >
              {Object.values(Role).map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Creating User...' : 'Create User'}
        </button>
      </form>
      {message && (
        <p className={`mt-5 text-center text-sm ${
          message.startsWith('Error') ? 'text-red-600' : 'text-green-600'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}