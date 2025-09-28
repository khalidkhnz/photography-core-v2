"use server";

import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  coordinates: z.string().optional(),
  clientId: z.string().optional(),
});

export async function createLocation(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      address: (formData.get("address") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      state: (formData.get("state") as string) || undefined,
      country: (formData.get("country") as string) || undefined,
      coordinates: (formData.get("coordinates") as string) || undefined,
      clientId: (formData.get("clientId") as string) || undefined,
    };

    const validatedData = createLocationSchema.parse(rawData);

    const location = await db.location.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/locations");
    return { success: true, location };
  } catch (error) {
    console.error("Error creating location:", error);
    return { success: false, error: "Failed to create location" };
  }
}

export async function getLocations() {
  try {
    const locations = await db.location.findMany({
      include: {
        client: true,
      },
      orderBy: { name: "asc" },
    });
    return locations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

export async function getLocationsByClient(clientId: string) {
  try {
    const locations = await db.location.findMany({
      where: { clientId },
      orderBy: { name: "asc" },
    });
    return locations;
  } catch (error) {
    console.error(`Error fetching locations for client ${clientId}:`, error);
    return [];
  }
}

export async function deleteLocation(id: string) {
  try {
    await db.location.delete({
      where: { id },
    });
    revalidatePath("/dashboard/locations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting location:", error);
    return { success: false, error: "Failed to delete location" };
  }
}
