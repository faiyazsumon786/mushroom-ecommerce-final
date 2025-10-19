// src/app/(dashboard)/employee/page.tsx
import { redirect } from 'next/navigation';

export default function EmployeeRootPage() {
  redirect('/employee/orders');
}