"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateClient } from "@/server/actions/client-actions";
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

const updateClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  pocName: z.string().optional(),
  pocEmail: z.string().email().optional().or(z.literal("")),
  pocPhone: z.string().optional(),
});

type UpdateClientFormData = z.infer<typeof updateClientSchema>;

export default function EditClientPage() {
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<UpdateClientFormData>({
    resolver: zodResolver(updateClientSchema),
    defaultValues: {
      name: "",
      address: "",
      pocName: "",
      pocEmail: "",
      pocPhone: "",
    },
  });

  const onSubmit = async (data: UpdateClientFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("address", data?.address ?? "");
      formData.append("pocName", data?.pocName ?? "");
      formData.append("pocEmail", data?.pocEmail ?? "");
      formData.append("pocPhone", data?.pocPhone ?? "");

      await updateClient(id, formData);
      toast.success("Client updated successfully!");
      router.push(`/dashboard/clients/${id}`);
    } catch (error) {
      console.error("Error updating client:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update client";
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
          <Link href={`/dashboard/clients/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Client</h1>
          <p className="text-muted-foreground">
            Update client information
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
              <CardTitle>Client Information</CardTitle>
              <CardDescription>
                Update the client details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ATS HomeKraft" {...field} />
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
                      <Input placeholder="123 Main Street, Mumbai, Maharashtra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Main Point of Contact (Client Side)</CardTitle>
              <CardDescription>
                Primary contact person from the client&apos;s organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pocName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>POC Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Rajesh Kumar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pocEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>POC Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., rajesh@atshomekraft.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pocPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>POC Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., +91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/clients/${id}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Client"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}