"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/shared/ui/button";

export function AdminTopBar(): React.JSX.Element {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  async function handleLogout(): Promise<void> {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      // Navigate to the login page regardless, but surface the failure: the
      // server-side cookie may not have been cleared.
      console.error("Logout request failed", error);
    }
    // Hard navigation, not router.push: see the comment on isLoginPage below.
    window.location.assign("/admin/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      {/* On the login page, unauthenticated, Next prefetches "/admin"; the proxy
          answers with a redirect to "/admin/login" and poisons the client Router
          Cache under the "/admin" key, breaking navigation after a successful
          login. Rendering plain text here (instead of a Link) avoids the prefetch. */}
      {isLoginPage ? (
        <span className="text-lg font-semibold text-foreground">Admin</span>
      ) : (
        <Link href="/admin" className="text-lg font-semibold text-foreground">
          Admin
        </Link>
      )}
      {!isLoginPage && (
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      )}
    </header>
  );
}
