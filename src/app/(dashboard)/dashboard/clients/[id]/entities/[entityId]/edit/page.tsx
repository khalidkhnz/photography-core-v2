"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateEntity, getEntityById } from "@/server/actions/client-actions";
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

const updateEntitySchema = z.object({
  name: z.string().min(1, "Entity name is required"),
});

type UpdateEntityFormData = z.infer<typeof updateEntitySchema>;

export default function EditEntityPage() {
  const params = useParams();
  const id = params.id as string;
  const entityId = params.entityId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<UpdateEntityFormData>({
    resolver: zodResolver(updateEntitySchema),
    defaultValues: {
      name: "",
    },
  });

  // Load existing entity data
  useEffect(() => {
    async function fetchEntity() {
      try {
        const entity = await getEntityById(entityId);
        if (!entity) {
          toast.error("Entity not found");
          router.push(`/dashboard/clients/${id}?tab=entities`);
          return;
        }
        form.reset({
          name: entity.name,
        });
      } catch (error) {
        console.error("Error fetching entity:", error);
        toast.error("Failed to load entity data");
        setError("Failed to load entity data");
      } finally {
        setDataLoading(false);
      }
    }
    void fetchEntity();
  }, [entityId, id, router, form]);

  const onSubmit = async (data: UpdateEntityFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);

      await updateEntity(entityId, formData);
      toast.success("Entity updated successfully!");
      router.push(`/dashboard/clients/${id}/entities/${entityId}`);
    } catch (error) {
      console.error("Error updating entity:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update entity";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading entity data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/clients/${id}/entities/${entityId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Entity</h1>
          <p className="text-muted-foreground">
            Update entity information
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
              <CardTitle>Entity Information</CardTitle>
              <CardDescription>
                Update the entity details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ATS Construction Ltd" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/clients/${String(params.id)}/entities/${String(params.entityId)}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Entity"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
