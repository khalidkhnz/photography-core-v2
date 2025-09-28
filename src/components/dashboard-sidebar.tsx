"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleDarkLightMode } from "@/components/toggle-dark-light-mode";
import {
  Camera,
  Users,
  Building2,
  Tag,
  Award,
  Calendar,
  Settings,
  LogOut,
  UserCheck,
  Edit,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Camera,
  },
  {
    name: "Shoots",
    href: "/dashboard/shoots",
    icon: Calendar,
    children: [
      { name: "All Shoots", href: "/dashboard/shoots" },
      { name: "Create Shoot", href: "/dashboard/shoots/new" },
    ],
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: UserCheck,
  },
  {
    name: "Photographers",
    href: "/dashboard/photographers",
    icon: Users,
  },
  {
    name: "Editors",
    href: "/dashboard/editors",
    icon: Edit,
  },
  {
    name: "Studios",
    href: "/dashboard/studios",
    icon: Building2,
  },
  {
    name: "Coupons",
    href: "/dashboard/coupons",
    icon: Tag,
  },
  {
    name: "Expertises",
    href: "/dashboard/expertises",
    icon: Award,
  },
  {
    name: "Photographer Ranking",
    href: "/dashboard/ranking",
    icon: Award,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-card flex h-full w-64 flex-col border-r">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-foreground text-xl font-semibold">
          Photography Core
        </h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            item.children?.some((child) => pathname === child.href);

          return (
            <div key={item.name}>
              <Link href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary text-secondary-foreground",
                  )}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>

              {item.children && isActive && (
                <div className="mt-1 ml-6 space-y-1">
                  {item.children.map((child) => (
                    <Link key={child.name} href={child.href}>
                      <Button
                        variant={
                          pathname === child.href ? "secondary" : "ghost"
                        }
                        size="sm"
                        className={cn(
                          "w-full justify-start text-sm",
                          pathname === child.href &&
                            "bg-secondary text-secondary-foreground",
                        )}
                      >
                        {child.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="space-y-2 border-t p-4">
        <ToggleDarkLightMode />
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut()}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
