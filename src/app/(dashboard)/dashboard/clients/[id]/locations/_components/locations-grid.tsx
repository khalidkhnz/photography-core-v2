"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLocation } from "@/server/actions/location-actions";
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
import { Edit, MapPin, MoreHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface LocationPOC {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  role?: string | null;
}

interface Location {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  createdAt: Date;
  pocs?: LocationPOC[];
}

interface LocationsGridProps {
  locations: Location[];
}

export function LocationsGrid({ locations }: LocationsGridProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (location: { id: string; name: string }) => {
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!locationToDelete) return;

    setIsDeleting(true);
    try {
      await deleteLocation(locationToDelete.id);
      setDeleteDialogOpen(false);
      setLocationToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Failed to delete location");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <Badge variant="outline">
                      {location.city ?? "No city"}
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
                      <Link href={`/dashboard/locations/${location.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Location
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/locations/${location.id}/pocs`}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage POCs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleDeleteClick({
                          id: location.id,
                          name: location.name,
                        })
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
              {location.address && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">
                    {location.address}
                  </span>
                </div>
              )}
              {location.city && location.state && (
                <div className="text-muted-foreground text-sm">
                  {location.city}, {location.state}
                  {location.country && `, ${location.country}`}
                </div>
              )}
              
              {/* Location POCs */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    <span>POCs ({location.pocs?.length ?? 0})</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/locations/${location.id}/pocs`}>
                      {location.pocs && location.pocs.length > 0 ? "Manage" : "Add"}
                    </Link>
                  </Button>
                </div>
                {location.pocs && location.pocs.length > 0 && (
                  <div className="space-y-1">
                    {location.pocs.slice(0, 2).map((poc) => (
                      <div key={poc.id} className="text-xs p-2 bg-muted/50 rounded">
                        <p className="font-medium">{poc.name}</p>
                        {poc.role && (
                          <p className="text-muted-foreground">{poc.role}</p>
                        )}
                        <p className="text-muted-foreground">
                          📞 {poc.phone}
                          {poc.email && ` • ✉ ${poc.email}`}
                        </p>
                      </div>
                    ))}
                    {location.pocs.length > 2 && (
                      <p className="text-xs text-muted-foreground pt-1">
                        +{location.pocs.length - 2} more
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-muted-foreground text-xs pt-2">
                Created {format(new Date(location.createdAt), "MMM dd, yyyy")}
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
              location <strong>{locationToDelete?.name}</strong> and remove it
              from any shoots using this location.
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
