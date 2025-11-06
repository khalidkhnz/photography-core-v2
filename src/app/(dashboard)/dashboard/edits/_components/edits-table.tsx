"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { deleteEdit, updateEditStatus } from "@/server/actions/edit-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Edit {
  id: string;
  editId: string;
  shootId: string | null;
  deliverables: string | null;
  editDeliveryDate: Date | null;
  editorNotes: string | null;
  editCost: number | null;
  editCostStatus: string | null;
  status: string;
  createdAt: Date;
  shoot?: {
    shootId: string;
    client: {
      name: string;
    };
    shootType: {
      name: string;
    };
  } | null;
  editors: Array<{
    user: {
      id: string;
      name: string | null;
    };
  }>;
}

interface EditsTableProps {
  edits: Edit[];
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

export function EditsTable({ edits }: EditsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editToDelete, setEditToDelete] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!editToDelete) return;

    try {
      await deleteEdit(editToDelete);
      toast.success("Edit deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete edit");
    } finally {
      setDeleteDialogOpen(false);
      setEditToDelete(null);
    }
  };

  const handleStatusChange = async (editId: string, newStatus: string) => {
    try {
      await updateEditStatus(editId, newStatus);
      toast.success("Status updated successfully");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Edit ID</TableHead>
              <TableHead>Linked Shoot</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Editors</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Cost Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {edits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No edits found
                </TableCell>
              </TableRow>
            ) : (
              edits.map((edit) => (
                <TableRow key={edit.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/edits/${edit.id}`}
                      className="hover:underline"
                    >
                      {edit.editId}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {edit.shoot ? (
                      <Link
                        href={`/dashboard/shoots/${edit.shoot.shootId}`}
                        className="hover:underline text-blue-600"
                      >
                        {edit.shoot.shootId}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-sm">Independent</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {edit.shoot?.client.name ?? (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {edit.editors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {edit.editors.map((editor) => (
                          <Badge key={editor.user.id} variant="secondary">
                            {editor.user.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {edit.editDeliveryDate ? (
                      format(new Date(edit.editDeliveryDate), "MMM dd, yyyy")
                    ) : (
                      <span className="text-muted-foreground text-sm">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {edit.editCost ? (
                      <span>₹{edit.editCost.toLocaleString("en-IN")}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {edit.editCostStatus ? (
                      <Badge
                        variant="secondary"
                        className={costStatusColors[edit.editCostStatus] + " text-white"}
                      >
                        {edit.editCostStatus.charAt(0).toUpperCase() + edit.editCostStatus.slice(1)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Badge
                            variant="secondary"
                            className={statusColors[edit.status] + " text-white cursor-pointer"}
                          >
                            {edit.status.replace("_", " ").charAt(0).toUpperCase() + edit.status.slice(1).replace("_", " ")}
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusChange(edit.id, "pending")}>
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(edit.id, "in_progress")}>
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(edit.id, "completed")}>
                          Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(edit.id, "delivered")}>
                          Delivered
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/edits/${edit.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/edits/${edit.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setEditToDelete(edit.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the edit
              and remove the data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

