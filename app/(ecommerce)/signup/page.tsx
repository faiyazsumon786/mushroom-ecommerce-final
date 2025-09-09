// src/app/(ecommerce)/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        alert('Registration successful! Please log in.');
        router.push('/login'); // Redirect to login page on success
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center">Create an Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-3 border rounded-lg text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-3 border rounded-lg text-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 p-3 border rounded-lg text-gray-900" />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}