"use server";

import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const createShootSchema = z.object({
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

// Function to generate unique Shoot ID
function generateShootId(shootTypeCode: string): string {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${shootTypeCode}-${timestamp}-${random}`;
}

export async function createShoot(formData: FormData) {
  try {
    const rawData = {
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

    // Get shoot type to generate ID
    const shootType = await db.shootType.findUnique({
      where: { id: rawData.shootTypeId },
    });

    if (!shootType) {
      throw new Error("Invalid shoot type");
    }

    // Generate unique shoot ID
    let shootId: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shootId = generateShootId(shootType.code);
      const existingShoot = await db.shoot.findUnique({
        where: { shootId },
      });
      if (!existingShoot) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error("Failed to generate unique shoot ID");
    }

    const validatedData = createShootSchema.parse(rawData);

    // Create the shoot
    const shoot = await db.shoot.create({
      data: {
        shootId: shootId,
        clientId: validatedData.clientId,
        shootTypeId: validatedData.shootTypeId,
        locationId: validatedData.locationId,
        overallDeliverables: validatedData.overallDeliverables,
        shootStartDate: validatedData.shootStartDate
          ? new Date(validatedData.shootStartDate)
          : undefined,
        shootEndDate: validatedData.shootEndDate
          ? new Date(validatedData.shootEndDate)
          : undefined,
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
  } catch (error) {
    console.error("Error creating shoot:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create shoot",
    );
  }

  redirect("/dashboard/shoots");
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

export async function updateShoot(id: string, formData: FormData) {
  try {
    const rawPhotographerIds = formData.getAll("photographerIds") as string[];
    const rawEditorIds = formData.getAll("editorIds") as string[];

    const rawData = {
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
      photographerIds:
        rawPhotographerIds.length > 0 ? rawPhotographerIds : undefined,
      editorIds: rawEditorIds.length > 0 ? rawEditorIds : undefined,
    };

    const validatedData = createShootSchema.parse(rawData);

    // Update the shoot
    await db.shoot.update({
      where: { id },
      data: {
        clientId: validatedData.clientId,
        shootTypeId: validatedData.shootTypeId,
        locationId: validatedData.locationId,
        overallDeliverables: validatedData.overallDeliverables,
        shootStartDate: validatedData.shootStartDate
          ? new Date(validatedData.shootStartDate)
          : undefined,
        shootEndDate: validatedData.shootEndDate
          ? new Date(validatedData.shootEndDate)
          : undefined,
        photographerNotes: validatedData.photographerNotes,
        editorNotes: validatedData.editorNotes,
      },
    });

    // Update photographers
    await db.shootPhotographer.deleteMany({
      where: { shootId: id },
    });
    if (
      validatedData.photographerIds &&
      validatedData.photographerIds.length > 0
    ) {
      await db.shootPhotographer.createMany({
        data: validatedData.photographerIds.map((photographerId) => ({
          shootId: id,
          photographerId,
        })),
      });
    }

    // Update editors
    await db.shootEditor.deleteMany({
      where: { shootId: id },
    });
    if (validatedData.editorIds && validatedData.editorIds.length > 0) {
      await db.shootEditor.createMany({
        data: validatedData.editorIds.map((editorId) => ({
          shootId: id,
          editorId,
        })),
      });
    }

    revalidatePath("/dashboard/shoots");
    revalidatePath(`/dashboard/shoots/${id}`);
  } catch (error) {
    console.error("Error updating shoot:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update shoot",
    );
  }
}

export async function updateShootStatus(id: string, status: string) {
  try {
    const validStatuses = ["planned", "in_progress", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    await db.shoot.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/dashboard/shoots");
    revalidatePath(`/dashboard/shoots/${id}`);
  } catch (error) {
    console.error("Error updating shoot status:", error);
    throw new Error("Failed to update shoot status");
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
