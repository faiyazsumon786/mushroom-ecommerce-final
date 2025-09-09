// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import WholesaleCartIcon from '../wholesaler/components/WholesaleCartIcon';

// interface SidebarNavProps {
//   userRole?: string | null;
// }

// export default function SidebarNav({ userRole }: SidebarNavProps) {
//   const pathname = usePathname();

//   // ড্যাশবোর্ড লিঙ্ক ডায়নামিক সেট করা
//   let dashboardHref = '/';
//   if (userRole === 'ADMIN') dashboardHref = '/admin/overview';
//   else if (userRole === 'EMPLOYEE') dashboardHref = '/employee/orders';
//   else if (userRole === 'WHOLESALER') dashboardHref = '/wholesaler/dashboard';
//   else if (userRole === 'SUPPLIER') dashboardHref = '/supplier/stock';

//   // লিঙ্কের তালিকা
//   const links = [
//     { href: dashboardHref, label: 'Dashboard', roles: ['ADMIN', 'EMPLOYEE', 'SUPPLIER', 'WHOLESALER'] },

//     { href: '/admin/users', label: 'User Management', roles: ['ADMIN'] },
//     { href: '/admin/categories', label: 'Category Management', roles: ['ADMIN'] },
//     { href: '/admin/reports', label: 'View Daily Reports', roles: ['ADMIN'] },

//     { href: '/admin/products', label: 'Product Management', roles: ['ADMIN', 'EMPLOYEE'] },
//     { href: '/employee/orders', label: 'Order Management', roles: ['ADMIN', 'EMPLOYEE'] },
//     { href: '/employee/stock', label: 'Receive Stock', roles: ['ADMIN', 'EMPLOYEE'] },
//     { href: '/employee/payments', label: 'Supplier Payments', roles: ['ADMIN', 'EMPLOYEE'] },
//     { href: '/employee/shipments', label: 'Incoming Shipments', roles: ['ADMIN', 'EMPLOYEE'] },

//     { href: '/employee/reports', label: 'Submit Daily Report', roles: ['EMPLOYEE'] },

//     { href: '/supplier/stock', label: 'Manage My Stock', roles: ['SUPPLIER'] },
//     { href: '/supplier/shipments/create', label: 'Create Shipment', roles: ['SUPPLIER'] },
//     { href: '/supplier/payments', label: 'Payment History', roles: ['SUPPLIER'] },
//     { href: '/supplier/shipments', label: 'My Shipments', roles: ['SUPPLIER'] },

//     { href: '/wholesaler/products', label: 'Browse Wholesale', roles: ['WHOLESALER'] },
//   ];

//   // লিঙ্ক ফিল্টার এবং রেন্ডার
//   return (
//     <nav className="flex-grow">
//       <ul>
//         {links
//           .filter(link => link.roles.includes(userRole || ''))
//           .map(link => {
//             const isActive = pathname === link.href;
//             return (
//               <li key={link.href} className="mb-3">
//                 <Link
//                   href={link.href}
//                   className={`block rounded px-4 py-2 transition-colors duration-200 ${
//                     isActive
//                       ? 'bg-blue-600 font-semibold text-white'
//                       : 'text-gray-300 hover:bg-gray-700 hover:text-white'
//                   }`}
//                 >
//                   {link.label}
//                 </Link>
//               </li>
//             );
//           })}

//         {/* হোলসেলার হলে কার্ট আইকন দেখাও */}
//         {userRole === 'WHOLESALER' && <WholesaleCartIcon />}
//       </ul>
//     </nav>
//   );
// }


'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarNav({ userRole }: { userRole?: string | null }) {
  const pathname = usePathname();

  // ধাপ ১: ব্যবহারকারীর role অনুযায়ী সঠিক ড্যাশবোর্ডের লিঙ্ক নির্ধারণ করা
  let dashboardHref = '/'; // ডিফল্ট লিঙ্ক
  if (userRole === 'ADMIN') dashboardHref = '/admin/overview';
  if (userRole === 'EMPLOYEE') dashboardHref = '/employee/orders';
  if (userRole === 'WHOLESALER') dashboardHref = '/wholesaler/dashboard';
  if (userRole === 'SUPPLIER') dashboardHref = '/supplier/stock';

  // ধাপ ২: লিঙ্কগুলোর সম্পূর্ণ এবং আপডেট করা তালিকা
  const links = [
    // ডাইনামিক ড্যাশবোর্ড লিঙ্ক
    { href: dashboardHref, label: 'Dashboard', roles: ['ADMIN', 'EMPLOYEE', 'SUPPLIER', 'WHOLESALER'] },
    
    // অ্যাডমিন লিঙ্ক
    { href: '/admin/users', label: 'User Management', roles: ['ADMIN'] },
    { href: '/admin/categories', label: 'Category Management', roles: ['ADMIN'] },
    { href: '/admin/reports', label: 'View Daily Reports', roles: ['ADMIN'] },
    
    // অ্যাডমিন এবং এমপ্লয়ি লিঙ্ক
    { href: '/admin/products', label: 'Product Management', roles: ['ADMIN', 'EMPLOYEE'] },
    { href: '/employee/orders', label: 'Order Management', roles: ['ADMIN', 'EMPLOYEE'] },
    { href: '/employee/shipments', label: 'Incoming Shipments', roles: ['ADMIN', 'EMPLOYEE'] },
    { href: '/employee/payments', label: 'Supplier Payments', roles: ['ADMIN', 'EMPLOYEE'] },

    // এমপ্লয়ি লিঙ্ক
    { href: '/employee/reports', label: 'Submit Daily Report', roles: ['EMPLOYEE'] },
    
    // সাপ্লায়ার লিঙ্ক
    { href: '/supplier/my-products', label: 'My Product Catalog', roles: ['SUPPLIER'] },
    { href: '/supplier/stock', label: 'My Products', roles: ['SUPPLIER'] },
    { href: '/supplier/shipments', label: 'My Shipments', roles: ['SUPPLIER'] },
    { href: '/supplier/shipments/create', label: 'Create Shipment', roles: ['SUPPLIER'] },
    { href: '/supplier/payments', label: 'Payment History', roles: ['SUPPLIER'] },

    
    // হোলসেলার লিঙ্ক
    { href: '/wholesaler/products', label: 'Browse Wholesale', roles: ['WHOLESALER'] },
  ];

  return (
    <nav className="flex-grow">
      <ul>
        {links
          .filter(link => link.roles.includes(userRole || ''))
          .map(link => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href} className="mb-3">
                <Link
                  href={link.href}
                  className={`block rounded px-4 py-2 transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-600 font-semibold text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}