"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { createShoot, generateShootIdAction } from "@/server/actions/shoot-actions";
import { getClients, getEntitiesByClientForShoot } from "@/server/actions/client-actions";
import { getShootTypes } from "@/server/actions/shoot-type-actions";
import { getLocationsByClient, getPOCsByLocation } from "@/server/actions/location-actions";
import { getEdits } from "@/server/actions/edit-actions";
import { getTeamMembers } from "@/server/actions/user-actions";
import { getClusters } from "@/server/actions/cluster-actions";
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
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface LocationPOC {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  role?: string | null;
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

interface Entity {
  id: string;
  name: string;
}

interface Edit {
  id: string;
  editId: string;
  shootId: string | null;
}

export default function CreateShootPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [shootTypes, setShootTypes] = useState<ShootType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationPOCs, setLocationPOCs] = useState<LocationPOC[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [edits, setEdits] = useState<Edit[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  const form = useForm<CreateShootFormData>({
    resolver: zodResolver(createShootSchema),
    defaultValues: {
      shootId: "",
      clientId: "",
      entityId: "",
      shootTypeId: "",
      locationId: "",
      clusterId: "",
      projectName: "",
      remarks: "",
      overallDeliverables: "",
      scheduledShootDate: "",
      reportingTime: "",
      wrapUpTime: "",
      photographerNotes: "",
      workflowType: "shift",
      shootCost: "",
      travelCost: "",
      shootCostStatus: undefined,
      travelCostStatus: undefined,
      overallCost: "",
      overallCostStatus: undefined,
      dopId: "",
      executorIds: [],
      editIds: [],
    },
  });

  // Watch for cascading dropdown changes
  const selectedClientId = form.watch("clientId");
  const selectedLocationId = form.watch("locationId");
  const selectedWorkflowType = form.watch("workflowType");
  const selectedReportingTime = form.watch("reportingTime");

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [
          clientsData,
          shootTypesData,
          teamMembersData,
          clustersData,
          editsData,
        ] = await Promise.all([
          getClients(),
          getShootTypes(),
          getTeamMembers(["photographer", "editor"]),
          getClusters(),
          getEdits(),
        ]);

        setClients(clientsData);
        setShootTypes(shootTypesData);
        setTeamMembers(teamMembersData);
        setClusters(clustersData);
        setEdits(editsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load form data");
      } finally {
        setDataLoading(false);
      }
    }

    void fetchData();
  }, []);

  // Fetch entities and locations when client changes
  useEffect(() => {
    async function fetchClientData() {
      if (selectedClientId) {
        try {
          const [clientEntities, clientLocations] = await Promise.all([
            getEntitiesByClientForShoot(selectedClientId),
            getLocationsByClient(selectedClientId),
          ]);
          setEntities(clientEntities);
          setLocations(clientLocations);
          // Reset dependent selections
          form.setValue("entityId", "");
          form.setValue("locationId", "");
        } catch (error) {
          console.error("Error fetching client data:", error);
        }
      } else {
        setEntities([]);
        setLocations([]);
        setLocationPOCs([]);
        form.setValue("entityId", "");
        form.setValue("locationId", "");
      }
    }

    void fetchClientData();
  }, [selectedClientId, form]);

  // Fetch POCs when location changes
  useEffect(() => {
    async function fetchLocationPOCs() {
      if (selectedLocationId) {
        try {
          const pocs = await getPOCsByLocation(selectedLocationId);
          setLocationPOCs(pocs);
        } catch (error) {
          console.error("Error fetching location POCs:", error);
        }
      } else {
        setLocationPOCs([]);
      }
    }

    void fetchLocationPOCs();
  }, [selectedLocationId]);

  // Auto-calculate wrap-up time (8 hours after reporting time)
  useEffect(() => {
    if (selectedReportingTime) {
      try {
        const [hours = 0, minutes = 0] = selectedReportingTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + 8 * 60; // Add 8 hours
        const wrapHours = Math.floor(totalMinutes / 60) % 24;
        const wrapMinutes = totalMinutes % 60;
        const wrapUpTime = `${wrapHours.toString().padStart(2, "0")}:${wrapMinutes.toString().padStart(2, "0")}`;
        form.setValue("wrapUpTime", wrapUpTime);
      } catch (error) {
        console.error("Error calculating wrap-up time:", error);
      }
    }
  }, [selectedReportingTime, form]);

  const onSubmit = async (data: CreateShootFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Validate shootId before submission
      if (!data.shootId || data.shootId.trim() === "") {
        toast.error("Shoot ID is required");
        setIsLoading(false);
        return;
      }

      // Convert the form data to FormData for the server action
      const formData = new FormData();
      formData.append("shootId", data.shootId.trim());
      formData.append("clientId", data.clientId);
      if (data.entityId) formData.append("entityId", data.entityId);
      formData.append("shootTypeId", data.shootTypeId);
      if (data.locationId) formData.append("locationId", data.locationId);
      if (data.clusterId) formData.append("clusterId", data.clusterId);
      if (data.projectName) formData.append("projectName", data.projectName);
      if (data.remarks) formData.append("remarks", data.remarks);
      if (data.workflowType) formData.append("workflowType", data.workflowType);
      if (data.overallDeliverables) formData.append("overallDeliverables", data.overallDeliverables);
      if (data.scheduledShootDate) formData.append("scheduledShootDate", data.scheduledShootDate);
      if (data.reportingTime) formData.append("reportingTime", data.reportingTime);
      if (data.wrapUpTime) formData.append("wrapUpTime", data.wrapUpTime);
      if (data.photographerNotes) formData.append("photographerNotes", data.photographerNotes);

      // Cost tracking based on workflow type
      if (data.workflowType === "shift") {
        if (data.shootCost) formData.append("shootCost", data.shootCost);
        if (data.travelCost) formData.append("travelCost", data.travelCost);
        if (data.shootCostStatus) formData.append("shootCostStatus", data.shootCostStatus);
        if (data.travelCostStatus) formData.append("travelCostStatus", data.travelCostStatus);
      } else if (data.workflowType === "project") {
        if (data.overallCost) formData.append("overallCost", data.overallCost);
        if (data.overallCostStatus) formData.append("overallCostStatus", data.overallCostStatus);
      }

      // DOP and Executors
      if (data.dopId) formData.append("dopId", data.dopId);
      if (data.executorIds) {
        data.executorIds.forEach((id) => {
          formData.append("executorIds", id);
        });
      }

      // Edit IDs
      if (data.editIds) {
        data.editIds.forEach((id) => {
          formData.append("editIds", id);
        });
      }

      const result = await createShoot(formData);

      if (result.success) {
        toast.success("Shoot created successfully!");
        router.push("/dashboard/shoots");
      } else {
        toast.error(result.error ?? "Failed to create shoot");
        setError(result.error ?? "Failed to create shoot");
      }
    } catch (error) {
      console.error("Error creating shoot:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative space-y-6 overflow-y-auto">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/shoots">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Shoot</h1>
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
                  <CardDescription>Essential details about the shoot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    name="entityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entity</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!selectedClientId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  !selectedClientId
                                    ? "Select a client first"
                                    : entities.length === 0
                                      ? "No entities found for this client"
                                      : "Select an entity"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {entities.length === 0 && selectedClientId ? (
                              <div className="text-muted-foreground px-2 py-1 text-sm">
                                No entities found. Add entities for this client first.
                              </div>
                            ) : (
                              entities.map((entity) => (
                                <SelectItem key={entity.id} value={entity.id}>
                                  {entity.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {!selectedClientId && (
                          <p className="text-muted-foreground text-xs">
                            Please select a client to see available entities
                          </p>
                        )}
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
                          value={field.value}
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
                                No locations found. Add locations for this client first.
                              </div>
                            ) : (
                              locations.map((location) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name}
                                  {location.address && (
                                    <span className="text-muted-foreground text-xs">
                                      {" "}
                                      ({location.address})
                                    </span>
                                  )}
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

                  {/* Display Location POCs (Read-only) */}
                  {locationPOCs.length > 0 && (
                    <div className="rounded-md border p-3 bg-muted/50">
                      <label className="text-sm font-medium mb-2 block">
                        Location Points of Contact
                      </label>
                      <div className="space-y-2">
                        {locationPOCs.map((poc) => (
                          <div
                            key={poc.id}
                            className="text-sm p-2 bg-background rounded border"
                          >
                            <p className="font-medium">{poc.name}</p>
                            {poc.role && (
                              <p className="text-muted-foreground text-xs">{poc.role}</p>
                            )}
                            <p className="text-muted-foreground text-xs">
                              📞 {poc.phone}
                              {poc.email && ` • ✉ ${poc.email}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="shootTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shoot Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    name="shootId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shoot ID *</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="Enter Shoot ID (e.g., RE-2024-001)"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              const shootTypeId = form.getValues("shootTypeId");
                              if (!shootTypeId) {
                                toast.error("Please select a shoot type first");
                                return;
                              }
                              try {
                                const result = await generateShootIdAction(shootTypeId);
                                if (result.success && result.shootId) {
                                  form.setValue("shootId", result.shootId);
                                  toast.success("Shoot ID generated successfully!");
                                } else {
                                  toast.error(
                                    result.error ?? "Failed to generate Shoot ID"
                                  );
                                }
                              } catch (error) {
                                console.error("Error generating Shoot ID:", error);
                                toast.error("Failed to generate Shoot ID");
                              }
                            }}
                          >
                            Generate
                          </Button>
                        </div>
                        <FormDescription>
                          Enter a unique Shoot ID or click Generate to auto-create one
                        </FormDescription>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Select onValueChange={field.onChange} value={field.value}>
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
                  <CardDescription>Timing and deliverable information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="scheduledShootDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Shoot Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Single date for this shoot (unique at date level)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reportingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Reporting Time
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Enter the reporting/start time for the shoot</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>When the shoot starts</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wrapUpTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Wrap-up Time
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Enter the wrap-up time for the shoot (auto-fills with +8
                                  hours from reporting time)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>
                          When the shoot ends (default: 8 hours after start)
                        </FormDescription>
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

                  <FormField
                    control={form.control}
                    name="editIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Link Edit IDs</FormLabel>
                          <FormDescription>
                            Select existing edits to link to this shoot
                          </FormDescription>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {edits
                            .filter((edit) => !edit.shootId) // Only show independent edits
                            .map((edit) => (
                              <FormField
                                key={edit.id}
                                control={form.control}
                                name="editIds"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={edit.id}
                                      className="flex flex-row items-start space-y-0 space-x-3"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(edit.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...(field.value ?? []),
                                                  edit.id,
                                                ])
                                              : field.onChange(
                                                  (field.value ?? []).filter(
                                                    (value) => value !== edit.id
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {edit.editId}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          {edits.filter((edit) => !edit.shootId).length === 0 && (
                            <p className="text-muted-foreground text-sm">
                              No independent edits available. Create edits first or link
                              them later.
                            </p>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Team Assignment Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Director of Photography (DOP)</CardTitle>
                  <CardDescription>
                    Main photographer and point of contact for the shoot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="dopId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DOP *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select DOP" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teamMembers
                              .filter((member) => member.roles.includes("photographer"))
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
                          Single photographer who is the main POC
                        </FormDescription>
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
                  <CardTitle>Executors</CardTitle>
                  <CardDescription>
                    People who actually completed/will complete the shoot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="executorIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Select Executors</FormLabel>
                          <FormDescription>
                            Multiple team members who will execute the shoot
                          </FormDescription>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {teamMembers
                            .filter((member) =>
                              member.roles.some((role) =>
                                ["photographer", "editor"].includes(role)
                              )
                            )
                            .map((member) => (
                              <FormField
                                key={member.id}
                                control={form.control}
                                name="executorIds"
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
                                                    (value) => value !== member.id
                                                  )
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
                        </div>
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
                  {selectedWorkflowType === "shift"
                    ? "Track shoot cost (shift + travel) separately"
                    : selectedWorkflowType === "project"
                      ? "Track overall project cost (no bifurcation)"
                      : "Track costs for this shoot"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedWorkflowType === "shift" && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="shootCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shoot Cost (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Cost for the shift/day</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shootCostStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shoot Cost Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                <SelectItem value="onhold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="travelCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Travel Cost (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Travel and transportation cost
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="travelCostStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Travel Cost Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                <SelectItem value="onhold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="bg-muted rounded-md p-3">
                      <p className="text-sm">
                        <strong>Total Shoot Cost:</strong> ₹
                        {(
                          (parseFloat(form.watch("shootCost") ?? "0") ?? 0) +
                          (parseFloat(form.watch("travelCost") ?? "0") ?? 0)
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </>
                )}

                {selectedWorkflowType === "project" && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="overallCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overall Project Cost (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Total lump-sum cost (includes shoot and edit)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="overallCostStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overall Cost Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                <SelectItem value="onhold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {selectedWorkflowType === "cluster" && (
                  <div className="bg-muted rounded-md p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Cost tracking for cluster shoots is managed at the cluster level
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

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
