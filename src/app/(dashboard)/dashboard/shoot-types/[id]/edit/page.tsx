"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getShootTypeById,
  updateShootType,
} from "@/server/actions/shoot-type-actions";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { notFound } from "next/navigation";

const updateShootTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(10, "Code must be 10 characters or less"),
  description: z.string().optional(),
});

type UpdateShootTypeFormData = z.infer<typeof updateShootTypeSchema>;

export default function EditShootTypePage({
  params,
}: {
  params: { id: string };
}) {
  const shootTypeId = params.id;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  const form = useForm<UpdateShootTypeFormData>({
    resolver: zodResolver(updateShootTypeSchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  // Fetch shoot type data and populate form
  useEffect(() => {
    async function fetchShootType() {
      try {
        const shootType = await getShootTypeById(shootTypeId);

        if (!shootType) {
          notFound();
        }

        // Populate form with existing data
        form.setValue("name", shootType.name);
        form.setValue("code", shootType.code);
        form.setValue("description", shootType.description || "");
      } catch (error) {
        console.error("Error fetching shoot type:", error);
        setError("Failed to load shoot type data");
      } finally {
        setDataLoading(false);
      }
    }

    void fetchShootType();
  }, [shootTypeId, form]);

  const onSubmit = async (data: UpdateShootTypeFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("code", data.code.toUpperCase());
      if (data.description) formData.append("description", data.description);

      await updateShootType(shootTypeId, formData);
      void router.push("/dashboard/shoot-types");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update shoot type",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <p className="text-muted-foreground">Loading shoot type data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/shoot-types">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Shoot Type</h1>
          <p className="text-muted-foreground">
            Update the details of this shoot type
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
              <CardTitle>Shoot Type Information</CardTitle>
              <CardDescription>
                Update the basic details for this shoot type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Real Estate Photography"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., RE"
                        maxLength={10}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <p className="text-muted-foreground text-sm">
                      Short code used to generate shoot IDs (max 10 characters,
                      will be converted to uppercase)
                    </p>
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
                        placeholder="Describe this type of shoot..."
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
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/shoot-types">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Shoot Type"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
