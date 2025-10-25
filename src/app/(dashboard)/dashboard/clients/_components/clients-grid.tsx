"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClient } from "@/server/actions/client-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Edit, MapPin, Building, MoreHorizontal, Eye } from "lucide-react";
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

interface ClientsGridProps {
  clients: Client[];
}

export function ClientsGrid({ clients }: ClientsGridProps) {
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <Badge variant="secondary">
                      {client._count?.entities ?? 0} entities
                    </Badge>
                    <Badge variant="outline">
                      {client._count?.shoots ?? 0} shoots
                    </Badge>
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/clients/${client.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/clients/${client.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/clients/${client.id}?tab=entities`}>
                        <Building className="mr-2 h-4 w-4" />
                        Manage Entities
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/clients/${client.id}?tab=locations`}>
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
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.entities && client.entities.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      {client.entities.length} entities
                    </span>
                  </div>
                  {client.entities.slice(0, 2).map((entity) => (
                    <div key={entity.id} className="ml-6 text-xs text-muted-foreground">
                      • {entity.name}
                      {entity.sites && entity.sites.length > 0 && (
                        <span className="ml-2">({entity.sites.length} sites)</span>
                      )}
                    </div>
                  ))}
                  {client.entities.length > 2 && (
                    <div className="ml-6 text-xs text-muted-foreground">
                      +{client.entities.length - 2} more entities
                    </div>
                  )}
                </div>
              )}
              <div className="text-muted-foreground text-xs">
                Created {format(new Date(client.createdAt), "MMM dd, yyyy")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              client <strong>{clientToDelete?.name}</strong> and all associated
              data including locations and shoots.
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
