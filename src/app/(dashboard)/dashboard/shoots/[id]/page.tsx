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
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="editing">Editing</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="postponed">Postponed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
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
                {shoot.editId && (
                  <div>
                    <p className="text-sm font-medium">Edit ID</p>
                    <p className="text-muted-foreground">{shoot.editId}</p>
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
              <div className="grid gap-4 md:grid-cols-2">
                {shoot.shootStartDate && (
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-muted-foreground">
                      {format(new Date(shoot.shootStartDate), "PPP 'at' p")}
                    </p>
                  </div>
                )}
                {shoot.shootEndDate && (
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-muted-foreground">
                      {format(new Date(shoot.shootEndDate), "PPP 'at' p")}
                    </p>
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
              {shoot.teamMembers &&
                shoot.teamMembers.filter(
                  (tm) => tm.assignmentType === "photographer",
                ).length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Photographers</p>
                    <div className="mt-2 space-y-2">
                      {shoot.teamMembers
                        .filter((tm) => tm.assignmentType === "photographer")
                        .map((tm) => (
                          <div
                            key={tm.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-muted-foreground">
                              {tm.user.name}
                            </span>
                            {tm.role && (
                              <Badge variant="outline">{tm.role}</Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {shoot.teamMembers &&
                shoot.teamMembers.filter((tm) => tm.assignmentType === "editor")
                  .length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Editors</p>
                    <div className="mt-2 space-y-2">
                      {shoot.teamMembers
                        .filter((tm) => tm.assignmentType === "editor")
                        .map((tm) => (
                          <div
                            key={tm.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-muted-foreground">
                              {tm.user.name}
                            </span>
                            {tm.role && (
                              <Badge variant="outline">{tm.role}</Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {(!shoot.teamMembers || shoot.teamMembers.length === 0) && (
                <p className="text-muted-foreground">
                  No team members assigned
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(shoot.photographerNotes ?? shoot.editorNotes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shoot.photographerNotes && (
                  <div>
                    <p className="text-sm font-medium">Photographer Notes</p>
                    <p className="text-muted-foreground">
                      {shoot.photographerNotes}
                    </p>
                  </div>
                )}
                {shoot.editorNotes && (
                  <div>
                    <p className="text-sm font-medium">Editor Notes</p>
                    <p className="text-muted-foreground">{shoot.editorNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cost Tracking */}
          {(shoot.photographyCost !== null ||
            shoot.travelCost !== null ||
            shoot.editingCost !== null) && (
            <Card>
              <CardHeader>
                <CardTitle>Cost Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {shoot.photographyCost !== null && (
                    <div>
                      <p className="text-sm font-medium">Photography Cost</p>
                      <p className="text-lg font-semibold">
                        ${shoot.photographyCost.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {shoot.travelCost !== null && (
                    <div>
                      <p className="text-sm font-medium">Travel Cost</p>
                      <p className="text-lg font-semibold">
                        ${shoot.travelCost.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {shoot.editingCost !== null && (
                    <div>
                      <p className="text-sm font-medium">Editing Cost</p>
                      <p className="text-lg font-semibold">
                        ${shoot.editingCost.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Total Cost</p>
                    <p className="text-xl font-bold">
                      $
                      {(
                        (shoot.photographyCost ?? 0) +
                        (shoot.travelCost ?? 0) +
                        (shoot.editingCost ?? 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
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
