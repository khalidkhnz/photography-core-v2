import { getShootById } from "@/server/actions/shoot-actions";
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
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  Users,
  Camera,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewShootPage({ params }: PageProps) {
  const { id } = await params;
  const shoot = await getShootById(id);

  if (!shoot) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

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
                  <Badge className={getStatusColor(shoot.status)}>
                    {shoot.status}
                  </Badge>
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
              </div>

              {shoot.overallDeliverables && (
                <div>
                  <p className="text-sm font-medium">Overall Deliverables</p>
                  <p className="text-muted-foreground">
                    {shoot.overallDeliverables}
                  </p>
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
              {shoot.shootPhotographers.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Photographers</p>
                  <div className="mt-2 space-y-2">
                    {shoot.shootPhotographers.map((sp) => (
                      <div
                        key={sp.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-muted-foreground">
                          {sp.photographer.name}
                        </span>
                        {sp.role && <Badge variant="outline">{sp.role}</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shoot.shootEditors.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Editors</p>
                  <div className="mt-2 space-y-2">
                    {shoot.shootEditors.map((se) => (
                      <div
                        key={se.id}
                        className="flex items-center justify-between"
                      >
                        <span className="text-muted-foreground">
                          {se.editor.name}
                        </span>
                        {se.role && <Badge variant="outline">{se.role}</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {shoot.shootPhotographers.length === 0 &&
                shoot.shootEditors.length === 0 && (
                  <p className="text-muted-foreground">
                    No team members assigned
                  </p>
                )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(shoot.photographerNotes || shoot.editorNotes) && (
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
