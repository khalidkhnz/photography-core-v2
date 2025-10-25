import { getEntityById, getSitesByEntity } from "@/server/actions/client-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Users, 
  Plus, 
  Edit, 
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

interface EntityDetailPageProps {
  params: Promise<{
    id: string;
    entityId: string;
  }>;
}

export default async function EntityDetailPage({ params }: EntityDetailPageProps) {
  const { id, entityId } = await params;
  const entity = await getEntityById(entityId);
  const sites = await getSitesByEntity(entityId);

  if (!entity) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/clients/${id}?tab=entities`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Manage Sites for {entity.name}</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage sites and POCs for this entity
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/clients/${id}/entities/${entityId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Entity
            </Link>
          </Button>
        </div>
      </div>

      {/* Entity Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Entity Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entity Name</p>
              <p className="text-lg font-semibold">{entity.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client</p>
              <p className="text-sm">{entity.client.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sites</p>
              <p className="text-sm font-semibold">{sites.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{format(new Date(entity.createdAt), "MMM dd, yyyy")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sites Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Sites</h2>
            <p className="text-muted-foreground">
              Manage sites and POCs for this entity
            </p>
          </div>
          <Button asChild>
            <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Site
            </Link>
          </Button>
        </div>

        {sites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="space-y-2 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No sites found</h3>
                <p className="text-muted-foreground">
                  Get started by adding the first site for {entity.name}
                </p>
                <Button asChild className="mt-4">
                  <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Site
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <Card key={site.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{site.name}</CardTitle>
                      {site.address && (
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {site.address}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/${site.id}`}>
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/${site.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {site.pocs && site.pocs.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="text-muted-foreground h-4 w-4" />
                        <span className="text-muted-foreground">
                          {site.pocs.length} POCs
                        </span>
                      </div>
                      {site.pocs.slice(0, 2).map((poc) => (
                        <div key={poc.id} className="ml-6 text-xs text-muted-foreground">
                          • {poc.name}
                          {poc.email && (
                            <span className="ml-2">({poc.email})</span>
                          )}
                        </div>
                      ))}
                      {site.pocs.length > 2 && (
                        <div className="ml-6 text-xs text-muted-foreground">
                          +{site.pocs.length - 2} more POCs
                        </div>
                      )}
                    </div>
                  )}
                  {site.locations && site.locations.length > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <span className="text-muted-foreground">
                        {site.locations.length} locations
                      </span>
                    </div>
                  )}
                  <div className="text-muted-foreground text-xs">
                    Created {format(new Date(site.createdAt), "MMM dd, yyyy")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
            <p className="text-xs text-muted-foreground">
              Sites for this entity
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
              {sites.reduce((sum, site) => sum + (site.pocs?.length ?? 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all sites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sites.reduce((sum, site) => sum + (site.locations?.length ?? 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Shooting locations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
