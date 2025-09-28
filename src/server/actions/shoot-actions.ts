"use server";

import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const createShootSchema = z.object({
  shootId: z.string().min(1, "Shoot ID is required"),
  clientId: z.string().min(1, "Client is required"),
  shootTypeId: z.string().min(1, "Shoot type is required"),
  locationId: z.string().optional(),
  overallDeliverables: z.string().optional(),
  shootStartDate: z.string().optional(),
  shootEndDate: z.string().optional(),
  photographerNotes: z.string().optional(),
  editorNotes: z.string().optional(),
  photographerIds: z.array(z.string()).optional(),
  editorIds: z.array(z.string()).optional(),
});

export async function createShoot(formData: FormData) {
  try {
    const rawData = {
      shootId: formData.get("shootId") as string,
      clientId: formData.get("clientId") as string,
      shootTypeId: formData.get("shootTypeId") as string,
      locationId: (formData.get("locationId") as string) || undefined,
      overallDeliverables:
        (formData.get("overallDeliverables") as string) || undefined,
      shootStartDate: (formData.get("shootStartDate") as string) || undefined,
      shootEndDate: (formData.get("shootEndDate") as string) || undefined,
      photographerNotes:
        (formData.get("photographerNotes") as string) || undefined,
      editorNotes: (formData.get("editorNotes") as string) || undefined,
      photographerIds: formData.getAll("photographerIds") as string[],
      editorIds: formData.getAll("editorIds") as string[],
    };

    const validatedData = createShootSchema.parse(rawData);

    // Check if shoot ID already exists
    const existingShoot = await db.shoot.findUnique({
      where: { shootId: validatedData.shootId },
    });

    if (existingShoot) {
      throw new Error("Shoot ID already exists");
    }

    // Create the shoot
    const shoot = await db.shoot.create({
      data: {
        shootId: validatedData.shootId,
        clientId: validatedData.clientId,
        shootTypeId: validatedData.shootTypeId,
        locationId: validatedData.locationId,
        overallDeliverables: validatedData.overallDeliverables,
        shootStartDate: validatedData.shootStartDate
          ? new Date(validatedData.shootStartDate)
          : null,
        shootEndDate: validatedData.shootEndDate
          ? new Date(validatedData.shootEndDate)
          : null,
        photographerNotes: validatedData.photographerNotes,
        editorNotes: validatedData.editorNotes,
        status: "planned",
      },
    });

    // Add photographers if provided
    if (
      validatedData.photographerIds &&
      validatedData.photographerIds.length > 0
    ) {
      await db.shootPhotographer.createMany({
        data: validatedData.photographerIds.map((photographerId) => ({
          shootId: shoot.id,
          photographerId,
        })),
      });
    }

    // Add editors if provided
    if (validatedData.editorIds && validatedData.editorIds.length > 0) {
      await db.shootEditor.createMany({
        data: validatedData.editorIds.map((editorId) => ({
          shootId: shoot.id,
          editorId,
        })),
      });
    }

    revalidatePath("/dashboard/shoots");
    redirect("/dashboard/shoots");
  } catch (error) {
    console.error("Error creating shoot:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create shoot",
    );
  }
}

export async function getShoots() {
  try {
    const shoots = await db.shoot.findMany({
      include: {
        client: true,
        shootType: true,
        location: true,
        shootPhotographers: {
          include: {
            photographer: true,
          },
        },
        shootEditors: {
          include: {
            editor: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return shoots;
  } catch (error) {
    console.error("Error fetching shoots:", error);
    throw new Error("Failed to fetch shoots");
  }
}

export async function deleteShoot(id: string) {
  try {
    await db.shoot.delete({
      where: { id },
    });

    revalidatePath("/dashboard/shoots");
  } catch (error) {
    console.error("Error deleting shoot:", error);
    throw new Error("Failed to delete shoot");
  }
}

export async function getShootById(id: string) {
  try {
    const shoot = await db.shoot.findUnique({
      where: { id },
      include: {
        client: true,
        shootType: true,
        location: true,
        shootPhotographers: {
          include: {
            photographer: true,
          },
        },
        shootEditors: {
          include: {
            editor: true,
          },
        },
      },
    });

    return shoot;
  } catch (error) {
    console.error("Error fetching shoot:", error);
    throw new Error("Failed to fetch shoot");
  }
}
