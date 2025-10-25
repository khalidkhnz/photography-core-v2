"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPOC } from "@/server/actions/client-actions";
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

const createPOCSchema = z.object({
  name: z.string().min(1, "POC name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  role: z.string().optional(),
});

type CreatePOCFormData = z.infer<typeof createPOCSchema>;

export default function CreatePOCPage() {
  const params = useParams();
  const id = params.id as string;
  const entityId = params.entityId as string;
  const siteId = params.siteId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<CreatePOCFormData>({
    resolver: zodResolver(createPOCSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
    },
  });

  const onSubmit = async (data: CreatePOCFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.email) formData.append("email", data.email);
      formData.append("phone", data.phone);
      if (data.role) formData.append("role", data.role);
      formData.append("siteId", siteId);

      await createPOC(formData);
      toast.success("POC created successfully!");
      router.push(`/dashboard/clients/${id}/entities/${entityId}/sites/${siteId}`);
    } catch (error) {
      console.error("Error creating POC:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create POC";
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
          <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/${siteId}/pocs`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New POC</h1>
          <p className="text-muted-foreground">
            Create a new point of contact for this site
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
              <CardTitle>POC Information</CardTitle>
              <CardDescription>
                Enter the contact details for this point of contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>POC Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., +1-555-0123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g., john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role/Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Site Manager, Project Lead" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/clients/${id}/entities/${entityId}/sites/${siteId}/pocs`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create POC"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
