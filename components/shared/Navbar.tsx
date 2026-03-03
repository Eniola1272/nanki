'use client';

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

// No props needed for Navbar, but we'll define an empty interface for consistency
interface NavbarProps {}

export function Navbar({}: NavbarProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          Quiz App
        </Link>

        <div className="flex items-center gap-4">
          {status === "authenticated" && session?.user ? (
            <>
              <Link href="/dashboard">
                <Button 
                  variant={isActive("/dashboard") ? "default" : "ghost"}
                >
                  Dashboard
                </Button>
              </Link>
              {session.user.isPremium && (
                <Link href="/org/create">
                  <Button 
                    variant={isActive("/org/create") ? "default" : "ghost"}
                  >
                    Create Org
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}