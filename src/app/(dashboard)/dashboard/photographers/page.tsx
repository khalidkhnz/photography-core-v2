import { getPhotographers } from "@/server/actions/photographer-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Phone, Mail, Star } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function PhotographersPage() {
  const photographers = await getPhotographers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Photographers</h1>
          <p className="text-muted-foreground">
            Manage your photography team members
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/photographers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Photographer
          </Link>
        </Button>
      </div>

      {photographers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold">No photographers found</h3>
              <p className="text-muted-foreground">
                Get started by adding your first photographer
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/photographers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Photographer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {photographers.map((photographer) => (
            <Card
              key={photographer.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {photographer.name}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Badge
                        variant={
                          photographer.isActive ? "default" : "secondary"
                        }
                      >
                        {photographer.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{photographer.rating}/5</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/dashboard/photographers/${photographer.id}/edit`}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={`/dashboard/photographers/${photographer.id}/delete`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {photographer.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      {photographer.email}
                    </span>
                  </div>
                )}
                {photographer.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      {photographer.phone}
                    </span>
                  </div>
                )}
                {photographer.specialties &&
                  photographer.specialties.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Specialties</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {photographer.specialties.map((specialty, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                <div className="text-muted-foreground text-xs">
                  Created{" "}
                  {format(new Date(photographer.createdAt), "MMM dd, yyyy")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
