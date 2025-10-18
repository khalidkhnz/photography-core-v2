"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateShoot } from "@/server/actions/shoot-actions";
import { getShootById } from "@/server/actions/shoot-actions";
import { getClients } from "@/server/actions/client-actions";
import { getShootTypes } from "@/server/actions/shoot-type-actions";
import { getLocationsByClient } from "@/server/actions/location-actions";
import { getTeamMembers } from "@/server/actions/user-actions";
import { getClusters } from "@/server/actions/cluster-actions";
import {
  updateShootSchema,
  type UpdateShootFormData,
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

interface TeamMember {
  id: string;
  name: string | null;
  email?: string | null;
  roles: string[];
  specialties: string[];
  rating?: number | null;
  isActive: boolean;
}

interface Cluster {
  id: string;
  name: string;
  description?: string | null;
}

// Extended Shoot type with new fields
interface ExtendedShoot {
  shootId: string;
  clientId: string;
  shootTypeId: string;
  locationId: string | null;
  clusterId?: string | null;
  projectName?: string | null;
  remarks?: string | null;
  editId?: string | null;
  overallDeliverables?: string | null;
  shootStartDate?: Date | null;
  shootEndDate?: Date | null;
  photographerNotes?: string | null;
  editorNotes?: string | null;
  workflowType?: string | null;
  photographyCost?: number | null;
  travelCost?: number | null;
  editingCost?: number | null;
  executorId?: string | null;
  teamMembers: Array<{ userId: string; assignmentType: string }>;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditShootPage({ params }: PageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [shootTypes, setShootTypes] = useState<ShootType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [shootId, setShootId] = useState<string>("");
  const router = useRouter();

  const form = useForm<UpdateShootFormData>({
    resolver: zodResolver(updateShootSchema),
    defaultValues: {
      shootId: "",
      clientId: "",
      shootTypeId: "",
      locationId: "",
      clusterId: "",
      projectName: "",
      remarks: "",
      editId: "",
      overallDeliverables: "",
      shootStartDate: "",
      shootEndDate: "",
      photographerNotes: "",
      editorNotes: "",
      workflowType: "shift",
      photographyCost: "",
      travelCost: "",
      editingCost: "",
      photographerIds: [],
      editorIds: [],
      executorId: "",
    },
  });

  // Watch for client changes to fetch locations
  const selectedClientId = form.watch("clientId");
  const selectedWorkflowType = form.watch("workflowType");

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const { id } = await params;
        setShootId(id);

        // Fetch shoot data and other data in parallel
        const [
          shootData,
          clientsData,
          shootTypesData,
          teamMembersData,
          clustersData,
        ] = await Promise.all([
          getShootById(id),
          getClients(),
          getShootTypes(),
          getTeamMembers(["photographer", "editor"]),
          getClusters(),
        ]);

        if (!shootData) {
          setError("Shoot not found");
          return;
        }

        setClients(clientsData);
        setShootTypes(shootTypesData);
        setTeamMembers(teamMembersData);
        setClusters(clustersData);

        // Cast shootData to ExtendedShoot to access new fields
        const extendedShootData = shootData as unknown as ExtendedShoot;

        // Set form values
        form.setValue("shootId", extendedShootData.shootId);
        form.setValue("clientId", extendedShootData.clientId);
        form.setValue("shootTypeId", extendedShootData.shootTypeId);
        form.setValue("locationId", extendedShootData.locationId ?? "");
        form.setValue("clusterId", extendedShootData.clusterId ?? "");
        form.setValue("projectName", extendedShootData.projectName ?? "");
        form.setValue("remarks", extendedShootData.remarks ?? "");
        form.setValue("editId", extendedShootData.editId ?? "");
        form.setValue(
          "workflowType",
          (extendedShootData.workflowType as "shift" | "project" | "cluster") ??
            "shift",
        );
        form.setValue(
          "overallDeliverables",
          extendedShootData.overallDeliverables ?? "",
        );
        form.setValue(
          "shootStartDate",
          extendedShootData.shootStartDate
            ? new Date(extendedShootData.shootStartDate)
                .toISOString()
                .slice(0, 16)
            : "",
        );
        form.setValue(
          "shootEndDate",
          extendedShootData.shootEndDate
            ? new Date(extendedShootData.shootEndDate)
                .toISOString()
                .slice(0, 16)
            : "",
        );
        form.setValue(
          "photographerNotes",
          extendedShootData.photographerNotes ?? "",
        );
        form.setValue("editorNotes", extendedShootData.editorNotes ?? "");
        form.setValue(
          "photographyCost",
          extendedShootData.photographyCost?.toString() ?? "",
        );
        form.setValue(
          "travelCost",
          extendedShootData.travelCost?.toString() ?? "",
        );
        form.setValue(
          "editingCost",
          extendedShootData.editingCost?.toString() ?? "",
        );
        form.setValue(
          "photographerIds",
          extendedShootData.teamMembers
            .filter((tm) => tm.assignmentType === "photographer")
            .map((tm) => tm.userId),
        );
        form.setValue(
          "editorIds",
          extendedShootData.teamMembers
            .filter((tm) => tm.assignmentType === "editor")
            .map((tm) => tm.userId),
        );
        form.setValue("executorId", extendedShootData.executorId ?? "");

        // Fetch locations for the client
        if (shootData.clientId) {
          const clientLocations = await getLocationsByClient(
            shootData.clientId,
          );
          setLocations(clientLocations);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load shoot data");
      } finally {
        setDataLoading(false);
      }
    }

    void fetchData();
  }, [params, form]);

  // Fetch locations when client changes
  useEffect(() => {
    async function fetchClientLocations() {
      if (selectedClientId) {
        try {
          const clientLocations = await getLocationsByClient(selectedClientId);
          setLocations(clientLocations);
          // Reset location selection when client changes (unless it's the initial load)
          if (
            form.getValues("locationId") &&
            !form.getValues("locationId")?.includes(selectedClientId)
          ) {
            form.setValue("locationId", "");
          }
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

  const onSubmit = async (data: UpdateShootFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Convert the form data to FormData for the server action
      const formData = new FormData();
      formData.append("shootId", data.shootId);
      formData.append("clientId", data.clientId);
      formData.append("shootTypeId", data.shootTypeId);
      if (data.locationId) formData.append("locationId", data.locationId);
      if (data.clusterId) formData.append("clusterId", data.clusterId);
      if (data.projectName) formData.append("projectName", data.projectName);
      if (data.remarks) formData.append("remarks", data.remarks);
      if (data.editId) formData.append("editId", data.editId);
      if (data.workflowType) formData.append("workflowType", data.workflowType);
      if (data.overallDeliverables)
        formData.append("overallDeliverables", data.overallDeliverables);
      if (data.shootStartDate)
        formData.append("shootStartDate", data.shootStartDate);
      if (data.shootEndDate) formData.append("shootEndDate", data.shootEndDate);
      if (data.photographerNotes)
        formData.append("photographerNotes", data.photographerNotes);
      if (data.editorNotes) formData.append("editorNotes", data.editorNotes);
      if (data.photographyCost)
        formData.append("photographyCost", data.photographyCost);
      if (data.travelCost) formData.append("travelCost", data.travelCost);
      if (data.editingCost) formData.append("editingCost", data.editingCost);

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

      // Add executor ID
      if (data.executorId) {
        formData.append("executorId", data.executorId);
      }

      await updateShoot(shootId, formData);
      void router.push(`/dashboard/shoots/${shootId}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update shoot",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary mx-auto mb-4 flex h-8 w-8 animate-spin items-center justify-center rounded-full border-b-2"></div>
        <p className="text-muted-foreground">Loading shoot data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/shoots/${shootId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Shoot</h1>
          <p className="text-muted-foreground">
            Update the details of this photography shoot
          </p>
        </div>
      </div>

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
                  name="shootId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shoot ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter shoot ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        You can edit the auto-generated shoot ID
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  name="workflowType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select workflow" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="shift">
                            Shift Basis (Per-day/Per-shift)
                          </SelectItem>
                          <SelectItem value="project">
                            Project Basis (Lump-sum)
                          </SelectItem>
                          <SelectItem value="cluster">
                            Cluster Basis (Grouped shoots)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose how this shoot will be tracked and billed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedWorkflowType === "cluster" && (
                  <FormField
                    control={form.control}
                    name="clusterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cluster</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cluster (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clusters.length === 0 ? (
                              <div className="text-muted-foreground px-2 py-1 text-sm">
                                No clusters available. Create one first.
                              </div>
                            ) : (
                              clusters.map((cluster) => (
                                <SelectItem key={cluster.id} value={cluster.id}>
                                  {cluster.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Group this shoot with other shoots for combined P&L
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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
                              No locations found. Add locations for this client
                              first.
                            </div>
                          ) : (
                            locations.map((location) => (
                              <SelectItem key={location.id} value={location.id}>
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

                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="editId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edit ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Edit ID (per deliverable)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional remarks..."
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
                      {teamMembers
                        .filter((member) =>
                          member.roles.includes("photographer"),
                        )
                        .map((member) => (
                          <FormField
                            key={member.id}
                            control={form.control}
                            name="photographerIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={member.id}
                                  className="flex flex-row items-start space-y-0 space-x-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(member.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...(field.value ?? []),
                                              member.id,
                                            ])
                                          : field.onChange(
                                              (field.value ?? []).filter(
                                                (value) => value !== member.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {member.name}
                                    {member.specialties.length > 0 && (
                                      <span className="text-muted-foreground text-xs">
                                        {" "}
                                        ({member.specialties.join(", ")})
                                      </span>
                                    )}
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
                <CardDescription>Assign editors to this shoot</CardDescription>
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
                      {teamMembers
                        .filter((member) => member.roles.includes("editor"))
                        .map((member) => (
                          <FormField
                            key={member.id}
                            control={form.control}
                            name="editorIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={member.id}
                                  className="flex flex-row items-start space-y-0 space-x-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(member.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...(field.value ?? []),
                                              member.id,
                                            ])
                                          : field.onChange(
                                              (field.value ?? []).filter(
                                                (value) => value !== member.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {member.name}
                                    {member.specialties.length > 0 && (
                                      <span className="text-muted-foreground text-xs">
                                        {" "}
                                        ({member.specialties.join(", ")})
                                      </span>
                                    )}
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

            {/* Executor Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Executor</CardTitle>
                <CardDescription>
                  Select the person who will complete this shoot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="executorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Executor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an executor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teamMembers
                            .filter((member) => 
                              member.roles.includes("photographer") || 
                              member.roles.includes("editor")
                            )
                            .map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                                {member.specialties.length > 0 && (
                                  <span className="text-muted-foreground text-xs">
                                    {" "}
                                    ({member.specialties.join(", ")})
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose from the selected team members who will complete this shoot
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Cost Tracking Section */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Tracking</CardTitle>
              <CardDescription>
                Track photography and editing costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="photographyCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photography Cost ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="travelCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Travel Cost ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="editingCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Editing Cost ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="bg-muted rounded-md p-3">
                <p className="text-sm">
                  <strong>Total Cost:</strong> $
                  {(
                    (parseFloat(form.watch("photographyCost") ?? "0") ?? 0) +
                    (parseFloat(form.watch("travelCost") ?? "0") ?? 0) +
                    (parseFloat(form.watch("editingCost") ?? "0") ?? 0)
                  ).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/dashboard/shoots/${shootId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Shoot"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
