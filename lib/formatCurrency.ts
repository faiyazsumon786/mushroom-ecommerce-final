// src/lib/formatCurrency.ts

export function formatCurrency(amount: number): string {
  // Intl.NumberFormat জাভাস্ক্রিপ্টের একটি বিল্ট-ইন ফিচার যা কারেন্সি ফরম্যাটিং-এর জন্য بهترین
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
  }).format(amount);
}