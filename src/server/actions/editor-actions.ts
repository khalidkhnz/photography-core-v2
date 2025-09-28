"use server";

import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createEditorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).default(0),
  isActive: z.boolean().default(true),
});

export async function createEditor(formData: FormData) {
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

    const validatedData = createEditorSchema.parse(rawData);

    const editor = await db.editor.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/editors");
    return { success: true, editor };
  } catch (error) {
    console.error("Error creating editor:", error);
    return { success: false, error: "Failed to create editor" };
  }
}

export async function getEditors() {
  try {
    const editors = await db.editor.findMany({
      orderBy: { name: "asc" },
    });
    return editors;
  } catch (error) {
    console.error("Error fetching editors:", error);
    return [];
  }
}

export async function getEditorById(id: string) {
  try {
    const editor = await db.editor.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            shootEditors: true,
          },
        },
      },
    });
    return editor;
  } catch (error) {
    console.error(`Error fetching editor with ID ${id}:`, error);
    return null;
  }
}

export async function updateEditor(id: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      specialties: formData.get("specialties") as string,
      rating: formData.get("rating") as string,
      isActive: formData.get("isActive") as string,
    };

    const validatedData = createEditorSchema.parse({
      ...rawData,
      specialties: rawData.specialties ? JSON.parse(rawData.specialties) : [],
      rating: rawData.rating ? Number(rawData.rating) : 0,
      isActive: rawData.isActive === "true",
    });

    const editor = await db.editor.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/dashboard/editors");
    return { success: true, editor };
  } catch (error) {
    console.error("Error updating editor:", error);
    return { success: false, error: "Failed to update editor" };
  }
}

export async function deleteEditor(id: string) {
  try {
    await db.editor.delete({
      where: { id },
    });
    revalidatePath("/dashboard/editors");
    return { success: true };
  } catch (error) {
    console.error("Error deleting editor:", error);
    return { success: false, error: "Failed to delete editor" };
  }
}
