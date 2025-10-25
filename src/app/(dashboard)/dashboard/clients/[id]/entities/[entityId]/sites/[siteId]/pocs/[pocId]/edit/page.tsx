"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePOC } from "@/server/actions/client-actions";
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

const updatePOCSchema = z.object({
  name: z.string().min(1, "POC name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  role: z.string().optional(),
});

type UpdatePOCFormData = z.infer<typeof updatePOCSchema>;

export default function EditPOCPage() {
  const params = useParams();
  const id = params.id as string;
  const entityId = params.entityId as string;
  const siteId = params.siteId as string;
  const pocId = params.pocId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<UpdatePOCFormData>({
    resolver: zodResolver(updatePOCSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
    },
  });

  const onSubmit = async (data: UpdatePOCFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email ?? "");
      formData.append("phone", data.phone);
      formData.append("role", data.role ?? "");

      await updatePOC(pocId, formData);
      toast.success("POC updated successfully!");
      router.push(`/dashboard/clients/${id}/entities/${entityId}/sites/${siteId}`);
    } catch (error) {
      console.error("Error updating POC:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update POC";
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
          <h1 className="text-3xl font-bold tracking-tight">Edit POC</h1>
          <p className="text-muted-foreground">
            Update point of contact information
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
                Update the point of contact details
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
                      <Input placeholder="e.g., John Doe" {...field} />
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
                      <Input type="email" placeholder="john@example.com" {...field} />
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
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
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
                      <Input placeholder="e.g., Project Manager, Site Supervisor" {...field} />
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
              {isLoading ? "Updating..." : "Update POC"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
