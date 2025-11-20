import { getClientById, getEntitiesByClient } from "@/server/actions/client-actions";
import { getLocationsByClient } from "@/server/actions/location-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Users, 
  Plus, 
  Edit, 
  Calendar,
  Phone,
  Mail,
  Home
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

interface ClientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const client = await getClientById(id);
  const entities = await getEntitiesByClient(id);
  const locations = await getLocationsByClient(id);

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">Client details and management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/clients/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Client
            </Link>
          </Button>
        </div>
      </div>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{client.name}</p>
            </div>
            {client.pocEmail && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{client.pocEmail}</p>
                </div>
              </div>
            )}
            {client.pocPhone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{client.pocPhone}</p>
                </div>
              </div>
            )}
            {client.address && (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{client.address}</p>
                </div>
              </div>
            )}
            {client.pocName && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Point of Contact</p>
                <p className="text-sm">{client.pocName}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{format(new Date(client.createdAt), "MMM dd, yyyy")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="entities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entities">Manage Entities</TabsTrigger>
          <TabsTrigger value="locations">Manage Locations</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Entities Tab */}
        <TabsContent value="entities" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Manage Entities</h2>
              <p className="text-muted-foreground">
                Create, edit, and manage billing entities for {client.name}
              </p>
            </div>
            <Button asChild>
              <Link href={`/dashboard/clients/${id}/entities/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Entity
              </Link>
            </Button>
          </div>

          {entities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="space-y-2 text-center">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No entities found</h3>
                  <p className="text-muted-foreground">
                    Get started by adding the first billing entity for {client.name}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href={`/dashboard/clients/${id}/entities/new`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Entity
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {entities.map((entity) => (
                <Card key={entity.id} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{entity.name}</CardTitle>
                        <CardDescription className="mt-1">
                          Billing entity
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/clients/${id}/entities/${entity.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/clients/${id}/entities/${entity.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-muted-foreground text-xs">
                      Created {format(new Date(entity.createdAt), "MMM dd, yyyy")}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Manage Locations</h2>
              <p className="text-muted-foreground">
                Create, edit, and manage shooting locations for {client.name}
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
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
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
                <Card key={location.id} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                        {location.address && (
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {location.address}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/locations/${location.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/locations/${location.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {location.city && location.state && (
                        <span>{location.city}, {location.state}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entities</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{entities.length}</div>
                <p className="text-xs text-muted-foreground">
                  Billing entities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{locations.length}</div>
                <p className="text-xs text-muted-foreground">
                  Shooting locations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total POCs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locations.reduce((sum, location) => sum + (location.pocs?.length ?? 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all locations
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
