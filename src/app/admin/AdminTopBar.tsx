"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/shared/ui/button";

export function AdminTopBar(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  async function handleLogout(): Promise<void> {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <Link href="/admin" className="text-lg font-semibold text-foreground">
        Admin
      </Link>
      {!isLoginPage && (
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      )}
    </header>
  );
}
