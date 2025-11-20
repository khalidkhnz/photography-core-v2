"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateShoot, getShootById } from "@/server/actions/shoot-actions";
import { getClients, getEntitiesByClientForShoot } from "@/server/actions/client-actions";
import { getShootTypes } from "@/server/actions/shoot-type-actions";
import { getLocationsByClient, getPOCsByLocation } from "@/server/actions/location-actions";
import { getEdits } from "@/server/actions/edit-actions";
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

export default function EditShootPage() {
  const { id } = useParams();
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
  const [shootId] = useState<string>(id as string ?? "");
  const router = useRouter();

  const form = useForm<UpdateShootFormData>({
    resolver: zodResolver(updateShootSchema),
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
      clusterCostOverride: "",
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
          shootData,
          clientsData,
          shootTypesData,
          clustersData,
          editsData,
          teamMembersData,
        ] = await Promise.all([
          getShootById(shootId),
          getClients(),
          getShootTypes(),
          getClusters(),
          getEdits(),
          getTeamMembers(["photographer", "videographer"]),
        ]);

        if (!shootData) {
          toast.error("Shoot not found");
          router.push("/dashboard/shoots");
          return;
        }

        setClients(clientsData);
        setShootTypes(shootTypesData);
        setClusters(clustersData);
        setEdits(editsData);
        setTeamMembers(teamMembersData);

        // Set form values from shoot data
        form.reset({
          shootId: shootData.shootId,
          clientId: shootData.clientId,
          entityId: shootData.entityId ?? "",
          shootTypeId: shootData.shootTypeId,
          locationId: shootData.locationId ?? "",
          clusterId: shootData.clusterId ?? "",
          projectName: shootData.projectName ?? "",
          remarks: shootData.remarks ?? "",
          overallDeliverables: shootData.overallDeliverables ?? "",
          scheduledShootDate: shootData.scheduledShootDate
            ? new Date(shootData.scheduledShootDate).toISOString().split("T")[0]
            : "",
          reportingTime: shootData.reportingTime ?? "",
          wrapUpTime: shootData.wrapUpTime ?? "",
          photographerNotes: shootData.photographerNotes ?? "",
          workflowType: (shootData.workflowType as "shift" | "project" | "cluster") ?? "shift",
          shootCost: shootData.shootCost ? shootData.shootCost.toString() : "",
          travelCost: shootData.travelCost ? shootData.travelCost.toString() : "",
          shootCostStatus: shootData.shootCostStatus as "paid" | "unpaid" | "onhold" | undefined,
          travelCostStatus: shootData.travelCostStatus as "paid" | "unpaid" | "onhold" | undefined,
          overallCost: shootData.overallCost ? shootData.overallCost.toString() : "",
          overallCostStatus: shootData.overallCostStatus as "paid" | "unpaid" | "onhold" | undefined,
          clusterCostOverride: (() => {
            const extendedShoot = shootData as typeof shootData & { clusterCostOverride?: number | null };
            return extendedShoot.clusterCostOverride ? extendedShoot.clusterCostOverride.toString() : "";
          })(),
          dopId: shootData.dopId ?? "",
          executorIds: shootData.executors?.map((e) => e.user.id) ?? [],
          editIds: shootData.edits?.map((e) => e.id) ?? [],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load form data");
        toast.error("Failed to load shoot data");
      } finally {
        setDataLoading(false);
      }
    }

    void fetchData();
  }, [shootId, form, router]);

  // Fetch entities when client changes
  useEffect(() => {
    if (selectedClientId) {
      async function fetchEntities() {
        try {
          const entitiesData = await getEntitiesByClientForShoot(selectedClientId);
          setEntities(entitiesData);
        } catch (error) {
          console.error("Error fetching entities:", error);
        }
      }
      void fetchEntities();
    } else {
      setEntities([]);
      form.setValue("entityId", "");
    }
  }, [selectedClientId, form]);

  // Fetch locations when client changes
  useEffect(() => {
    if (selectedClientId) {
      async function fetchLocations() {
        try {
          const locationsData = await getLocationsByClient(selectedClientId);
          setLocations(locationsData);
        } catch (error) {
          console.error("Error fetching locations:", error);
        }
      }
      void fetchLocations();
    } else {
      setLocations([]);
      setLocationPOCs([]);
      form.setValue("locationId", "");
    }
  }, [selectedClientId, form]);

  // Fetch POCs when location changes
  useEffect(() => {
    if (selectedLocationId && selectedLocationId !== "") {
      const locationId = selectedLocationId; // Type narrowing
      async function fetchPOCs() {
        try {
          const pocsData = await getPOCsByLocation(locationId);
          setLocationPOCs(pocsData);
        } catch (error) {
          console.error("Error fetching POCs:", error);
        }
      }
      void fetchPOCs();
    } else {
      setLocationPOCs([]);
    }
  }, [selectedLocationId]);

  // Auto-calculate wrap-up time (8 hours after reporting)
  useEffect(() => {
    if (selectedReportingTime) {
      const timeParts = selectedReportingTime.split(":");
      const hours = parseInt(timeParts[0] ?? "0", 10);
      const minutes = parseInt(timeParts[1] ?? "0", 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const wrapHours = (hours + 8) % 24;
        const wrapTime = `${String(wrapHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        form.setValue("wrapUpTime", wrapTime);
      }
    }
  }, [selectedReportingTime, form]);

  const onSubmit = async (data: UpdateShootFormData) => {
    console.log("Form submitted with data:", data);
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
      if (data.workflowType === "project") {
        if (data.overallCost) formData.append("overallCost", data.overallCost);
        if (data.overallCostStatus) formData.append("overallCostStatus", data.overallCostStatus);
      } else if (data.workflowType === "cluster") {
        if (data.clusterCostOverride) formData.append("clusterCostOverride", data.clusterCostOverride);
      } else {
        if (data.shootCost) formData.append("shootCost", data.shootCost);
        if (data.travelCost) formData.append("travelCost", data.travelCost);
        if (data.shootCostStatus) formData.append("shootCostStatus", data.shootCostStatus);
        if (data.travelCostStatus) formData.append("travelCostStatus", data.travelCostStatus);
      }

      // DOP
      if (data.dopId) formData.append("dopId", data.dopId);

      // Executors
      if (data.executorIds) {
        data.executorIds.forEach((id) => {
          formData.append("executorIds", id);
        });
      }

      // Edit IDs - passing database IDs
      if (data.editIds) {
        data.editIds.forEach((id) => {
          formData.append("editIds", id);
        });
      }

      const result = await updateShoot(shootId, formData);

      if (result.success) {
        toast.success("Shoot updated successfully!");
        router.push(`/dashboard/shoots/${shootId}`);
      } else {
        toast.error(result.error ?? "Failed to update shoot");
        setError(result.error ?? "Failed to update shoot");
      }
    } catch (err) {
      console.error("Error updating shoot:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update shoot";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shoot data...</p>
        </div>
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
            Update shoot details and information
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Form validation errors:", errors);
          
          // Show specific field errors
          const errorMessages = Object.entries(errors)
            .map(([field, error]) => {
              const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return `${fieldName}: ${error?.message ?? 'Invalid value'}`;
            })
            .join('\n');
          
          if (errorMessages) {
            toast.error(`Please fix the following errors:\n${errorMessages}`, {
              duration: 5000,
            });
            setError(`Validation failed: ${Object.keys(errors).join(', ')}`);
          } else {
            toast.error("Please check all required fields");
          }
        })} className="space-y-6">
          {/* Validation Errors Display */}
          {Object.keys(form.formState.errors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="font-semibold mb-2">Please fix the following errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(form.formState.errors).map(([field, error]) => {
                    const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <li key={field}>
                        <strong>{fieldName}:</strong> {error?.message ?? 'This field is invalid'}
                      </li>
                    );
                  })}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core details about the shoot
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
                      <Input placeholder="e.g., RE-2024-001" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

              {entities.length > 0 && (
                <FormField
                  control={form.control}
                  name="entityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                        value={field.value ?? "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an entity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No entity</SelectItem>
                          {entities.map((entity) => (
                            <SelectItem key={entity.id} value={entity.id}>
                              {entity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the billing entity for this shoot
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="shootTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shoot Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

              {locations.length > 0 && (
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                        value={field.value ?? "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No location</SelectItem>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {locationPOCs.length > 0 && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="font-medium mb-2">Location POCs</h4>
                  <div className="space-y-2 text-sm">
                    {locationPOCs.map((poc) => (
                      <div key={poc.id} className="flex items-center justify-between">
                        <span>
                          {poc.name} {poc.role && `(${poc.role})`}
                        </span>
                        <span className="text-muted-foreground">{poc.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="clusterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cluster (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      value={field.value ?? "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a cluster" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No cluster</SelectItem>
                        {clusters.map((cluster) => (
                          <SelectItem key={cluster.id} value={cluster.id}>
                            {cluster.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Link this shoot to a cluster for grouped tracking
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q1 Construction Updates" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>Date and time details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="scheduledShootDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shoot Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="reportingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wrapUpTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wrap-up Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>
                        Auto-calculated: 8 hours after reporting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Workflow & Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow & Cost Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="workflowType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select workflow" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="shift">Shift-based (per day)</SelectItem>
                        <SelectItem value="project">Project-based (lump-sum)</SelectItem>
                        <SelectItem value="cluster">Cluster-based</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedWorkflowType === "project" ? (
                <>
                  <FormField
                    control={form.control}
                    name="overallCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overall Cost (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="e.g., 50000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="overallCostStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
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
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="shootCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shoot Cost (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="e.g., 5000" {...field} />
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
                          <FormLabel>Travel Cost (₹)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="e.g., 500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="shootCostStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shoot Payment Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
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

                    <FormField
                      control={form.control}
                      name="travelCostStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Payment Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? undefined}>
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
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clusterCostOverride"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manual Cost Override (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 15000"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Override the automatic cost calculation. Leave empty to use auto-calculated costs from cluster totals.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="bg-muted rounded-md p-3 text-sm text-muted-foreground">
                    If no override is set, costs will be automatically calculated at the cluster level.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle>Team Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="dopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Director of Photography (DOP)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                      value={field.value ?? "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select DOP" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No DOP</SelectItem>
                        {teamMembers
                          .filter((m) => m.isActive)
                          .map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name ?? member.email}
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
                name="executorIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Executors (Team Members)</FormLabel>
                      <FormDescription>
                        Select team members who will execute the shoot
                      </FormDescription>
                    </div>
                    {teamMembers
                      .filter((m) => m.isActive)
                      .map((member) => (
                        <FormField
                          key={member.id}
                          control={form.control}
                          name="executorIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={member.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(member.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value ?? []), member.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== member.id)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {member.name ?? member.email}
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
            </CardContent>
          </Card>

          {/* Linked Edits */}
          <Card>
            <CardHeader>
              <CardTitle>Linked Edits</CardTitle>
              <CardDescription>
                Link existing edits to this shoot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="editIds"
                render={() => (
                  <FormItem>
                    {edits.filter((e) => !e.shootId || e.shootId === shootId).length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No available edits to link. Edits must be unlinked or already linked to this shoot.
                      </p>
                    ) : (
                      <>
                        <div className="mb-4">
                          <FormLabel>Available Edits</FormLabel>
                          <FormDescription>
                            Select edits to link to this shoot
                          </FormDescription>
                        </div>
                        {edits
                          .filter((e) => !e.shootId || e.shootId === shootId)
                          .map((edit) => (
                            <FormField
                              key={edit.id}
                              control={form.control}
                              name="editIds"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={edit.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(edit.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value ?? []), edit.id])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== edit.id)
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
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="overallDeliverables"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Deliverables</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the expected deliverables..."
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
                name="photographerNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photographer Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special notes or requirements..."
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
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="General remarks about the shoot..."
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

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/shoots/${shootId}`)}
            >
              Cancel
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

