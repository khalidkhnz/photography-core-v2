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
import { ArrowLeft, Edit, Layers } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

type ClusterWithShoots = NonNullable<Awaited<ReturnType<typeof getClusterById>>>;

type ShootInCluster = NonNullable<ClusterWithShoots["shoots"]>[number];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewClusterPage({ params }: PageProps) {
  const { id } = await params;
  const clusterData = await getClusterById(id);

  if (!clusterData) {
    notFound();
  }

  const cluster = clusterData;

  // Calculate total cost from shoots
  const calculatedShootsCost = (cluster.shoots ?? []).reduce((sum: number, shoot: ShootInCluster) => {
    // For shift-based: shootCost + travelCost, for project-based: overallCost
    const workflowType = shoot.workflowType ?? "shift";
    const shootCost = typeof shoot.shootCost === "number" ? shoot.shootCost : 0;
    const travelCost = typeof shoot.travelCost === "number" ? shoot.travelCost : 0;
    const overallCost = typeof shoot.overallCost === "number" ? shoot.overallCost : 0;
    
    const shootTotalCost = workflowType === "project"
      ? overallCost
      : shootCost + travelCost;
    
    return sum + shootTotalCost;
  }, 0);

  // Calculate total cost from edits
  const calculatedEditsCost = (cluster.edits ?? []).reduce((sum: number, edit) => {
    const editCost = typeof edit.editCost === "number" ? edit.editCost : 0;
    return sum + editCost;
  }, 0);

  // Total calculated cost = shoots + edits
  const calculatedTotalCost = calculatedShootsCost + calculatedEditsCost;

  const displayTotalCost = typeof cluster.totalCost === "number" ? cluster.totalCost : calculatedTotalCost;

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
                  <Badge variant="secondary">{cluster.shoots?.length ?? 0}</Badge>
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
              {!cluster.shoots || cluster.shoots.length === 0 ? (
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
                    {cluster.shoots.map((shoot: ShootInCluster) => {
                      // For shift-based: shootCost + travelCost, for project-based: overallCost
                      const workflowType = shoot.workflowType ?? "shift";
                      const shootCost = typeof shoot.shootCost === "number" ? shoot.shootCost : 0;
                      const travelCost = typeof shoot.travelCost === "number" ? shoot.travelCost : 0;
                      const overallCost = typeof shoot.overallCost === "number" ? shoot.overallCost : 0;
                      
                      const shootTotalCost = workflowType === "project"
                        ? overallCost
                        : shootCost + travelCost;
                      
                      const scheduledDate = shoot.scheduledShootDate 
                        ? new Date(shoot.scheduledShootDate as string | Date)
                        : null;
                      
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
                          <TableCell>{shoot.client?.name ?? "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {shoot.shootType?.name ?? "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {scheduledDate ? (
                              format(scheduledDate, "MMM dd, yyyy")
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
                            ₹{shootTotalCost.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Edits in Cluster */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edits in Cluster ({cluster.edits?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!cluster.edits || cluster.edits.length === 0) ? (
                <p className="text-muted-foreground text-center py-4">
                  No edits linked to this cluster yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Edit ID</TableHead>
                      <TableHead>Shoot</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cluster.edits.map((edit) => {
                      const editCost = typeof edit.editCost === "number" ? edit.editCost : 0;
                      
                      return (
                        <TableRow key={edit.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={`/dashboard/edits/${edit.id}`}
                              className="text-primary hover:underline"
                            >
                              {edit.editId}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {edit.shoot ? (
                              <Link
                                href={`/dashboard/shoots/${edit.shoot.id}`}
                                className="text-primary hover:underline text-sm"
                              >
                                {edit.shoot.shootId}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                Independent
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge>{edit.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{editCost.toFixed(2)}
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
                  ₹{typeof displayTotalCost === "number" ? displayTotalCost.toFixed(2) : "0.00"}
                </p>
                {cluster.totalCost === null && (
                  <p className="text-muted-foreground text-xs">
                    Auto-calculated from shoots and edits
                  </p>
                )}
              </div>
              {cluster.totalCost === null && (
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shoots Cost:</span>
                    <span className="font-medium">₹{calculatedShootsCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Edits Cost:</span>
                    <span className="font-medium">₹{calculatedEditsCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Number of Shoots</p>
                <p className="text-lg">{cluster.shoots?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Number of Edits</p>
                <p className="text-lg">{cluster.edits?.length ?? 0}</p>
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
