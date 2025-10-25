"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSite } from "@/server/actions/client-actions";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const updateSiteSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  address: z.string().optional(),
});

type UpdateSiteFormData = z.infer<typeof updateSiteSchema>;

export default function EditSitePage() {
  const params = useParams();
  const id = params.id as string;
  const entityId = params.entityId as string;
  const siteId = params.siteId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<UpdateSiteFormData>({
    resolver: zodResolver(updateSiteSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  });

  const onSubmit = async (data: UpdateSiteFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("address", data.address ?? "");

      await updateSite(siteId, formData);
      toast.success("Site updated successfully!");
      router.push(`/dashboard/clients/${id}/entities/${entityId}/sites/${siteId}`);
    } catch (error) {
      console.error("Error updating site:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update site";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/${siteId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Site</h1>
          <p className="text-muted-foreground">
            Update site information
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
              <CardTitle>Site Information</CardTitle>
              <CardDescription>
                Update the site details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Main Office, Warehouse, Branch Office" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123 Main Street, City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/${siteId}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Site"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
