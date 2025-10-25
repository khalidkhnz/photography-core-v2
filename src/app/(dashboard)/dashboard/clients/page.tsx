import { getClients } from "@/server/actions/client-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ViewToggle, ViewProvider } from "./_components/view-toggle";
import { ClientsView } from "./_components/clients-view";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <ViewProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Manage your photography clients and their information
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle />
            <Button asChild>
              <Link href="/dashboard/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Link>
            </Button>
          </div>
        </div>

        {clients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-semibold">No clients found</h3>
                <p className="text-muted-foreground">
                  Get started by adding your first client
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/clients/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Client
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ClientsView clients={clients} />
        )}
      </div>
    </ViewProvider>
  );
}
