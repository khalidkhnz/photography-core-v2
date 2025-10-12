"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteShoot, updateShootStatus } from "@/server/actions/shoot-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { MoreHorizontal, MapPin } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Shoot {
  id: string;
  shootId: string;
  projectName: string | null;
  remarks: string | null;
  shootStartDate: Date | null;
  status: string;
  client: {
    name: string;
  };
  shootType: {
    name: string;
  };
  location: {
    name: string;
  } | null;
}

interface ShootsTableProps {
  shoots: Shoot[];
}

export function ShootsTable({ shoots }: ShootsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shootToDelete, setShootToDelete] = useState<{
    id: string;
    shootId: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (shoot: { id: string; shootId: string }) => {
    setShootToDelete(shoot);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!shootToDelete) return;

    setIsDeleting(true);
    try {
      await deleteShoot(shootToDelete.id);
      setDeleteDialogOpen(false);
      setShootToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting shoot:", error);
      alert("Failed to delete shoot");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shoot ID</TableHead>
            <TableHead>Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shoots.map((shoot) => (
            <TableRow key={shoot.id}>
              <TableCell className="font-medium">{shoot.shootId}</TableCell>
              <TableCell>
                {shoot.projectName ?? (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>{shoot.client.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{shoot.shootType.name}</Badge>
              </TableCell>
              <TableCell>
                {shoot.location ? (
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    {shoot.location.name}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No location</span>
                )}
              </TableCell>
              <TableCell>
                {shoot.shootStartDate ? (
                  format(new Date(shoot.shootStartDate), "MMM dd, yyyy")
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </TableCell>
              <TableCell>
                <Select
                  value={shoot.status}
                  onValueChange={async (newStatus) => {
                    await updateShootStatus(shoot.id, newStatus);
                    router.refresh();
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {shoot.remarks ? (
                  <span className="line-clamp-2 max-w-xs">{shoot.remarks}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/shoots/${shoot.id}`}>
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/shoots/${shoot.id}/edit`}>
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleDeleteClick({
                          id: shoot.id,
                          shootId: shoot.shootId,
                        })
                      }
                      className="text-destructive focus:text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              shoot <strong>{shootToDelete?.shootId}</strong> and remove all
              associated data including photographer and editor assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
