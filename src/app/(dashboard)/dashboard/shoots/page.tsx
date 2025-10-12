import { getShoots } from "@/server/actions/shoot-actions";
import { getClients } from "@/server/actions/client-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { ShootsTable } from "./_components/shoots-table";

export default async function ShootsPage() {
  const [shoots, clients] = await Promise.all([getShoots(), getClients()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shoots</h1>
          <p className="text-muted-foreground">
            Manage all your photography shoots
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/shoots/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Shoot
          </Link>
        </Button>
      </div>

      {shoots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No shoots yet</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Get started by creating your first photography shoot.
            </p>
            <Button asChild>
              <Link href="/dashboard/shoots/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Shoot
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Shoots</CardTitle>
            <CardDescription>
              A list of all your photography shoots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShootsTable shoots={shoots} clients={clients} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
