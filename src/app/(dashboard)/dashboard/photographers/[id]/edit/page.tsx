"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getPhotographerById,
  updatePhotographer,
} from "@/server/actions/photographer-actions";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const updatePhotographerSchema = z.object({
  name: z.string().min(1, "Photographer name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  specialties: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).default(0),
  isActive: z.boolean().default(true),
});

type UpdatePhotographerFormData = z.infer<typeof updatePhotographerSchema>;

export default function EditPhotographerPage({
  params,
}: {
  params: { id: string };
}) {
  const photographerId = params.id;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  const form = useForm<UpdatePhotographerFormData>({
    resolver: zodResolver(updatePhotographerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialties: [],
      rating: 0,
      isActive: true,
    },
  });

  // Fetch photographer data and populate form
  useEffect(() => {
    async function fetchPhotographer() {
      try {
        const photographer = await getPhotographerById(photographerId);

        if (!photographer) {
          notFound();
        }

        // Populate form with existing data
        form.setValue("name", photographer.name);
        form.setValue("email", photographer.email || "");
        form.setValue("phone", photographer.phone || "");
        form.setValue("specialties", photographer.specialties || []);
        form.setValue("rating", photographer.rating || 0);
        form.setValue("isActive", photographer.isActive);

        setSpecialties(photographer.specialties || []);
      } catch (error) {
        console.error("Error fetching photographer:", error);
        setError("Failed to load photographer data");
      } finally {
        setDataLoading(false);
      }
    }

    void fetchPhotographer();
  }, [photographerId, form]);

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

  const onSubmit = async (data: UpdatePhotographerFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.email) formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      formData.append("specialties", JSON.stringify(data.specialties));
      formData.append("rating", data.rating.toString());
      formData.append("isActive", data.isActive.toString());

      const result = await updatePhotographer(photographerId, formData);

      if (result.success) {
        void router.push("/dashboard/photographers");
      } else {
        setError(result.error || "Failed to update photographer");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update photographer",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <p className="text-muted-foreground">Loading photographer data...</p>
      </div>
    );
  }

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
            Edit Photographer
          </h1>
          <p className="text-muted-foreground">
            Update photographer information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photographer Information</CardTitle>
          <CardDescription>
            Update the photographer's details and specialties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photographer Name *</FormLabel>
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
                      <Input placeholder="e.g., +1 (555) 123-4567" {...field} />
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
                  <Button type="button" onClick={addSpecialty}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty, index) => (
                    <div
                      key={index}
                      className="bg-secondary flex items-center space-x-1 rounded-md px-2 py-1 text-sm"
                    >
                      <span>{specialty}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <FormDescription>
                  Add specialties that this photographer excels in
                </FormDescription>
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
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Check if this photographer is currently active
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/photographers">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Photographer"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
