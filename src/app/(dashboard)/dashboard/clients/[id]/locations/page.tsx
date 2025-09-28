import { getClientById } from "@/server/actions/client-actions";
import { getLocationsByClient } from "@/server/actions/location-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientLocationsPage({ params }: PageProps) {
  const { id } = await params;
  const client = await getClientById(id);
  const locations = await getLocationsByClient(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {client.name} - Locations
          </h1>
          <p className="text-muted-foreground">
            Manage locations for this client
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-muted-foreground">{client.name}</p>
            </div>
            {client.email && (
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-muted-foreground">{client.email}</p>
              </div>
            )}
            {client.phone && (
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-muted-foreground">{client.phone}</p>
              </div>
            )}
            {client.address && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium">Main Address</p>
                <p className="text-muted-foreground">{client.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Locations</h2>
          <p className="text-muted-foreground">
            Manage shooting locations for {client.name}
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/clients/${id}/locations/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Link>
        </Button>
      </div>

      {locations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <MapPin className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="text-lg font-semibold">No locations found</h3>
              <p className="text-muted-foreground">
                Add locations for {client.name} to get started
              </p>
              <Button asChild className="mt-4">
                <Link href={`/dashboard/clients/${id}/locations/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Card
              key={location.id}
              className="transition-shadow hover:shadow-md"
            >
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
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/locations/${location.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/locations/${location.id}/delete`}>
                        <Trash2 className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
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
                <div className="text-muted-foreground text-xs">
                  Created {format(new Date(location.createdAt), "MMM dd, yyyy")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
