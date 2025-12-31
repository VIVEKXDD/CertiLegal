"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, BookText, FileText } from "lucide-react";

const links = [
  { href: "/dashboard", label: "My Documents", icon: LayoutDashboard },
  { href: "/glossary", label: "Glossary", icon: BookText },
];

export function MainNav() {
  const pathname = usePathname();

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
