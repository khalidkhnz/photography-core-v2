import { getEdits } from "@/server/actions/edit-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { EditsTable } from "./_components/edits-table";

export default async function EditsPage() {
  const edits = await getEdits();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edits</h1>
          <p className="text-muted-foreground">
            Manage all your edit projects and deliverables
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/edits/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Edit
          </Link>
        </Button>
      </div>

      {edits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Pencil className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No edits yet</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Get started by creating your first edit project.
            </p>
            <Button asChild>
              <Link href="/dashboard/edits/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Edit
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Edits</CardTitle>
            <CardDescription>
              A list of all your edit projects and deliverables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditsTable edits={edits} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

