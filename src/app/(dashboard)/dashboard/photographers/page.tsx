import { getPhotographers } from "@/server/actions/photographer-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PhotographersGrid } from "./_components/photographers-grid";

export default async function PhotographersPage() {
  const photographers = await getPhotographers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Photographers</h1>
          <p className="text-muted-foreground">
            Manage your photography team members
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/photographers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Photographer
          </Link>
        </Button>
      </div>

      {photographers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold">No photographers found</h3>
              <p className="text-muted-foreground">
                Get started by adding your first photographer
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/photographers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Photographer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <PhotographersGrid photographers={photographers} />
      )}
    </div>
  );
}
