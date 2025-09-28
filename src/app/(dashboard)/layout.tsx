import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="bg-background flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
