"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
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
import { Plus, Edit, Trash2 } from "lucide-react";
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
  pocs: LocationPOC[];
}

interface LocationPOCManagerProps {
  location: Location;
}

export function LocationPOCManager({ location }: LocationPOCManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPOC, setEditingPOC] = useState<LocationPOC | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pocToDelete, setPocToDelete] = useState<LocationPOC | null>(null);
  const router = useRouter();

  const form = useForm<POCFormData>({
    resolver: zodResolver(pocSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
    },
  });

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
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", data.name);
        if (data.email) formData.append("email", data.email);
        formData.append("phone", data.phone);
        if (data.role) formData.append("role", data.role);
        formData.append("locationId", location.id);

        if (editingPOC) {
          await updateLocationPOC(editingPOC.id, formData);
          toast.success("POC updated successfully!");
        } else {
          await createLocationPOC(formData);
          toast.success("POC added successfully!");
        }

        setDialogOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Error saving POC:", error);
        toast.error(error instanceof Error ? error.message : "Failed to save POC");
      }
    });
  };

  const handleDelete = async () => {
    if (!pocToDelete) return;

    startTransition(async () => {
      try {
        await deleteLocationPOC(pocToDelete.id);
        toast.success("POC deleted successfully!");
        setDeleteDialogOpen(false);
        setPocToDelete(null);
        router.refresh();
      } catch (error) {
        console.error("Error deleting POC:", error);
        toast.error(error instanceof Error ? error.message : "Failed to delete POC");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} disabled={isPending}>
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
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending
                      ? "Saving..."
                      : editingPOC
                        ? "Update POC"
                        : "Add POC"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {location.pocs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No POCs yet</h3>
              <p className="text-muted-foreground mb-6">
                Add points of contact for this location to get started
              </p>
              <Button onClick={() => handleOpenDialog()} disabled={isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Add First POC
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {location.pocs.map((poc) => (
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
                      disabled={isPending}
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
                      disabled={isPending}
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
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


