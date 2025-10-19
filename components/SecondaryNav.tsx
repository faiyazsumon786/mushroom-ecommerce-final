'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

type NavData = {
  type: string;
  categories: { id: string; name: string }[];
}[];

export function SecondaryNav({ navData }: { navData: NavData }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="hidden md:flex h-14 items-center justify-center border-b bg-white shadow-sm">
      <NavigationMenu>
        <NavigationMenuList>
          {navData.map((item) => {
            const isActive = pathname === '/products' && searchParams.get('type') === item.type;
            return (
              <NavigationMenuItem key={item.type}>
                {/* মূল সমাধান: Link এখন Trigger-এর ভেতরে */}
                <NavigationMenuTrigger className={`text-base font-semibold ${isActive ? 'text-primary' : ''}`}>
                  <Link href={`/products?type=${item.type}`}>
                    {item.type.charAt(0) + item.type.slice(1).toLowerCase()}
                  </Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white shadow-lg rounded-lg">
                    {item.categories.map((category) => (
                      <ListItem
                        key={category.id}
                        title={category.name}
                        href={`/products?category=${category.id}`}
                      >
                        Browse all {category.name} mushrooms.
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={props.href ?? "#"}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";