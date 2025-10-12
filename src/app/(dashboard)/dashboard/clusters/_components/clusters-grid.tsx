"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCluster } from "@/server/actions/cluster-actions";
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
import { Layers, DollarSign, MoreHorizontal, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Cluster {
  id: string;
  name: string;
  description?: string | null;
  totalCost?: number | null;
  createdAt: Date;
  shoots: Array<{
    id: string;
    shootId: string;
  }>;
}

interface ClustersGridProps {
  clusters: Cluster[];
}

export function ClustersGrid({ clusters }: ClustersGridProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clusterToDelete, setClusterToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (cluster: { id: string; name: string }) => {
    setClusterToDelete(cluster);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clusterToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCluster(clusterToDelete.id);
      setDeleteDialogOpen(false);
      setClusterToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting cluster:", error);
      alert("Failed to delete cluster");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clusters.map((cluster) => (
          <Card key={cluster.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{cluster.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {cluster.description ?? "No description"}
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
                      <Link href={`/dashboard/clusters/${cluster.id}`}>
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/clusters/${cluster.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleDeleteClick({
                          id: cluster.id,
                          name: cluster.name,
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layers className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">
                    {cluster.shoots.length} shoots
                  </span>
                </div>
                {cluster.totalCost !== null && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      ${cluster?.totalCost?.toFixed(2) ?? 0.0}
                    </span>
                  </div>
                )}
              </div>
              {cluster.shoots.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {cluster.shoots.slice(0, 3).map((shoot) => (
                    <Badge key={shoot.id} variant="outline" className="text-xs">
                      {shoot.shootId}
                    </Badge>
                  ))}
                  {cluster.shoots.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{cluster.shoots.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              <div className="text-muted-foreground text-xs">
                Created {format(new Date(cluster.createdAt), "MMM dd, yyyy")}
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
              cluster <strong>{clusterToDelete?.name}</strong>. Shoots in this
              cluster will not be deleted, but will be unlinked from the
              cluster.
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
