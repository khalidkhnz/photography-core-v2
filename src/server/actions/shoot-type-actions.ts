"use server";

import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createShootTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
});

export async function createShootType(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      description: (formData.get("description") as string) || undefined,
    };

    const validatedData = createShootTypeSchema.parse(rawData);

    const shootType = await db.shootType.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/shoot-types");
    return shootType;
  } catch (error) {
    console.error("Error creating shoot type:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create shoot type",
    );
  }
}

export async function getShootTypes() {
  try {
    const shootTypes = await db.shootType.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return shootTypes;
  } catch (error) {
    console.error("Error fetching shoot types:", error);
    throw new Error("Failed to fetch shoot types");
  }
}

export async function getShootTypeById(id: string) {
  try {
    const shootType = await db.shootType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            shoots: true,
          },
        },
      },
    });
    return shootType;
  } catch (error) {
    console.error(`Error fetching shoot type with ID ${id}:`, error);
    return null;
  }
}

export async function updateShootType(id: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      code: (formData.get("code") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
    };

    const validatedData = createShootTypeSchema.parse(rawData);

    const shootType = await db.shootType.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/dashboard/shoot-types");
    return shootType;
  } catch (error) {
    console.error("Error updating shoot type:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update shoot type",
    );
  }
}

export async function deleteShootType(id: string) {
  try {
    await db.shootType.delete({
      where: { id },
    });

    revalidatePath("/dashboard/shoot-types");
  } catch (error) {
    console.error("Error deleting shoot type:", error);
    throw new Error("Failed to delete shoot type");
  }
}
