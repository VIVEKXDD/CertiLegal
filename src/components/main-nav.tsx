"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, BookText, Database, Search } from "lucide-react";
import { useFirebase } from "@/firebase";

const allLinks = [
  { href: "/dashboard", label: "My Documents", icon: LayoutDashboard },
  { href: "/search", label: "Search", icon: Search },
  { href: "/glossary", label: "Glossary", icon: BookText },
  { href: "/admin", label: "Admin", icon: Database, adminOnly: true },
];

const ADMIN_EMAIL = 'v@example.com';

export function MainNav() {
  const pathname = usePathname();
  const { user } = useFirebase();

  const links = allLinks.filter(link => {
    if (link.adminOnly) {
      return user?.email === ADMIN_EMAIL;
    }
    return true;
  });

  return (
    <SidebarMenu>
      {links.map((link) => {
        // Active state for /dashboard should not include its sub-pages
        const isActive = link.href === '/dashboard' ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <SidebarMenuItem key={link.href}>
            <Link href={link.href}>
              <SidebarMenuButton isActive={isActive} tooltip={link.label}>
                <link.icon />
                <span>{link.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
