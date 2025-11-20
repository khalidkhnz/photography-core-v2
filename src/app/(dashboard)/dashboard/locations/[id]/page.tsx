import { getLocationById } from "@/server/actions/location-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Edit, MapPin, Users, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LocationDetailPage({ params }: PageProps) {
  const { id } = await params;

  const location = await getLocationById(id);

  if (!location) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {location.name}
            </h1>
            <p className="text-muted-foreground">Location details and POCs</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/locations/${location.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Location
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Information */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-muted-foreground">{location.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <Link
                    href={`/dashboard/clients/${location.client.id}`}
                    className="text-primary hover:underline"
                  >
                    {location.client.name}
                  </Link>
                </div>
              </div>

              {location.address && (
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-muted-foreground">{location.address}</p>
                </div>
              )}

              {(location.city !== null || location.state !== null || location.country !== null) && (
                <div className="grid gap-4 md:grid-cols-3">
                  {location.city && (
                    <div>
                      <p className="text-sm font-medium">City</p>
                      <p className="text-muted-foreground">{location.city}</p>
                    </div>
                  )}
                  {location.state && (
                    <div>
                      <p className="text-sm font-medium">State</p>
                      <p className="text-muted-foreground">{location.state}</p>
                    </div>
                  )}
                  {location.country && (
                    <div>
                      <p className="text-sm font-medium">Country</p>
                      <p className="text-muted-foreground">{location.country}</p>
                    </div>
                  )}
                </div>
              )}

              {location.coordinates && (
                <div>
                  <p className="text-sm font-medium">Coordinates</p>
                  <p className="text-muted-foreground">{location.coordinates}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Points of Contact */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Points of Contact
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Contact persons for this location
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/locations/${location.id}/pocs`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Manage POCs
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {location.pocs.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">No POCs yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add points of contact for this location
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/locations/${location.id}/pocs`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First POC
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {location.pocs.map((poc) => (
                    <Card key={poc.id} className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{poc.name}</CardTitle>
                        {poc.role && (
                          <CardDescription className="text-sm">
                            {poc.role}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Phone:</span>
                          <span className="font-medium">{poc.phone}</span>
                        </div>
                        {poc.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium break-all">
                              {poc.email}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Total POCs</p>
                <p className="text-2xl font-bold">{location.pocs.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Shoots</p>
                <p className="text-2xl font-bold">{location._count.shoots}</p>
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
                  {format(new Date(location.createdAt), "PPP 'at' p")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-muted-foreground">
                  {format(new Date(location.updatedAt), "PPP 'at' p")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/locations/${location.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Location
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/locations/${location.id}/pocs`}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage POCs
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/dashboard/clients/${location.client.id}`}>
                  View Client
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

