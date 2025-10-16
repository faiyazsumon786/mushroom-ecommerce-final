// src/app/(dashboard)/admin/page.tsx
import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  // যখনই কোনো অ্যাডমিন /admin-এ আসবে, তাকে স্বয়ংক্রিয়ভাবে /admin/overview-তে পাঠিয়ে দেওয়া হবে
  redirect('/admin/overview');
  
  return null; // এই পেজে কিছু দেখানোর প্রয়োজন নেই
}