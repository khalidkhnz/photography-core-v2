"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createShoot } from "@/server/actions/shoot-actions";
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

// Mock data - in a real app, this would come from the database
const clients = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "ABC Company" },
];

const shootTypes = [
  { id: "1", name: "Real Estate", code: "RE" },
  { id: "2", name: "Drone", code: "DR" },
  { id: "3", name: "Event", code: "EV" },
  { id: "4", name: "Virtual Tours", code: "VT" },
  { id: "5", name: "Podcasts", code: "PC" },
];

const locations = [
  { id: "1", name: "Downtown Studio" },
  { id: "2", name: "Outdoor Location" },
  { id: "3", name: "Client Office" },
];

const photographers = [
  { id: "1", name: "Alice Johnson" },
  { id: "2", name: "Bob Wilson" },
  { id: "3", name: "Carol Davis" },
];

const editors = [
  { id: "1", name: "David Brown" },
  { id: "2", name: "Eva Garcia" },
  { id: "3", name: "Frank Miller" },
];

export default function CreateShootPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
    </div>
  );
}
