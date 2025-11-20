"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { refreshDashboardData } from "./dashboard-actions";
import {
  createShootSchema,
  updateShootSchema,
  type CreateShootFormData,
  type UpdateShootFormData,
} from "@/lib/validations/shoot";

// Function to generate unique Shoot ID
function generateShootId(shootTypeCode: string): string {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${shootTypeCode}-${timestamp}-${random}`;
}

// Server action to generate Shoot ID
export async function generateShootIdAction(shootTypeId: string) {
  try {
    const shootType = await db.shootType.findUnique({
      where: { id: shootTypeId },
    });

    if (!shootType) {
      return { success: false, error: "Invalid shoot type" };
    }

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
      return { success: false, error: "Failed to generate unique shoot ID" };
    }

    return { success: true, shootId };
  } catch (error) {
    console.error("Error generating shoot ID:", error);
    return { success: false, error: "Failed to generate shoot ID" };
  }
}

// Server action to check Shoot ID uniqueness
export async function checkShootIdUniqueness(shootId: string) {
  try {
    if (!shootId || shootId.trim() === "") {
      return { isUnique: false, exists: false, error: "Shoot ID is required" };
    }

    const existingShoot = await db.shoot.findUnique({
      where: { shootId: shootId.trim() },
    });

    return { isUnique: !existingShoot, exists: !!existingShoot };
  } catch (error) {
    console.error("Error checking shoot ID uniqueness:", error);
    throw new Error("Failed to check shoot ID uniqueness");
  }
}

export async function createShoot(formData: FormData) {
  try {
    const rawData: CreateShootFormData = {
      shootId: (formData.get("shootId") as string)?.trim() || "",
      clientId: formData.get("clientId") as string,
      entityId: (formData.get("entityId") as string) || undefined,
      locationId: (formData.get("locationId") as string) || undefined,
      clusterId: (formData.get("clusterId") as string) || undefined,
      shootTypeId: formData.get("shootTypeId") as string,
      projectName: (formData.get("projectName") as string) || undefined,
      remarks: (formData.get("remarks") as string) || undefined,
      overallDeliverables: (formData.get("overallDeliverables") as string) || undefined,
      
      // Date/Time fields
      scheduledShootDate: (formData.get("scheduledShootDate") as string) || undefined,
      reportingTime: (formData.get("reportingTime") as string) || undefined,
      wrapUpTime: (formData.get("wrapUpTime") as string) || undefined,
      
      photographerNotes: (formData.get("photographerNotes") as string) || undefined,
      workflowType: (formData.get("workflowType") as "shift" | "project" | "cluster") || "shift",
      
      // Cost tracking fields
      shootCost: (formData.get("shootCost") as string) || undefined,
      travelCost: (formData.get("travelCost") as string) || undefined,
      shootCostStatus: formData.get("shootCostStatus") ? (formData.get("shootCostStatus") as "paid" | "unpaid" | "onhold") : undefined,
      travelCostStatus: formData.get("travelCostStatus") ? (formData.get("travelCostStatus") as "paid" | "unpaid" | "onhold") : undefined,
      overallCost: (formData.get("overallCost") as string) || undefined,
      overallCostStatus: formData.get("overallCostStatus") ? (formData.get("overallCostStatus") as "paid" | "unpaid" | "onhold") : undefined,
      clusterCostOverride: (formData.get("clusterCostOverride") as string) || undefined,
      
      // DOP and Executors
      dopId: (formData.get("dopId") as string) || undefined,
      executorIds: formData.getAll("executorIds") as string[],
      
      // Edit IDs (multiple)
      editIds: formData.getAll("editIds") as string[],
    };

    // Check if Shoot ID is unique
    if (!rawData.shootId) {
      return { success: false, error: "Shoot ID is required" };
    }

    const shootIdCheck = await checkShootIdUniqueness(rawData.shootId);
    if (!shootIdCheck.isUnique) {
      return { success: false, error: "Shoot ID already exists. Please choose a different ID." };
    }

    const validatedData = createShootSchema.parse(rawData);

    // Convert cost strings to floats
    const shootCostFloat = validatedData.shootCost ? parseFloat(validatedData.shootCost) : undefined;
    const travelCostFloat = validatedData.travelCost ? parseFloat(validatedData.travelCost) : undefined;
    const overallCostFloat = validatedData.overallCost ? parseFloat(validatedData.overallCost) : undefined;
    const clusterCostOverrideFloat = validatedData.clusterCostOverride ? parseFloat(validatedData.clusterCostOverride) : undefined;

    // Create the shoot
    const shoot = await db.shoot.create({
      data: {
        shootId: validatedData.shootId,
        clientId: validatedData.clientId,
        entityId: validatedData.entityId,
        locationId: validatedData.locationId,
        clusterId: validatedData.clusterId,
        shootTypeId: validatedData.shootTypeId,
        projectName: validatedData.projectName,
        remarks: validatedData.remarks,
        overallDeliverables: validatedData.overallDeliverables,
        scheduledShootDate: validatedData.scheduledShootDate
          ? new Date(validatedData.scheduledShootDate)
          : undefined,
        reportingTime: validatedData.reportingTime,
        wrapUpTime: validatedData.wrapUpTime,
        photographerNotes: validatedData.photographerNotes,
        workflowType: validatedData.workflowType ?? "shift",
        shootCost: shootCostFloat,
        travelCost: travelCostFloat,
        shootCostStatus: validatedData.shootCostStatus,
        travelCostStatus: validatedData.travelCostStatus,
        overallCost: overallCostFloat,
        overallCostStatus: validatedData.overallCostStatus,
        clusterCostOverride: clusterCostOverrideFloat,
        dopId: validatedData.dopId,
        status: "planned",
      },
    });

    // Add executors
    if (validatedData.executorIds && validatedData.executorIds.length > 0) {
      await db.shootExecutor.createMany({
        data: validatedData.executorIds.map((userId) => ({
          shootId: shoot.id,
          userId,
        })),
      });
    }

    // Link to existing Edit IDs if provided
    if (validatedData.editIds && validatedData.editIds.length > 0) {
      // Update edits to link to this shoot using database IDs
      await db.edit.updateMany({
        where: {
          id: {
            in: validatedData.editIds,
          },
        },
        data: {
          shootId: shoot.id,
        },
      });
    }

    revalidatePath("/dashboard/shoots");
    await refreshDashboardData();

    return { success: true, shootId: shoot.shootId };
  } catch (error) {
    console.error("Error creating shoot:", error);

    // Handle unique constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false, error: "Shoot ID already exists. Please choose a different ID." };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create shoot",
    };
  }
}

export async function getShoots() {
  try {
    const shoots = await db.shoot.findMany({
      include: {
        client: true,
        entity: true,
        shootType: true,
        location: {
          include: {
            pocs: true,
          },
        },
        dop: true, // Director of Photography
        executors: {
          include: {
            user: true,
          },
        },
        edits: {
          include: {
            editors: {
              include: {
                user: true,
              },
            },
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
    const rawData: UpdateShootFormData = {
      shootId: (formData.get("shootId") as string)?.trim() || "",
      clientId: formData.get("clientId") as string,
      entityId: (formData.get("entityId") as string) || undefined,
      locationId: (formData.get("locationId") as string) || undefined,
      clusterId: (formData.get("clusterId") as string) || undefined,
      shootTypeId: formData.get("shootTypeId") as string,
      projectName: (formData.get("projectName") as string) || undefined,
      remarks: (formData.get("remarks") as string) || undefined,
      overallDeliverables: (formData.get("overallDeliverables") as string) || undefined,
      
      scheduledShootDate: (formData.get("scheduledShootDate") as string) || undefined,
      reportingTime: (formData.get("reportingTime") as string) || undefined,
      wrapUpTime: (formData.get("wrapUpTime") as string) || undefined,
      
      photographerNotes: (formData.get("photographerNotes") as string) || undefined,
      workflowType: (formData.get("workflowType") as "shift" | "project" | "cluster") || "shift",
      
      shootCost: (formData.get("shootCost") as string) || undefined,
      travelCost: (formData.get("travelCost") as string) || undefined,
      shootCostStatus: formData.get("shootCostStatus") ? (formData.get("shootCostStatus") as "paid" | "unpaid" | "onhold") : undefined,
      travelCostStatus: formData.get("travelCostStatus") ? (formData.get("travelCostStatus") as "paid" | "unpaid" | "onhold") : undefined,
      overallCost: (formData.get("overallCost") as string) || undefined,
      overallCostStatus: formData.get("overallCostStatus") ? (formData.get("overallCostStatus") as "paid" | "unpaid" | "onhold") : undefined,
      clusterCostOverride: (formData.get("clusterCostOverride") as string) || undefined,
      
      dopId: (formData.get("dopId") as string) || undefined,
      executorIds: formData.getAll("executorIds") as string[],
      editIds: formData.getAll("editIds") as string[],
    };

    const validatedData = updateShootSchema.parse(rawData);

    // Check if shootId is being changed and ensure uniqueness
    const currentShoot = await db.shoot.findUnique({
      where: { id },
    });

    if (currentShoot && currentShoot.shootId !== validatedData.shootId) {
      const existingShoot = await db.shoot.findUnique({
        where: { shootId: validatedData.shootId },
      });
      if (existingShoot) {
        throw new Error("Shoot ID already exists. Please choose a different ID.");
      }
    }

    // Convert cost strings to floats
    const shootCostFloat = validatedData.shootCost ? parseFloat(validatedData.shootCost) : undefined;
    const travelCostFloat = validatedData.travelCost ? parseFloat(validatedData.travelCost) : undefined;
    const overallCostFloat = validatedData.overallCost ? parseFloat(validatedData.overallCost) : undefined;
    const clusterCostOverrideFloat = validatedData.clusterCostOverride ? parseFloat(validatedData.clusterCostOverride) : undefined;

    // Update the shoot
    await db.shoot.update({
      where: { id },
      data: {
        shootId: validatedData.shootId,
        clientId: validatedData.clientId,
        entityId: validatedData.entityId,
        locationId: validatedData.locationId,
        clusterId: validatedData.clusterId,
        shootTypeId: validatedData.shootTypeId,
        projectName: validatedData.projectName,
        remarks: validatedData.remarks,
        overallDeliverables: validatedData.overallDeliverables,
        scheduledShootDate: validatedData.scheduledShootDate
          ? new Date(validatedData.scheduledShootDate)
          : null,
        reportingTime: validatedData.reportingTime,
        wrapUpTime: validatedData.wrapUpTime,
        photographerNotes: validatedData.photographerNotes,
        workflowType: validatedData.workflowType ?? "shift",
        shootCost: shootCostFloat,
        travelCost: travelCostFloat,
        shootCostStatus: validatedData.shootCostStatus,
        travelCostStatus: validatedData.travelCostStatus,
        overallCost: overallCostFloat,
        overallCostStatus: validatedData.overallCostStatus,
        clusterCostOverride: clusterCostOverrideFloat,
        dopId: validatedData.dopId,
      },
    });

    // Update executors - delete all and recreate
    await db.shootExecutor.deleteMany({
      where: { shootId: id },
    });

    if (validatedData.executorIds && validatedData.executorIds.length > 0) {
      await db.shootExecutor.createMany({
        data: validatedData.executorIds.map((userId) => ({
          shootId: id,
          userId,
        })),
      });
    }

    // Update edit linkages
    // First, unlink all edits from this shoot
    await db.edit.updateMany({
      where: { shootId: id },
      data: { shootId: null },
    });

    // Then link the specified edits using database IDs
    if (validatedData.editIds && validatedData.editIds.length > 0) {
      await db.edit.updateMany({
        where: {
          id: {
            in: validatedData.editIds,
          },
        },
        data: {
          shootId: id,
        },
      });
    }

    revalidatePath("/dashboard/shoots");
    revalidatePath(`/dashboard/shoots/${id}`);
    await refreshDashboardData();

    return { success: true };
  } catch (error) {
    console.error("Error updating shoot:", error);
    
    // Handle unique constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false, error: "Shoot ID already exists. Please choose a different ID." };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update shoot",
    };
  }
}

export async function updateShootStatus(id: string, status: string) {
  try {
    const validStatuses = [
      "planned",
      "in_progress",
      "editing",
      "delivered",
      "completed",
      "blocked",
      "postponed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    await db.shoot.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/dashboard/shoots");
    revalidatePath(`/dashboard/shoots/${id}`);
    await refreshDashboardData();
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
    await refreshDashboardData();
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
        entity: true,
        shootType: true,
        location: {
          include: {
            pocs: true,
          },
        },
        cluster: true,
        dop: true,
        executors: {
          include: {
            user: true,
          },
        },
        edits: {
          include: {
            editors: {
              include: {
                user: true,
              },
            },
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
