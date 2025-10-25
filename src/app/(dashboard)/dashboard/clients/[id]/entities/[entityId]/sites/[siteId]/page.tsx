import { getSitesByEntity, getPOCsBySite } from "@/server/actions/client-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Plus, 
  Edit, 
  Calendar,
  Phone,
  Mail
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

interface SiteDetailPageProps {
  params: Promise<{
    id: string;
    entityId: string;
    siteId: string;
  }>;
}

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
  const { id, entityId, siteId } = await params;
  const sites = await getSitesByEntity(entityId);
  const site = sites.find(s => s.id === siteId);
  const pocs = await getPOCsBySite(siteId);

  if (!site) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/clients/${id}/entities/${entityId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Manage POCs for {site.name}</h1>
          <p className="text-muted-foreground">
            Create, edit, and manage points of contact for this site
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/${siteId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Site
            </Link>
          </Button>
        </div>
      </div>

      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Site Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Site Name</p>
              <p className="text-lg font-semibold">{site.name}</p>
            </div>
            {site.address && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{site.address}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total POCs</p>
              <p className="text-sm font-semibold">{pocs.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{format(new Date(site.createdAt), "MMM dd, yyyy")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* POCs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Points of Contact (POCs)</h2>
            <p className="text-muted-foreground">
              Manage contacts for this site
            </p>
          </div>
          <Button asChild>
            <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/${siteId}/pocs/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add POC
            </Link>
          </Button>
        </div>

        {pocs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="space-y-2 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No POCs found</h3>
                <p className="text-muted-foreground">
                  Get started by adding the first point of contact for {site.name}
                </p>
                <Button asChild className="mt-4">
                  <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/${siteId}/pocs/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add POC
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pocs.map((poc) => (
              <Card key={poc.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{poc.name}</CardTitle>
                      {poc.role && (
                        <CardDescription className="mt-1">
                          {poc.role}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/${siteId}/pocs/${poc.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <span>{poc.phone}</span>
                  </div>
                  {poc.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="text-muted-foreground h-4 w-4" />
                      <span>{poc.email}</span>
                    </div>
                  )}
                  <div className="text-muted-foreground text-xs">
                    Created {format(new Date(poc.createdAt), "MMM dd, yyyy")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total POCs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pocs.length}</div>
            <p className="text-xs text-muted-foreground">
              Points of contact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Age</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor((Date.now() - new Date(site.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
            <p className="text-xs text-muted-foreground">
              Since creation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
