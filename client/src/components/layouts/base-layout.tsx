'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, Menu, X, LucideIcon } from 'lucide-react';
import { Role } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

interface BaseLayoutProps {
  children: React.ReactNode;
  allowedRole: Role;
  navItems: NavItem[];
}

export function BaseLayout({
  children,
  allowedRole,
  navItems,
}: BaseLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== allowedRole)) {
      router.push('/login');
    }
  }, [isLoading, user, router, allowedRole]);

  if (isLoading || !user || user.role !== allowedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <Link
              href={allowedRole === 'COACH' ? '/coach' : '/student'}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 bg-primary flex items-center justify-center rounded">
                <img src="/favicon.ico" alt="Chess School" />
              </div>
              <span className="font-semibold hidden sm:inline">
                Chess School
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={
                    isActive(item.href, item.exact) ? 'default' : 'ghost'
                  }
                  size="sm"
                  className="gap-2 py-4 px-3"
                >
                  <item.icon className="!h-5 !w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.fullName}
            </span>
            <Button size="icon" variant="ghost" onClick={logout}>
              <LogOut className="!h-5 !w-5" />
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden border-t bg-background p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant={
                    isActive(item.href, item.exact) ? 'default' : 'ghost'
                  }
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
