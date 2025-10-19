'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DailyReportPage() {
  const [reportText, setReportText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportText }),
      });
      
      if (response.ok) {
        setMessage('Report submitted successfully!');
        setReportText('');
        router.refresh();
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      setMessage('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-900">Submit Daily Report</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <form onSubmit={handleSubmit}>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={10}
            className="w-full p-4 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
            placeholder="Summarize your work for the day..."
            required
          ></textarea>
          <button
            type="submit"
            disabled={isLoading || !reportText}
            className="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </button>
          {message && <p className={`mt-4 text-center text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
        </form>
      </div>
    </div>
  );
}