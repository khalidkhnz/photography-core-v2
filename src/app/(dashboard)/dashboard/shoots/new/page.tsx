"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createShoot } from "@/server/actions/shoot-actions";
import { getClients } from "@/server/actions/client-actions";
import { getShootTypes } from "@/server/actions/shoot-type-actions";
import { getLocationsByClient } from "@/server/actions/location-actions";
import { getPhotographers } from "@/server/actions/photographer-actions";
import { getEditors } from "@/server/actions/editor-actions";
import {
  createShootSchema,
  type CreateShootFormData,
} from "@/lib/validations/shoot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
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

  const form = useForm<CreateShootFormData>({
    resolver: zodResolver(createShootSchema),
    defaultValues: {
      clientId: "",
      shootTypeId: "",
      locationId: "",
      overallDeliverables: "",
      shootStartDate: "",
      shootEndDate: "",
      photographerNotes: "",
      editorNotes: "",
      photographerIds: [],
      editorIds: [],
    },
  });

  // Watch for client changes to fetch locations
  const selectedClientId = form.watch("clientId");

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [clientsData, shootTypesData, photographersData, editorsData] =
          await Promise.all([
            getClients(),
            getShootTypes(),
            getPhotographers(),
            getEditors(),
          ]);

        setClients(clientsData);
        setShootTypes(shootTypesData);
        setPhotographers(photographersData);
        setEditors(editorsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load form data");
      } finally {
        setDataLoading(false);
      }
    }

    void fetchData();
  }, []);

  // Fetch locations when client changes
  useEffect(() => {
    async function fetchClientLocations() {
      if (selectedClientId) {
        try {
          const clientLocations = await getLocationsByClient(selectedClientId);
          setLocations(clientLocations);
          // Reset location selection when client changes
          form.setValue("locationId", "");
        } catch (error) {
          console.error("Error fetching client locations:", error);
        }
      } else {
        setLocations([]);
        form.setValue("locationId", "");
      }
    }

    void fetchClientLocations();
  }, [selectedClientId, form]);

  const onSubmit = async (data: CreateShootFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Convert the form data to FormData for the server action
      const formData = new FormData();
      // Shoot ID will be auto-generated on the server
      formData.append("clientId", data.clientId);
      formData.append("shootTypeId", data.shootTypeId);
      if (data.locationId) formData.append("locationId", data.locationId);
      if (data.overallDeliverables)
        formData.append("overallDeliverables", data.overallDeliverables);
      if (data.shootStartDate)
        formData.append("shootStartDate", data.shootStartDate);
      if (data.shootEndDate) formData.append("shootEndDate", data.shootEndDate);
      if (data.photographerNotes)
        formData.append("photographerNotes", data.photographerNotes);
      if (data.editorNotes) formData.append("editorNotes", data.editorNotes);

      // Add photographer IDs
      if (data.photographerIds) {
        data.photographerIds.forEach((id) => {
          formData.append("photographerIds", id);
        });
      }

      // Add editor IDs
      if (data.editorIds) {
        data.editorIds.forEach((id) => {
          formData.append("editorIds", id);
        });
      }

      await createShoot(formData);
      void router.push("/dashboard/shoots");
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shootTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shoot Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shoot type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shootTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name} ({type.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedClientId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  !selectedClientId
                                    ? "Select a client first"
                                    : locations.length === 0
                                      ? "No locations found for this client"
                                      : "Select a location"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.length === 0 && selectedClientId ? (
                              <div className="text-muted-foreground px-2 py-1 text-sm">
                                No locations found. Add locations for this
                                client first.
                              </div>
                            ) : (
                              locations.map((location) => (
                                <SelectItem
                                  key={location.id}
                                  value={location.id}
                                >
                                  {location.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {!selectedClientId && (
                          <p className="text-muted-foreground text-xs">
                            Please select a client to see available locations
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name="shootStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shootEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="overallDeliverables"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overall Deliverables</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what will be delivered..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name="photographerIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">
                            Photographers
                          </FormLabel>
                          <FormDescription>
                            Select the photographers for this shoot
                          </FormDescription>
                        </div>
                        {photographers.map((photographer) => (
                          <FormField
                            key={photographer.id}
                            control={form.control}
                            name="photographerIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={photographer.id}
                                  className="flex flex-row items-start space-y-0 space-x-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        photographer.id,
                                      )}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...(field.value ?? []),
                                              photographer.id,
                                            ])
                                          : field.onChange(
                                              (field.value ?? []).filter(
                                                (value) =>
                                                  value !== photographer.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {photographer.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="photographerNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photographer Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes for the photography team..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Editor Team</CardTitle>
                  <CardDescription>
                    Assign editors to this shoot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="editorIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Editors</FormLabel>
                          <FormDescription>
                            Select the editors for this shoot
                          </FormDescription>
                        </div>
                        {editors.map((editor) => (
                          <FormField
                            key={editor.id}
                            control={form.control}
                            name="editorIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={editor.id}
                                  className="flex flex-row items-start space-y-0 space-x-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(editor.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...(field.value ?? []),
                                              editor.id,
                                            ])
                                          : field.onChange(
                                              (field.value ?? []).filter(
                                                (value) => value !== editor.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {editor.name}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="editorNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Editor Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes for the editing team..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
        </Form>
      )}
    </div>
  );
}
