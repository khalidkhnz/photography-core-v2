"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEdit, getEditById } from "@/server/actions/edit-actions";
import { getShoots } from "@/server/actions/shoot-actions";
import { getTeamMembers } from "@/server/actions/user-actions";
import { getClusters } from "@/server/actions/cluster-actions";
import {
  updateEditSchema,
  type UpdateEditFormData,
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

interface Shoot {
  id: string;
  shootId: string;
  client: {
    name: string;
  };
}

interface TeamMember {
  id: string;
  name: string | null;
  email?: string | null;
  roles: string[];
  specialties: string[];
  isActive: boolean;
}

interface Cluster {
  id: string;
  name: string;
  description?: string | null;
}


export default function EditEditPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shoots, setShoots] = useState<Shoot[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editId] = useState<string>(id as string ?? "");
  const router = useRouter();

  const form = useForm<UpdateEditFormData>({
    resolver: zodResolver(updateEditSchema),
    defaultValues: {
      editId: "",
      shootId: "",
      clusterId: "",
      deliverables: "",
      editDeliveryDate: "",
      editorNotes: "",
      editCost: "",
      editCostStatus: undefined,
      editorIds: [],
    },
  });


  // Fetch data on component mount
  useEffect(() => {
    if (!editId) return;

    async function fetchData() {
      try {
        const [editData, shootsData, clustersData, teamMembersData] = await Promise.all([
          getEditById(editId),
          getShoots(),
          getClusters(),
          getTeamMembers(["editor"]),
        ]);

        if (!editData) {
          toast.error("Edit not found");
          router.push("/dashboard/edits");
          return;
        }

        // Set form values
        form.reset({
          editId: editData.editId,
          shootId: editData.shootId ?? "",
          clusterId: editData.clusterId ?? "",
          deliverables: editData.deliverables ?? "",
          editDeliveryDate: editData.editDeliveryDate
            ? new Date(editData.editDeliveryDate).toISOString().split("T")[0]
            : "",
          editorNotes: editData.editorNotes ?? "",
          editCost: editData.editCost ? editData.editCost.toString() : "",
          editCostStatus: editData.editCostStatus as "paid" | "unpaid" | "onhold" | undefined,
          editorIds: editData.editors.map((e) => e.user.id),
        });

        setShoots(shootsData);
        setClusters(clustersData);
        setTeamMembers(teamMembersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load form data");
        toast.error("Failed to load edit data");
      } finally {
        setDataLoading(false);
      }
    }

    void fetchData();
  }, [editId, router, form]);

  const onSubmit = async (data: UpdateEditFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Validate editId before submission
      if (!data.editId || data.editId.trim() === "") {
        toast.error("Edit ID is required");
        setIsLoading(false);
        return;
      }

      // Convert the form data to FormData for the server action
      const formData = new FormData();
      formData.append("editId", data.editId.trim());
      if (data.shootId) formData.append("shootId", data.shootId);
      if (data.clusterId) formData.append("clusterId", data.clusterId);
      if (data.deliverables) formData.append("deliverables", data.deliverables);
      if (data.editDeliveryDate) formData.append("editDeliveryDate", data.editDeliveryDate);
      if (data.editorNotes) formData.append("editorNotes", data.editorNotes);
      if (data.editCost) formData.append("editCost", data.editCost);
      if (data.editCostStatus) formData.append("editCostStatus", data.editCostStatus);

      // Add editor IDs
      if (data.editorIds) {
        data.editorIds.forEach((id) => {
          formData.append("editorIds", id);
        });
      }

      await updateEdit(editId, formData);
      toast.success("Edit updated successfully!");
      router.push(`/dashboard/edits/${editId}`);
    } catch (error) {
      console.error("Error updating edit:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
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
          <Link href={`/dashboard/edits/${id as string}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Edit Project</h1>
          <p className="text-muted-foreground">
            Update the details of this edit project
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
                    Essential details about the edit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="editId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edit ID *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Edit ID"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Unique identifier for this edit project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shootId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked Shoot (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            // Convert "none" to empty string for form state
                            field.onChange(value === "none" ? "" : value);
                          }}
                          value={field.value ?? "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a shoot to link (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No shoot (Independent edit)</SelectItem>
                            {shoots.map((shoot) => (
                              <SelectItem key={shoot.id} value={shoot.id}>
                                {shoot.shootId} - {shoot.client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Link this edit to a shoot, or leave blank for independent edits
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clusterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Linked Cluster (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            // Convert "none" to empty string for form state
                            field.onChange(value === "none" ? "" : value);
                          }}
                          value={field.value ?? "none"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a cluster to link (optional)" />
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
                          Link this edit to a cluster for grouped tracking
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliverables"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deliverables</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the deliverables for this edit..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          List all assets and deliverables for this edit project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="editDeliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edit Delivery Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          When should the edited assets be delivered?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team & Cost</CardTitle>
                  <CardDescription>
                    Assign editors and track costs
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
                            Select the editors for this edit project
                          </FormDescription>
                        </div>
                        <div className="space-y-2">
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

                  <FormField
                    control={form.control}
                    name="editCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Edit Cost (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Total cost for this edit in Indian Rupees
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="editCostStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="onhold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Current payment status for this edit
                        </FormDescription>
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
                            placeholder="Any special instructions or notes for the editing team..."
                            rows={4}
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
                <Link href={`/dashboard/edits/${id as string}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Edit"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}

