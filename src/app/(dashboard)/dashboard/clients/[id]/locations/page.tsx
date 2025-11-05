import { getClientById } from "@/server/actions/client-actions";
import { getLocationsByClient } from "@/server/actions/location-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LocationsGrid } from "./_components/locations-grid";

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
            {client.pocEmail && (
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-muted-foreground">{client.pocEmail}</p>
              </div>
            )}
            {client.pocPhone && (
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-muted-foreground">{client.pocPhone}</p>
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
        <LocationsGrid locations={locations} />
      )}
    </div>
  );
}
