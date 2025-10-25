"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getPOCsBySite } from "@/server/actions/client-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Users, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import type { POC } from "@prisma/client";

// POC interface is defined in the server actions

export default function POCsPage() {
  const params = useParams();
  const id = params.id as string;
  const entityId = params.entityId as string;
  const siteId = params.siteId as string;
  
  const [pocs, setPocs] = useState<POC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPOCs() {
      try {
        const pocsData = await getPOCsBySite(siteId);
        setPocs(pocsData);
      } catch (error) {
        console.error("Error fetching POCs:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (siteId) {
      void fetchPOCs().catch((error) => {
        console.error("Error fetching POCs:", error);
      });
    }
  }, [siteId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Point of Contacts</h1>
          <p className="text-muted-foreground">
            Manage POCs for this site
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Site POCs</h2>
          <p className="text-muted-foreground">
            Each POC can have contact information and specific roles
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
                Get started by adding the first point of contact for this site
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
                        <Badge variant="outline">{poc.role}</Badge>
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">{poc.phone}</span>
                </div>
                {poc.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">{poc.email}</span>
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
  );
}
