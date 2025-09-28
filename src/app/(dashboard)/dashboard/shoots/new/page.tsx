"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createShoot } from "@/server/actions/shoot-actions";
import { getClients } from "@/server/actions/client-actions";
import { getShootTypes } from "@/server/actions/shoot-type-actions";
import { getLocations } from "@/server/actions/location-actions";
import { getPhotographers } from "@/server/actions/photographer-actions";
import { getEditors } from "@/server/actions/editor-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Types for the form data
interface Client {
  id: string;
  name: string;
  email?: string | null;
}

interface ShootType {
  id: string;
  name: string;
  code: string;
}

interface Location {
  id: string;
  name: string;
  address?: string | null;
}

interface Photographer {
  id: string;
  name: string;
  email?: string | null;
}

interface Editor {
  id: string;
  name: string;
  email?: string | null;
}

export default function CreateShootPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [shootTypes, setShootTypes] = useState<ShootType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [
          clientsData,
          shootTypesData,
          locationsData,
          photographersData,
          editorsData,
        ] = await Promise.all([
          getClients(),
          getShootTypes(),
          getLocations(),
          getPhotographers(),
          getEditors(),
        ]);

        setClients(clientsData);
        setShootTypes(shootTypesData);
        setLocations(locationsData);
        setPhotographers(photographersData);
        setEditors(editorsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load form data");
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError("");

    try {
      await createShoot(formData);
      router.push("/dashboard/shoots");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create shoot",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/shoots">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Shoot
          </h1>
          <p className="text-muted-foreground">
            Fill in the details to create a new photography shoot
          </p>
        </div>
      </div>

      {dataLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading form data...</p>
          </div>
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about the shoot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shootId">Shoot ID *</Label>
                  <Input
                    id="shootId"
                    name="shootId"
                    placeholder="e.g., RE-2024-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientId">Client *</Label>
                  <Select name="clientId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shootTypeId">Shoot Type *</Label>
                  <Select name="shootTypeId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shoot type" />
                    </SelectTrigger>
                    <SelectContent>
                      {shootTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationId">Location</Label>
                  <Select name="locationId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule & Details</CardTitle>
                <CardDescription>
                  Timing and deliverable information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shootStartDate">Start Date</Label>
                  <Input
                    id="shootStartDate"
                    name="shootStartDate"
                    type="datetime-local"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shootEndDate">End Date</Label>
                  <Input
                    id="shootEndDate"
                    name="shootEndDate"
                    type="datetime-local"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overallDeliverables">
                    Overall Deliverables
                  </Label>
                  <Textarea
                    id="overallDeliverables"
                    name="overallDeliverables"
                    placeholder="Describe what will be delivered..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Photographer Team</CardTitle>
                <CardDescription>
                  Assign photographers to this shoot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Photographers</Label>
                  <div className="space-y-2">
                    {photographers.map((photographer) => (
                      <div
                        key={photographer.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`photographer-${photographer.id}`}
                          name="photographerIds"
                          value={photographer.id}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`photographer-${photographer.id}`}>
                          {photographer.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photographerNotes">Photographer Notes</Label>
                  <Textarea
                    id="photographerNotes"
                    name="photographerNotes"
                    placeholder="Notes for the photography team..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Editor Team</CardTitle>
                <CardDescription>Assign editors to this shoot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Editors</Label>
                  <div className="space-y-2">
                    {editors.map((editor) => (
                      <div
                        key={editor.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`editor-${editor.id}`}
                          name="editorIds"
                          value={editor.id}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`editor-${editor.id}`}>
                          {editor.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editorNotes">Editor Notes</Label>
                  <Textarea
                    id="editorNotes"
                    name="editorNotes"
                    placeholder="Notes for the editing team..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/shoots">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Shoot"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
