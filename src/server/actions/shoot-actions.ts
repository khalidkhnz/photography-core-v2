"use server";

import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const createShootSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  shootTypeId: z.string().min(1, "Shoot type is required"),
  locationId: z.string().optional(),
  clusterId: z.string().optional(),
  projectName: z.string().optional(),
  remarks: z.string().optional(),
  editId: z.string().optional(),
  overallDeliverables: z.string().optional(),
  shootStartDate: z.string().optional(),
  shootEndDate: z.string().optional(),
  photographerNotes: z.string().optional(),
  editorNotes: z.string().optional(),
  workflowType: z.string().optional(),
  photographyCost: z.string().optional(),
  travelCost: z.string().optional(),
  editingCost: z.string().optional(),
  photographerIds: z.array(z.string()).optional(), // Will map to assignmentType: "photographer"
  editorIds: z.array(z.string()).optional(), // Will map to assignmentType: "editor"
  executorId: z.string().optional(), // The person who completed the shoot
  poc: z.string().optional(), // Point of Contact for the shoot
});

const updateShootSchema = z.object({
  shootId: z.string().min(1, "Shoot ID is required"),
  clientId: z.string().min(1, "Client is required"),
  shootTypeId: z.string().min(1, "Shoot type is required"),
  locationId: z.string().optional(),
  clusterId: z.string().optional(),
  projectName: z.string().optional(),
  remarks: z.string().optional(),
  editId: z.string().optional(),
  overallDeliverables: z.string().optional(),
  shootStartDate: z.string().optional(),
  shootEndDate: z.string().optional(),
  photographerNotes: z.string().optional(),
  editorNotes: z.string().optional(),
  workflowType: z.string().optional(),
  photographyCost: z.string().optional(),
  travelCost: z.string().optional(),
  editingCost: z.string().optional(),
  photographerIds: z.array(z.string()).optional(),
  editorIds: z.array(z.string()).optional(),
  executorId: z.string().optional(), // The person who completed the shoot
  poc: z.string().optional(), // Point of Contact for the shoot
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
      clusterId: (formData.get("clusterId") as string) || undefined,
      projectName: (formData.get("projectName") as string) || undefined,
      remarks: (formData.get("remarks") as string) || undefined,
      editId: (formData.get("editId") as string) || undefined,
      overallDeliverables:
        (formData.get("overallDeliverables") as string) || undefined,
      shootStartDate: (formData.get("shootStartDate") as string) || undefined,
      shootEndDate: (formData.get("shootEndDate") as string) || undefined,
      photographerNotes:
        (formData.get("photographerNotes") as string) || undefined,
      editorNotes: (formData.get("editorNotes") as string) || undefined,
      workflowType: (formData.get("workflowType") as string) || undefined,
      photographyCost: (formData.get("photographyCost") as string) || undefined,
      travelCost: (formData.get("travelCost") as string) || undefined,
      editingCost: (formData.get("editingCost") as string) || undefined,
      photographerIds: formData.getAll("photographerIds") as string[],
      editorIds: formData.getAll("editorIds") as string[],
      executorId: (formData.get("executorId") as string) || undefined,
      poc: (formData.get("poc") as string) || undefined,
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

    // Convert cost strings to floats
    const photographyCostFloat = validatedData.photographyCost
      ? parseFloat(validatedData.photographyCost)
      : undefined;
    const travelCostFloat = validatedData.travelCost
      ? parseFloat(validatedData.travelCost)
      : undefined;
    const editingCostFloat = validatedData.editingCost
      ? parseFloat(validatedData.editingCost)
      : undefined;

    // Create the shoot
    const shoot = await db.shoot.create({
      data: {
        shootId: shootId,
        clientId: validatedData.clientId,
        shootTypeId: validatedData.shootTypeId,
        locationId: validatedData.locationId,
        clusterId: validatedData.clusterId,
        projectName: validatedData.projectName,
        remarks: validatedData.remarks,
        editId: validatedData.editId,
        overallDeliverables: validatedData.overallDeliverables,
        shootStartDate: validatedData.shootStartDate
          ? new Date(validatedData.shootStartDate)
          : undefined,
        shootEndDate: validatedData.shootEndDate
          ? new Date(validatedData.shootEndDate)
          : undefined,
        photographerNotes: validatedData.photographerNotes,
        editorNotes: validatedData.editorNotes,
        workflowType: validatedData.workflowType ?? "shift",
        photographyCost: photographyCostFloat,
        travelCost: travelCostFloat,
        editingCost: editingCostFloat,
        executorId: validatedData.executorId, // Executor who will complete the shoot
        poc: validatedData.poc, // Point of Contact for the shoot
        status: "planned",
      },
    });

    // Add team members (photographers and editors)
    const teamMembersToCreate = [];

    if (
      validatedData.photographerIds &&
      validatedData.photographerIds.length > 0
    ) {
      teamMembersToCreate.push(
        ...validatedData.photographerIds.map((userId) => ({
          shootId: shoot.id,
          userId,
          assignmentType: "photographer",
        })),
      );
    }

    if (validatedData.editorIds && validatedData.editorIds.length > 0) {
      teamMembersToCreate.push(
        ...validatedData.editorIds.map((userId) => ({
          shootId: shoot.id,
          userId,
          assignmentType: "editor",
        })),
      );
    }

    if (teamMembersToCreate.length > 0) {
      await db.shootTeamMember.createMany({
        data: teamMembersToCreate,
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
        executor: true,
        teamMembers: {
          include: {
            user: true,
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
      shootId: formData.get("shootId") as string,
      clientId: formData.get("clientId") as string,
      shootTypeId: formData.get("shootTypeId") as string,
      locationId: (formData.get("locationId") as string) || undefined,
      clusterId: (formData.get("clusterId") as string) || undefined,
      projectName: (formData.get("projectName") as string) || undefined,
      remarks: (formData.get("remarks") as string) || undefined,
      editId: (formData.get("editId") as string) || undefined,
      overallDeliverables:
        (formData.get("overallDeliverables") as string) || undefined,
      shootStartDate: (formData.get("shootStartDate") as string) || undefined,
      shootEndDate: (formData.get("shootEndDate") as string) || undefined,
      photographerNotes:
        (formData.get("photographerNotes") as string) || undefined,
      editorNotes: (formData.get("editorNotes") as string) || undefined,
      workflowType: (formData.get("workflowType") as string) || undefined,
      photographyCost: (formData.get("photographyCost") as string) || undefined,
      travelCost: (formData.get("travelCost") as string) || undefined,
      editingCost: (formData.get("editingCost") as string) || undefined,
      photographerIds:
        rawPhotographerIds.length > 0 ? rawPhotographerIds : undefined,
      editorIds: rawEditorIds.length > 0 ? rawEditorIds : undefined,
      executorId: (formData.get("executorId") as string) || undefined,
      poc: (formData.get("poc") as string) || undefined,
    };

    const validatedData = updateShootSchema.parse(rawData);

    // Convert cost strings to floats
    const photographyCostFloat = validatedData.photographyCost
      ? parseFloat(validatedData.photographyCost)
      : undefined;
    const travelCostFloat = validatedData.travelCost
      ? parseFloat(validatedData.travelCost)
      : undefined;
    const editingCostFloat = validatedData.editingCost
      ? parseFloat(validatedData.editingCost)
      : undefined;

    // Check if shootId is being changed and ensure uniqueness
    const currentShoot = await db.shoot.findUnique({
      where: { id },
    });

    if (currentShoot && currentShoot.shootId !== validatedData.shootId) {
      const existingShoot = await db.shoot.findUnique({
        where: { shootId: validatedData.shootId },
      });
      if (existingShoot) {
        throw new Error(
          "Shoot ID already exists. Please choose a different ID.",
        );
      }
    }

    // Update the shoot
    await db.shoot.update({
      where: { id },
      data: {
        shootId: validatedData.shootId,
        clientId: validatedData.clientId,
        shootTypeId: validatedData.shootTypeId,
        locationId: validatedData.locationId,
        clusterId: validatedData.clusterId,
        projectName: validatedData.projectName,
        remarks: validatedData.remarks,
        editId: validatedData.editId,
        overallDeliverables: validatedData.overallDeliverables,
        shootStartDate: validatedData.shootStartDate
          ? new Date(validatedData.shootStartDate)
          : undefined,
        shootEndDate: validatedData.shootEndDate
          ? new Date(validatedData.shootEndDate)
          : undefined,
        photographerNotes: validatedData.photographerNotes,
        editorNotes: validatedData.editorNotes,
        workflowType: validatedData.workflowType ?? "shift",
        photographyCost: photographyCostFloat,
        travelCost: travelCostFloat,
        editingCost: editingCostFloat,
        executorId: validatedData.executorId,
        poc: validatedData.poc,
      },
    });

    // Update team members - delete all and recreate
    await db.shootTeamMember.deleteMany({
      where: { shootId: id },
    });

    const teamMembersToCreate = [];

    if (
      validatedData.photographerIds &&
      validatedData.photographerIds.length > 0
    ) {
      teamMembersToCreate.push(
        ...validatedData.photographerIds.map((userId) => ({
          shootId: id,
          userId,
          assignmentType: "photographer",
        })),
      );
    }

    if (validatedData.editorIds && validatedData.editorIds.length > 0) {
      teamMembersToCreate.push(
        ...validatedData.editorIds.map((userId) => ({
          shootId: id,
          userId,
          assignmentType: "editor",
        })),
      );
    }

    if (teamMembersToCreate.length > 0) {
      await db.shootTeamMember.createMany({
        data: teamMembersToCreate,
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
        cluster: true,
        executor: true,
        teamMembers: {
          include: {
            user: true,
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
