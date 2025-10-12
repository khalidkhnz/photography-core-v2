"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateCluster,
  getClusterById,
} from "@/server/actions/cluster-actions";
import { getClients } from "@/server/actions/client-actions";
import {
  updateClusterSchema,
  type UpdateClusterFormData,
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

interface Client {
  id: string;
  name: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditClusterPage({ params }: PageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [clusterId, setClusterId] = useState<string>("");
  const router = useRouter();

  const form = useForm<UpdateClusterFormData>({
    resolver: zodResolver(updateClusterSchema),
    defaultValues: {
      name: "",
      description: "",
      clientId: "",
      totalCost: "",
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const { id } = await params;
        setClusterId(id);

        const [clusterData, clientsData] = await Promise.all([
          getClusterById(id),
          getClients(),
        ]);

        if (!clusterData) {
          setError("Cluster not found");
          return;
        }

        setClients(clientsData);

        // Set form values
        form.setValue("name", clusterData.name);
        form.setValue("description", clusterData.description ?? "");
        form.setValue("clientId", clusterData.clientId ?? "");
        form.setValue("totalCost", clusterData.totalCost?.toString() ?? "");
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load cluster data");
      } finally {
        setDataLoading(false);
      }
    }

    void fetchData();
  }, [params, form]);

  const onSubmit = async (data: UpdateClusterFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.clientId) formData.append("clientId", data.clientId);
      if (data.totalCost) formData.append("totalCost", data.totalCost);

      await updateCluster(clusterId, formData);
      void router.push(`/dashboard/clusters/${clusterId}`);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update cluster",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/clusters/${clusterId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Cluster</h1>
          <p className="text-muted-foreground">
            Update cluster information and settings
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

          <Card>
            <CardHeader>
              <CardTitle>Cluster Information</CardTitle>
              <CardDescription>
                Update cluster details and cost tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cluster Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., ATS Q1 2024 Construction Updates"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe this cluster and its purpose..."
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
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Client</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.length === 0 ? (
                          <div className="text-muted-foreground px-2 py-1 text-sm">
                            No clients available. Create one first.
                          </div>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Main client for this cluster (optional - leave blank if
                      not applicable)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Cluster Cost ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Total cost for all shoots in this cluster
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/dashboard/clusters/${clusterId}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Cluster"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
