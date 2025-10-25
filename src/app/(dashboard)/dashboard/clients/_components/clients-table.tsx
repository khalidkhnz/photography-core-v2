"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClient } from "@/server/actions/client-actions";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Edit, MoreHorizontal, Trash2, Building, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  poc?: string | null;
  createdAt: Date;
  entities?: Array<{
    id: string;
    name: string;
    sites?: Array<{
      id: string;
      name: string;
      pocs?: Array<{ id: string; name: string }>;
    }>;
  }>;
  locations?: Array<{ id: string }>;
  _count?: {
    shoots: number;
    entities: number;
  };
}

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (client: { id: string; name: string }) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    try {
      await deleteClient(clientToDelete.id);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Entities</TableHead>
              <TableHead>Sites</TableHead>
              <TableHead>POCs</TableHead>
              <TableHead>Shoots</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const totalSites = client.entities?.reduce(
                (acc, entity) => acc + (entity.sites?.length ?? 0),
                0
              ) ?? 0;
              const totalPOCs = client.entities?.reduce(
                (acc, entity) =>
                  acc +
                  (entity.sites?.reduce(
                    (siteAcc, site) => siteAcc + (site.pocs?.length ?? 0),
                    0
                  ) ?? 0),
                0
              ) ?? 0;

              return (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{client._count?.entities ?? 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{totalSites}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{totalPOCs}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {client._count?.shoots ?? 0} shoots
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(client.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/clients/${client.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/clients/${client.id}/entities`}>
                            <Building className="mr-2 h-4 w-4" />
                            Manage Entities
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/clients/${client.id}/locations`}>
                            <MapPin className="mr-2 h-4 w-4" />
                            Manage Locations
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleDeleteClick({ id: client.id, name: client.name })
                          }
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              client <strong>{clientToDelete?.name}</strong> and all associated
              data including entities, sites, POCs, locations, and shoots.
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
