"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getLocationById,
  getPOCsByLocation,
  createLocationPOC,
  updateLocationPOC,
  deleteLocationPOC,
} from "@/server/actions/location-actions";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const pocSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  role: z.string().optional(),
});

type POCFormData = z.infer<typeof pocSchema>;

interface LocationPOC {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  role?: string | null;
}

interface Location {
  id: string;
  name: string;
  address?: string | null;
}

export default function ManageLocationPOCsPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.id as string;

  const [location, setLocation] = useState<Location | null>(null);
  const [pocs, setPocs] = useState<LocationPOC[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPOC, setEditingPOC] = useState<LocationPOC | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pocToDelete, setPocToDelete] = useState<LocationPOC | null>(null);
  const [error, setError] = useState("");

  const form = useForm<POCFormData>({
    resolver: zodResolver(pocSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
    },
  });

  const fetchData = useCallback(async () => {
    try {
      const [locationData, pocsData] = await Promise.all([
        getLocationById(locationId),
        getPOCsByLocation(locationId),
      ]);
      setLocation(locationData);
      setPocs(pocsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load location data");
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleOpenDialog = (poc?: LocationPOC) => {
    if (poc) {
      setEditingPOC(poc);
      form.reset({
        name: poc.name,
        email: poc.email ?? "",
        phone: poc.phone,
        role: poc.role ?? "",
      });
    } else {
      setEditingPOC(null);
      form.reset({
        name: "",
        email: "",
        phone: "",
        role: "",
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = async (data: POCFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.email) formData.append("email", data.email);
      formData.append("phone", data.phone);
      if (data.role) formData.append("role", data.role);
      formData.append("locationId", locationId);

      if (editingPOC) {
        await updateLocationPOC(editingPOC.id, formData);
        toast.success("POC updated successfully!");
      } else {
        await createLocationPOC(formData);
        toast.success("POC added successfully!");
      }

      setDialogOpen(false);
      await fetchData();
      router.refresh();
    } catch (error) {
      console.error("Error saving POC:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save POC");
    }
  };

  const handleDelete = async () => {
    if (!pocToDelete) return;

    try {
      await deleteLocationPOC(pocToDelete.id);
      toast.success("POC deleted successfully!");
      setDeleteDialogOpen(false);
      setPocToDelete(null);
      await fetchData();
      router.refresh();
    } catch (error) {
      console.error("Error deleting POC:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete POC");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Location not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage POCs - {location.name}
          </h1>
          <p className="text-muted-foreground">
            Add and manage points of contact for this location
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add POC
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPOC ? "Edit POC" : "Add New POC"}
              </DialogTitle>
              <DialogDescription>
                {editingPOC
                  ? "Update the point of contact details"
                  : "Add a new point of contact for this location"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Rajesh Kumar" {...field} />
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
                        <Input placeholder="e.g., +91 98765 43210" {...field} />
                      </FormControl>
                      <FormDescription>
                        Primary contact phone number
                      </FormDescription>
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
                          placeholder="e.g., rajesh@company.com"
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
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Site Manager, Facility Head"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPOC ? "Update POC" : "Add POC"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {pocs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No POCs yet</h3>
              <p className="text-muted-foreground mb-6">
                Add points of contact for this location to get started
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add First POC
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pocs.map((poc) => (
            <Card key={poc.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{poc.name}</CardTitle>
                    {poc.role && (
                      <CardDescription className="mt-1">{poc.role}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(poc)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPocToDelete(poc);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{poc.phone}</p>
                </div>
                {poc.email && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium break-all">{poc.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the POC{" "}
              <strong>{pocToDelete?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

