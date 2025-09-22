// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';

// export default function SidebarNav({ userRole }: { userRole?: string | null }) {
//   const pathname = usePathname();

//   // ধাপ ১: ব্যবহারকারীর role অনুযায়ী সঠিক ড্যাশবোর্ডের লিঙ্ক নির্ধারণ করা
//   let dashboardHref = '/'; // ডিফল্ট লিঙ্ক
//   if (userRole === 'ADMIN') dashboardHref = '/admin/overview';
//   if (userRole === 'EMPLOYEE') dashboardHref = '/employee/orders';
//   if (userRole === 'WHOLESALER') dashboardHref = '/wholesaler/dashboard';
//   if (userRole === 'SUPPLIER') dashboardHref = '/supplier/stock';

//   // ধাপ ২: লিঙ্কগুলোর সম্পূর্ণ এবং আপডেট করা তালিকা
//   const links = [
//     // ডাইনামিক ড্যাশবোর্ড লিঙ্ক
//     { href: dashboardHref, label: 'Dashboard', roles: ['ADMIN', 'EMPLOYEE', 'SUPPLIER', 'WHOLESALER'] },
    
//     // অ্যাডমিন লিঙ্ক
//     { href: '/admin/users', label: 'User Management', roles: ['ADMIN'] },
//     { href: '/admin/categories', label: 'Category Management', roles: ['ADMIN'] },
//     { href: '/admin/reports', label: 'View Daily Reports', roles: ['ADMIN'] },
    
//     // অ্যাডমিন এবং এমপ্লয়ি লিঙ্ক
//     { href: '/admin/products', label: 'Product Management', roles: ['ADMIN', 'EMPLOYEE'] },
//     { href: '/employee/orders', label: 'Order Management', roles: ['ADMIN', 'EMPLOYEE'] },
//     { href: '/employee/shipments', label: 'Incoming Shipments', roles: ['ADMIN', 'EMPLOYEE'] },
//     { href: '/employee/payments', label: 'Supplier Payments', roles: ['ADMIN', 'EMPLOYEE'] },
//     { href: '/admin/blog', label: 'Blog Management', roles: ['ADMIN', 'EMPLOYEE'] },
//     { href: '/admin/messages', label: 'Customer Messages', roles: ['ADMIN', 'EMPLOYEE'] },
//     { href: '/admin/banners', label: 'Banner Management', roles: ['ADMIN', 'EMPLOYEE']},
//     { href: '/admin/settings', label: 'Site Settings', icon: Settings, roles: ['ADMIN'] }, 

//     // এমপ্লয়ি লিঙ্ক
//     { href: '/employee/reports', label: 'Submit Daily Report', roles: ['EMPLOYEE'] },
    
//     // সাপ্লায়ার লিঙ্ক
//     { href: '/supplier/my-products', label: 'My Product Catalog', roles: ['SUPPLIER'] },
//     { href: '/supplier/stock', label: 'My Products', roles: ['SUPPLIER'] },
//     { href: '/supplier/shipments', label: 'My Shipments', roles: ['SUPPLIER'] },
//     { href: '/supplier/shipments/create', label: 'Create Shipment', roles: ['SUPPLIER'] },
//     { href: '/supplier/payments', label: 'Payment History', roles: ['SUPPLIER'] },

    
//     // হোলসেলার লিঙ্ক
//     { href: '/wholesaler/products', label: 'Browse Wholesale', roles: ['WHOLESALER'] },
//   ];

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
//       </ul>
//     </nav>
//   );
// }


'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Box, 
    ClipboardList, 
    MessageSquare, 
    FileText, 
    Truck, 
    CreditCard, 
    Settings,
    Users,
    BookOpen,
    GalleryHorizontalEnd
} from 'lucide-react';

export default function SidebarNav({ userRole }: { userRole?: string | null }) {
  const pathname = usePathname();

  const links = [
    // ডাইনামিক ড্যাশবোর্ড লিঙ্ক
    { href: '/admin/overview', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { href: '/employee/orders', label: 'Order Management', icon: ClipboardList, roles: ['EMPLOYEE'] },
    { href: '/supplier/stock', label: 'My Products', icon: Box, roles: ['SUPPLIER'] },
    { href: '/wholesaler/products', label: 'Browse Wholesale', icon: Box, roles: ['WHOLESALER'] },
    
    // অ্যাডমিন লিঙ্ক
    { href: '/admin/users', label: 'User Management', icon: Users, roles: ['ADMIN'] },
    { href: '/admin/products', label: 'Product Management', icon: Box, roles: ['ADMIN'] },
    { href: '/admin/categories', label: 'Category Management', icon: ClipboardList, roles: ['ADMIN'] },
    { href: '/admin/banners', label: 'Banner Management', icon: GalleryHorizontalEnd, roles: ['ADMIN'] },
    { href: '/admin/blog', label: 'Blog Management', icon: BookOpen, roles: ['ADMIN'] },
    { href: '/admin/messages', label: 'Customer Messages', icon: MessageSquare, roles: ['ADMIN'] },
    { href: '/admin/reports', label: 'View Daily Reports', icon: FileText, roles: ['ADMIN'] },
    { href: '/admin/settings', label: 'Site Settings', icon: Settings, roles: ['ADMIN'] }, 

    // এমপ্লয়ি লিঙ্ক
    { href: '/employee/shipments', label: 'Incoming Shipments', icon: Truck, roles: ['EMPLOYEE'] },
    { href: '/employee/payments', label: 'Supplier Payments', icon: CreditCard, roles: ['EMPLOYEE'] },
    { href: '/employee/reports', label: 'Submit Daily Report', icon: FileText, roles: ['EMPLOYEE'] },
    
    // সাপ্লায়ার লিঙ্ক
    { href: '/supplier/my-products', label: 'My Product Catalog', icon: Box, roles: ['SUPPLIER'] },
    { href: '/supplier/shipments', label: 'My Shipments', icon: Truck, roles: ['SUPPLIER'] },
    // { href: '/supplier/shipments/create', label: 'Create Shipment', icon: PlusCircle, roles: ['SUPPLIER'] },
    { href: '/supplier/payments', label: 'Payment History', icon: CreditCard, roles: ['SUPPLIER'] },

    // হোলসেলার লিঙ্ক
    { href: '/wholesaler/dashboard', label: 'My Dashboard', icon: LayoutDashboard, roles: ['WHOLESALER'] },
    // { href: '/wholesaler/cart', label: 'My Cart', icon: ShoppingCart, roles: ['WHOLESALER'] },
  ];

  const filteredLinks = links.filter(link => link.roles.includes(userRole || ''));

  return (
    <nav className="flex-1">
      <ul>
        {filteredLinks.map(link => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href} className="mb-2">
              <Link
                href={link.href}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}