"use client";

import { User, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "U";

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];

    // Always start with Dashboard
    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard",
      isLast: segments.length === 1 && segments[0] === "dashboard",
    });

    // Add other segments
    let currentPath = "/dashboard";
    for (let i = 1; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      const isLast = i === segments.length - 1;

      // Format the label
      let label = segments[i];
      if (segments[i] === "shoots") label = "Shoots";
      else if (segments[i] === "clients") label = "Clients";
      else if (segments[i] === "photographers") label = "Photographers";
      else if (segments[i] === "editors") label = "Editors";
      else if (segments[i] === "shoot-types") label = "Shoot Types";
      else if (segments[i] === "coupons") label = "Coupons";
      else if (segments[i] === "ranking") label = "Photographer Ranking";
      else if (segments[i] === "settings") label = "Settings";
      else if (segments[i] === "new") label = "New";
      else if (segments[i] === "edit") label = "Edit";
      else if (segments[i] === "view") label = "View";
      else if (!isNaN(Number(segments[i]))) label = `#${segments[i]}`;
      else label = segments[i].charAt(0).toUpperCase() + segments[i].slice(1);

      breadcrumbs.push({
        label,
        href: currentPath,
        isLast,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="bg-background flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center space-x-2">
        <nav className="flex items-center space-x-1 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.href} className="flex items-center space-x-1">
              {index > 0 && (
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              )}
              {breadcrumb.isLast ? (
                <span className="text-foreground font-medium">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">{user.name}</p>
                <p className="text-muted-foreground text-xs leading-none">
                  {user.email}
                </p>
                <p className="text-muted-foreground text-xs leading-none">
                  Role: {user.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
