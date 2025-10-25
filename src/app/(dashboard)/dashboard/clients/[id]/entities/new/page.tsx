"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEntity } from "@/server/actions/client-actions";
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

const createEntitySchema = z.object({
  name: z.string().min(1, "Entity name is required"),
});

type CreateEntityFormData = z.infer<typeof createEntitySchema>;

export default function CreateEntityPage() {
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<CreateEntityFormData>({
    resolver: zodResolver(createEntitySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: CreateEntityFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("clientId", id);

      await createEntity(formData);
      toast.success("Entity created successfully!");
      router.push(`/dashboard/clients/${id}?tab=entities`);
    } catch (error) {
      console.error("Error creating entity:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create entity";
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
          <Link href={`/dashboard/clients/${id}?tab=entities`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Entity</h1>
          <p className="text-muted-foreground">
            Create a new billing entity for this client
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
                Enter the billing entity name for this client
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
              <Link href={`/dashboard/clients/${id}?tab=entities`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Entity"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
