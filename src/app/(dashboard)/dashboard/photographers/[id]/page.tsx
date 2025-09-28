import { getPhotographerById } from "@/server/actions/photographer-actions";
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
  Star,
  Mail,
  Phone,
  Calendar,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export default async function ViewPhotographerPage({
  params,
}: {
  params: { id: string };
}) {
  const photographer = await getPhotographerById(params.id);

  if (!photographer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/photographers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {photographer.name}
            </h1>
            <p className="text-muted-foreground">
              Photographer profile and information
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/photographers/${photographer.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Photographer
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Information */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Photographer Overview</CardTitle>
              <CardDescription>
                Key details about this photographer.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-muted-foreground">{photographer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge
                  variant={photographer.isActive ? "default" : "secondary"}
                >
                  {photographer.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Rating</p>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-muted-foreground">
                    {photographer.rating?.toFixed(1) || "0.0"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Total Shoots</p>
                <Badge variant="outline">{photographer._count.shoots}</Badge>
              </div>
              {photographer.email && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Email</p>
                  <div className="flex items-center space-x-2">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      {photographer.email}
                    </span>
                  </div>
                </div>
              )}
              {photographer.phone && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Phone</p>
                  <div className="flex items-center space-x-2">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      {photographer.phone}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-muted-foreground">
                  {format(new Date(photographer.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-muted-foreground">
                  {format(new Date(photographer.updatedAt), "MMM dd, yyyy")}
                </p>
              </div>
            </CardContent>
          </Card>

          {photographer.specialties && photographer.specialties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
                <CardDescription>
                  Areas of expertise for this photographer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {photographer.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Statistics</CardTitle>
              <CardDescription>
                Photographer's work history and performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Total Shoots</span>
                  </div>
                  <Badge variant="secondary">
                    {photographer._count.shoots}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">
                      {photographer.rating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <Badge
                    variant={photographer.isActive ? "default" : "secondary"}
                  >
                    {photographer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {photographer._count.shoots === 0 && (
                <p className="text-muted-foreground mt-4 text-xs">
                  This photographer hasn't been assigned to any shoots yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common actions for this photographer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href={`/dashboard/photographers/${photographer.id}/edit`}>
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
                  <Camera className="mr-2 h-4 w-4" />
                  Assign to Shoot
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
