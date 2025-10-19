// src/app/(printable)/invoice/components/PrintButton.tsx
'use client';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 print:hidden"
    >
      Print Invoice
    </button>
  )
}