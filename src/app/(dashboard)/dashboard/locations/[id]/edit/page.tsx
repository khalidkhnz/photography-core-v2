import { getLocationById } from "@/server/actions/location-actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditLocationForm } from "./_components/edit-location-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLocationPage({ params }: PageProps) {
  const { id } = await params;

  const location = await getLocationById(id);

  if (!location) {
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
            Edit Location
          </h1>
          <p className="text-muted-foreground">
            Update the location details
          </p>
        </div>
      </div>

      <EditLocationForm location={location} />
    </div>
  );
}
