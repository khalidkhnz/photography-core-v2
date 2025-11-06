import {
  getShootById,
  updateShootStatus,
} from "@/server/actions/shoot-actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Users,
  Camera,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

interface ExtendedShootData {
  workflowType?: string | null;
  cluster?: {
    id: string;
    name: string;
  } | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewShootPage({ params }: PageProps) {
  const { id } = await params;
  const shoot = await getShootById(id);

  if (!shoot) {
    notFound();
  }

  const extendedShoot = shoot as unknown as ExtendedShootData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/shoots">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {shoot.shootId}
            </h1>
            <p className="text-muted-foreground">
              Shoot details and information
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/shoots/${shoot.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Shoot
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Information */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Shoot Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Shoot ID</p>
                  <p className="text-muted-foreground">{shoot.shootId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Select
                    value={shoot.status}
                    onValueChange={async (newStatus) => {
                      "use server";
                      await updateShootStatus(shoot.id, newStatus);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">Shoot in Progress</SelectItem>
                      <SelectItem value="editing">Editing</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="postponed">Postponed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-muted-foreground">{shoot.client.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Shoot Type</p>
                  <p className="text-muted-foreground">
                    {shoot.shootType.name} ({shoot.shootType.code})
                  </p>
                </div>
                {shoot.entity && (
                  <div>
                    <p className="text-sm font-medium">Entity</p>
                    <p className="text-muted-foreground">{shoot.entity.name}</p>
                  </div>
                )}
                {shoot.location && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-muted-foreground">
                      {shoot.location.name}
                    </p>
                    {shoot.location.address && (
                      <p className="text-muted-foreground text-sm">
                        {shoot.location.address}
                      </p>
                    )}
                  </div>
                )}
                {shoot.projectName && (
                  <div>
                    <p className="text-sm font-medium">Project Name</p>
                    <p className="text-muted-foreground">{shoot.projectName}</p>
                  </div>
                )}
                {shoot.edits && shoot.edits.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Edit IDs</p>
                    <div className="flex gap-1 flex-wrap">
                      {shoot.edits.map((edit) => (
                        <Badge key={edit.id} variant="secondary">
                          {edit.editId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">Workflow Type</p>
                  <Badge variant="secondary">
                    {extendedShoot.workflowType === "shift"
                      ? "Shift Basis"
                      : extendedShoot.workflowType === "project"
                        ? "Project Basis"
                        : extendedShoot.workflowType === "cluster"
                          ? "Cluster Basis"
                          : "Shift Basis"}
                  </Badge>
                </div>
                {extendedShoot.cluster && (
                  <div>
                    <p className="text-sm font-medium">Cluster</p>
                    <Link
                      href={`/dashboard/clusters/${extendedShoot.cluster.id}`}
                      className="text-primary hover:underline"
                    >
                      {extendedShoot.cluster.name}
                    </Link>
                  </div>
                )}
              </div>

              {shoot.overallDeliverables && (
                <div>
                  <p className="text-sm font-medium">Overall Deliverables</p>
                  <p className="text-muted-foreground">
                    {shoot.overallDeliverables}
                  </p>
                </div>
              )}

              {shoot.remarks && (
                <div>
                  <p className="text-sm font-medium">Remarks</p>
                  <p className="text-muted-foreground">{shoot.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {shoot.scheduledShootDate && (
                  <div>
                    <p className="text-sm font-medium">Shoot Date</p>
                    <p className="text-muted-foreground">
                      {format(new Date(shoot.scheduledShootDate), "PPP")}
                    </p>
                  </div>
                )}
                {shoot.reportingTime && (
                  <div>
                    <p className="text-sm font-medium">Reporting Time</p>
                    <p className="text-muted-foreground">{shoot.reportingTime}</p>
                  </div>
                )}
                {shoot.wrapUpTime && (
                  <div>
                    <p className="text-sm font-medium">Wrap Up Time</p>
                    <p className="text-muted-foreground">{shoot.wrapUpTime}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shoot.dop && (
                <div>
                  <p className="text-sm font-medium">DOP (Director of Photography)</p>
                  <div className="mt-2">
                    <Badge variant="default">{shoot.dop.name}</Badge>
                  </div>
                </div>
              )}

              {shoot.executors && shoot.executors.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Executors</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {shoot.executors.map((executor) => (
                      <Badge key={executor.id} variant="secondary">
                        {executor.user.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!shoot.dop && (!shoot.executors || shoot.executors.length === 0) && (
                <p className="text-muted-foreground">
                  No team members assigned
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {shoot.photographerNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Photographer Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {shoot.photographerNotes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Cost Tracking */}
          {(shoot.shootCost !== null ||
            shoot.travelCost !== null ||
            shoot.overallCost !== null) && (
            <Card>
              <CardHeader>
                <CardTitle>Cost Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {extendedShoot.workflowType === "project" ? (
                  <div>
                    <p className="text-sm font-medium">Overall Project Cost</p>
                    <p className="text-2xl font-bold">
                      ₹{(shoot.overallCost ?? 0).toFixed(2)}
                    </p>
                    {shoot.overallCostStatus && (
                      <Badge variant="secondary" className="mt-1">
                        {shoot.overallCostStatus}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {shoot.shootCost !== null && (
                      <div>
                        <p className="text-sm font-medium">Shoot Cost</p>
                        <p className="text-lg font-semibold">
                          ₹{shoot.shootCost.toFixed(2)}
                        </p>
                        {shoot.shootCostStatus && (
                          <Badge variant="secondary" className="text-xs">
                            {shoot.shootCostStatus}
                          </Badge>
                        )}
                      </div>
                    )}
                    {shoot.travelCost !== null && (
                      <div>
                        <p className="text-sm font-medium">Travel Cost</p>
                        <p className="text-lg font-semibold">
                          ₹{shoot.travelCost.toFixed(2)}
                        </p>
                        {shoot.travelCostStatus && (
                          <Badge variant="secondary" className="text-xs">
                            {shoot.travelCostStatus}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {extendedShoot.workflowType !== "project" && (shoot.shootCost !== null || shoot.travelCost !== null) && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Total Shoot Cost</p>
                      <p className="text-xl font-bold">
                        ₹{((shoot.shootCost ?? 0) + (shoot.travelCost ?? 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-muted-foreground">
                  {format(new Date(shoot.createdAt), "PPP 'at' p")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-muted-foreground">
                  {format(new Date(shoot.updatedAt), "PPP 'at' p")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
