"use server";

import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createPhotographerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).default(0),
  isActive: z.boolean().default(true),
});

export async function createPhotographer(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      specialties: JSON.parse(
        (formData.get("specialties") as string) || "[]",
      ) as string[],
      rating: parseFloat((formData.get("rating") as string) || "0"),
      isActive: formData.get("isActive") === "true",
    };

    const validatedData = createPhotographerSchema.parse(rawData);

    const photographer = await db.photographer.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/photographers");
    return { success: true, photographer };
  } catch (error) {
    console.error("Error creating photographer:", error);
    return { success: false, error: "Failed to create photographer" };
  }
}

export async function getPhotographers() {
  try {
    const photographers = await db.photographer.findMany({
      orderBy: { name: "asc" },
    });
    return photographers;
  } catch (error) {
    console.error("Error fetching photographers:", error);
    return [];
  }
}

export async function getPhotographerById(id: string) {
  try {
    const photographer = await db.photographer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            shootPhotographers: true,
          },
        },
      },
    });
    return photographer;
  } catch (error) {
    console.error(`Error fetching photographer with ID ${id}:`, error);
    return null;
  }
}

export async function updatePhotographer(id: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      specialties: formData.get("specialties") as string,
      rating: formData.get("rating") as string,
      isActive: formData.get("isActive") as string,
    };

    const validatedData = createPhotographerSchema.parse({
      ...rawData,
      specialties: rawData.specialties ? JSON.parse(rawData.specialties) : [],
      rating: rawData.rating ? Number(rawData.rating) : 0,
      isActive: rawData.isActive === "true",
    });

    const photographer = await db.photographer.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/dashboard/photographers");
    return { success: true, photographer };
  } catch (error) {
    console.error("Error updating photographer:", error);
    return { success: false, error: "Failed to update photographer" };
  }
}

export async function deletePhotographer(id: string) {
  try {
    await db.photographer.delete({
      where: { id },
    });
    revalidatePath("/dashboard/photographers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting photographer:", error);
    return { success: false, error: "Failed to delete photographer" };
  }
}
