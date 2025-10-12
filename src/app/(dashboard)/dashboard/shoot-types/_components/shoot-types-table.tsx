"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteShootType } from "@/server/actions/shoot-type-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface ShootType {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt: Date;
}

interface ShootTypesTableProps {
  shootTypes: ShootType[];
}

export function ShootTypesTable({ shootTypes }: ShootTypesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shootTypeToDelete, setShootTypeToDelete] = useState<{
    id: string;
    name: string;
    code: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (shootType: {
    id: string;
    name: string;
    code: string;
  }) => {
    setShootTypeToDelete(shootType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!shootTypeToDelete) return;

    setIsDeleting(true);
    try {
      await deleteShootType(shootTypeToDelete.id);
      setDeleteDialogOpen(false);
      setShootTypeToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting shoot type:", error);
      alert("Failed to delete shoot type");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shootTypes.map((shootType) => (
            <TableRow key={shootType.id}>
              <TableCell className="font-medium">{shootType.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{shootType.code}</Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {shootType.description ?? "No description"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(shootType.createdAt), "MMM dd, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/shoot-types/${shootType.id}/edit`}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() =>
                        handleDeleteClick({
                          id: shootType.id,
                          name: shootType.name,
                          code: shootType.code,
                        })
                      }
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
              shoot type <strong>{shootTypeToDelete?.name}</strong> (
              {shootTypeToDelete?.code}) and may affect existing shoots using
              this type.
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
