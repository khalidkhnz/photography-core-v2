import { getEditors } from "@/server/actions/editor-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { EditorsGrid } from "./_components/editors-grid";

export default async function EditorsPage() {
  const editors = await getEditors();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editors</h1>
          <p className="text-muted-foreground">
            Manage your editing team members
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/editors/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Editor
          </Link>
        </Button>
      </div>

      {editors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold">No editors found</h3>
              <p className="text-muted-foreground">
                Get started by adding your first editor
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/editors/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Editor
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EditorsGrid editors={editors} />
      )}
    </div>
  );
}
