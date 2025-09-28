import { getClients } from "@/server/actions/client-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your photography clients and their locations
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold">No clients found</h3>
              <p className="text-muted-foreground">
                Get started by adding your first client
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/clients/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary">
                        {client.locations?.length || 0} locations
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/clients/${client.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/clients/${client.id}/locations`}>
                        <MapPin className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {client.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      {client.email}
                    </span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      {client.phone}
                    </span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      {client.address}
                    </span>
                  </div>
                )}
                <div className="text-muted-foreground text-xs">
                  Created {format(new Date(client.createdAt), "MMM dd, yyyy")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
