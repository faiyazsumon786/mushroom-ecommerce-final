'use client';

import { FaPrint } from 'react-icons/fa';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 print:hidden transition-colors"
    >
      <FaPrint />
      <span>Print / Save as PDF</span>
    </button>
  )
}