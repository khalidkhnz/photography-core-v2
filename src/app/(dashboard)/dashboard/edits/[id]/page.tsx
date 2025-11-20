import { getEditById } from "@/server/actions/edit-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

interface EditDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  delivered: "bg-purple-500",
};

const costStatusColors: Record<string, string> = {
  paid: "bg-green-500",
  unpaid: "bg-red-500",
  onhold: "bg-orange-500",
};

export default async function EditDetailPage({ params }: EditDetailPageProps) {
  const { id } = await params;
  const edit = await getEditById(id);

  if (!edit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/edits">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{edit.editId}</h1>
            <p className="text-muted-foreground">Edit project details</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/edits/${edit.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Details
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core details about this edit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Edit ID</label>
              <p className="text-lg font-semibold">{edit.editId}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className={statusColors[edit.status] + " text-white"}
                >
                  {edit.status.replace("_", " ").charAt(0).toUpperCase() + edit.status.slice(1).replace("_", " ")}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Linked Shoot</label>
              {edit.shoot ? (
                <div className="mt-1">
                  <Link
                    href={`/dashboard/shoots/${edit.shoot.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {edit.shoot.shootId}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {edit.shoot.client.name} - {edit.shoot.shootType.name}
                  </p>
                  {edit.shoot.location && (
                    <p className="text-sm text-muted-foreground">
                      Location: {edit.shoot.location.name}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground mt-1">Independent edit (no linked shoot)</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Edit Delivery Date</label>
              <p className="mt-1">
                {edit.editDeliveryDate ? (
                  format(new Date(edit.editDeliveryDate), "MMMM dd, yyyy")
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Created At</label>
              <p className="mt-1">{format(new Date(edit.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team & Cost</CardTitle>
            <CardDescription>Assigned team and financial details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Assigned Editors</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {edit.editors.length > 0 ? (
                  edit.editors.map((editor) => (
                    <Badge key={editor.user.id} variant="secondary">
                      {editor.user.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No editors assigned</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Edit Cost</label>
              <p className="text-lg font-semibold mt-1">
                {edit.editCost ? (
                  <>₹{edit.editCost.toLocaleString("en-IN")}</>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Cost Status</label>
              <div className="mt-1">
                {edit.editCostStatus ? (
                  <Badge
                    variant="secondary"
                    className={costStatusColors[edit.editCostStatus] + " text-white"}
                  >
                    {edit.editCostStatus.charAt(0).toUpperCase() + edit.editCostStatus.slice(1)}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deliverables</CardTitle>
          <CardDescription>What needs to be delivered</CardDescription>
        </CardHeader>
        <CardContent>
          {edit.deliverables ? (
            <p className="whitespace-pre-wrap">{edit.deliverables}</p>
          ) : (
            <p className="text-muted-foreground">No deliverables specified</p>
          )}
        </CardContent>
      </Card>

      {edit.editorNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Editor Notes</CardTitle>
            <CardDescription>Special instructions for the editing team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{edit.editorNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

