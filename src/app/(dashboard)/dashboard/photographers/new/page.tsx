"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPhotographer } from "@/server/actions/photographer-actions";
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

const createPhotographerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).default(0),
  isActive: z.boolean().default(true),
});

type CreatePhotographerFormData = z.infer<typeof createPhotographerSchema>;

export default function CreatePhotographerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const router = useRouter();

  const form = useForm<CreatePhotographerFormData>({
    resolver: zodResolver(createPhotographerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialties: [],
      rating: 0,
      isActive: true,
    },
  });

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      const updatedSpecialties = [...specialties, newSpecialty.trim()];
      setSpecialties(updatedSpecialties);
      form.setValue("specialties", updatedSpecialties);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialtyToRemove: string) => {
    const updatedSpecialties = specialties.filter(
      (s) => s !== specialtyToRemove,
    );
    setSpecialties(updatedSpecialties);
    form.setValue("specialties", updatedSpecialties);
  };

  const onSubmit = async (data: CreatePhotographerFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Convert the form data to FormData for the server action
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.email) formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      formData.append("specialties", JSON.stringify(data.specialties || []));
      formData.append("rating", data.rating.toString());
      formData.append("isActive", data.isActive.toString());

      await createPhotographer(formData);
      void router.push("/dashboard/photographers");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create photographer",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/photographers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Add New Photographer
          </h1>
          <p className="text-muted-foreground">
            Create a new photographer profile for your team
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
              <CardTitle>Photographer Information</CardTitle>
              <CardDescription>
                Basic details about the photographer
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
                      <Input placeholder="e.g., Alice Johnson" {...field} />
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
                        placeholder="e.g., alice@photography.com"
                        {...field}
                      />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., +1-555-0201" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Specialties</FormLabel>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a specialty..."
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSpecialty();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addSpecialty}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {specialties.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {specialties.map((specialty, index) => (
                      <div
                        key={index}
                        className="bg-secondary flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                      >
                        <span>{specialty}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecialty(specialty)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (0-5)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="0.0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-y-0 space-x-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="border-input rounded border"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Photographer</FormLabel>
                      <p className="text-muted-foreground text-sm">
                        Whether this photographer is currently available for
                        shoots
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/photographers">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Photographer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
