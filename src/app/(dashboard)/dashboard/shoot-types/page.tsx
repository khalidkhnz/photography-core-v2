import { getShootTypes } from "@/server/actions/shoot-type-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Tag } from "lucide-react";
import Link from "next/link";
import { ShootTypesTable } from "./_components/shoot-types-table";

export default async function ShootTypesPage() {
  const shootTypes = await getShootTypes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shoot Types</h1>
          <p className="text-muted-foreground">
            Manage different types of photography shoots
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/shoot-types/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Shoot Type
          </Link>
        </Button>
      </div>

      {shootTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <Tag className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="text-lg font-semibold">No shoot types found</h3>
              <p className="text-muted-foreground">
                Get started by adding your first shoot type
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/shoot-types/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shoot Type
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <ShootTypesTable shootTypes={shootTypes} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
