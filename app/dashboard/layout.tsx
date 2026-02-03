import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { DashboardNav } from "@/components/DashboardNav";
import { AlertsSidebar } from "@/components/AlertsSidebar";
import { DashboardProvider } from "@/lib/dashboard-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: facilities } = await supabase
    .from("facilities")
    .select("id")
    .order("name")
    .limit(1);
  const initialFacilityId = facilities?.[0]?.id ?? null;

  return (
    <DashboardProvider initialFacilityId={initialFacilityId}>
      <div className="flex min-h-screen">
        <DashboardNav />
        <main id="main" className="flex-1 overflow-auto bg-gray-50 p-6 dark:bg-zinc-950">
          {children}
        </main>
        <AlertsSidebar />
      </div>
    </DashboardProvider>
  );
}
