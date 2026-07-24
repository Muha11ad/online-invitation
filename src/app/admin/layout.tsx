import { Toaster } from "@/shared/ui/sonner";

import { AdminTopBar } from "./AdminTopBar";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <AdminTopBar />
      <main>{children}</main>
      <Toaster />
    </div>
  );
}
