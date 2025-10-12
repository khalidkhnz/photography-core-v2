import { getClusterById } from "@/server/actions/cluster-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, Layers, DollarSign } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

interface ShootWithCosts {
  id: string;
  shootId: string;
  photographyCost?: number | null;
  travelCost?: number | null;
  editingCost?: number | null;
  shootStartDate?: Date | null;
  status: string;
  client: { name: string };
  shootType: { name: string };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewClusterPage({ params }: PageProps) {
  const { id } = await params;
  const cluster = await getClusterById(id);

  if (!cluster) {
    notFound();
  }

  // Calculate total cost from shoots if not set
  const calculatedTotalCost = cluster.shoots.reduce((sum, shoot) => {
    const typedShoot = shoot as unknown as ShootWithCosts;
    const shootCost =
      (typedShoot.photographyCost ?? 0) +
      (typedShoot.travelCost ?? 0) +
      (typedShoot.editingCost ?? 0);
    return sum + shootCost;
  }, 0);

  const displayTotalCost = cluster.totalCost ?? calculatedTotalCost;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/clusters">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {cluster.name}
            </h1>
            <p className="text-muted-foreground">Cluster details and shoots</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/clusters/${cluster.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Cluster
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Cluster Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Cluster Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-muted-foreground">{cluster.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Shoots</p>
                  <Badge variant="secondary">{cluster.shoots.length}</Badge>
                </div>
              </div>
              {cluster.description && (
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-muted-foreground">{cluster.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shoots in Cluster */}
          <Card>
            <CardHeader>
              <CardTitle>Shoots in this Cluster</CardTitle>
            </CardHeader>
            <CardContent>
              {cluster.shoots.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  <p>No shoots assigned to this cluster yet.</p>
                  <p className="text-sm">
                    Create or edit shoots with workflow type &quot;Cluster
                    Basis&quot; to add them here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shoot ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cluster.shoots.map((shoot) => {
                      const typedShoot = shoot as unknown as ShootWithCosts;
                      const shootCost =
                        (typedShoot.photographyCost ?? 0) +
                        (typedShoot.travelCost ?? 0) +
                        (typedShoot.editingCost ?? 0);
                      return (
                        <TableRow key={shoot.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/dashboard/shoots/${shoot.id}`}
                              className="text-primary hover:underline"
                            >
                              {shoot.shootId}
                            </Link>
                          </TableCell>
                          <TableCell>{shoot.client.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {shoot.shootType.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {shoot.shootStartDate ? (
                              format(
                                new Date(shoot.shootStartDate),
                                "MMM dd, yyyy",
                              )
                            ) : (
                              <span className="text-muted-foreground">
                                Not set
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge>{shoot.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ${shootCost.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Total Cluster Cost</p>
                <p className="text-2xl font-bold">
                  ${displayTotalCost.toFixed(2)}
                </p>
                {cluster.totalCost === null && (
                  <p className="text-muted-foreground text-xs">
                    Calculated from shoots
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Number of Shoots</p>
                <p className="text-lg">{cluster.shoots.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-muted-foreground">
                  {format(new Date(cluster.createdAt), "PPP 'at' p")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-muted-foreground">
                  {format(new Date(cluster.updatedAt), "PPP 'at' p")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
