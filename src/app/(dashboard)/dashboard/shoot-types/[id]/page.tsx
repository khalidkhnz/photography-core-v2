import { getShootTypeById } from "@/server/actions/shoot-type-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export default async function ViewShootTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shootType = await getShootTypeById(id);

  if (!shootType) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/shoot-types">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {shootType.name}
            </h1>
            <p className="text-muted-foreground">
              Shoot type details and information
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/shoot-types/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Shoot Type
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Information */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shoot Type Overview</CardTitle>
              <CardDescription>
                Key details about this shoot type.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-muted-foreground">{shootType.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Code</p>
                <Badge variant="outline">{shootType.code}</Badge>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-muted-foreground">
                  {shootType.description || "No description provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-muted-foreground">
                  {format(new Date(shootType.createdAt), "MMM dd, yyyy HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-muted-foreground">
                  {format(new Date(shootType.updatedAt), "MMM dd, yyyy HH:mm")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                How this shoot type is being used.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Total Shoots</span>
                </div>
                <Badge variant="secondary">{shootType._count.shoots}</Badge>
              </div>
              {shootType._count.shoots > 0 && (
                <p className="text-muted-foreground mt-2 text-xs">
                  This shoot type is actively being used in shoots
                </p>
              )}
              {shootType._count.shoots === 0 && (
                <p className="text-muted-foreground mt-2 text-xs">
                  No shoots have been created with this type yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common actions for this shoot type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href={`/dashboard/shoot-types/${shootType.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/dashboard/shoots/new">
                  <Tag className="mr-2 h-4 w-4" />
                  Create New Shoot
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
