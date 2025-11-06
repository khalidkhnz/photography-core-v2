"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import {
  createEditSchema,
  updateEditSchema,
  type CreateEditFormData,
  type UpdateEditFormData,
} from "@/lib/validations/shoot";

// Function to generate unique Edit ID
function generateEditId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `EDIT-${timestamp}-${random}`;
}

// Server action to generate Edit ID
export async function generateEditIdAction() {
  try {
    let editId: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      editId = generateEditId();
      const existingEdit = await db.edit.findUnique({
        where: { editId },
      });
      if (!existingEdit) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return { success: false, error: "Failed to generate unique edit ID" };
    }

    return { success: true, editId };
  } catch (error) {
    console.error("Error generating edit ID:", error);
    return { success: false, error: "Failed to generate edit ID" };
  }
}

// Server action to check Edit ID uniqueness
export async function checkEditIdUniqueness(editId: string) {
  try {
    if (!editId || editId.trim() === "") {
      return { isUnique: false, exists: false, error: "Edit ID is required" };
    }

    const existingEdit = await db.edit.findUnique({
      where: { editId: editId.trim() },
    });

    return { isUnique: !existingEdit, exists: !!existingEdit };
  } catch (error) {
    console.error("Error checking edit ID uniqueness:", error);
    throw new Error("Failed to check edit ID uniqueness");
  }
}

export async function createEdit(formData: FormData) {
  try {
    const rawData: CreateEditFormData = {
      editId: (formData.get("editId") as string)?.trim() || "",
      shootId: (formData.get("shootId") as string) || undefined,
      deliverables: (formData.get("deliverables") as string) || undefined,
      editDeliveryDate: (formData.get("editDeliveryDate") as string) || undefined,
      editorNotes: (formData.get("editorNotes") as string) || undefined,
      editCost: (formData.get("editCost") as string) || undefined,
      editCostStatus: (formData.get("editCostStatus") as "paid" | "unpaid" | "onhold") || undefined,
      editorIds: formData.getAll("editorIds") as string[],
    };

    // Check if Edit ID is unique
    if (!rawData.editId) {
      return { success: false, error: "Edit ID is required" };
    }

    const editIdCheck = await checkEditIdUniqueness(rawData.editId);
    if (!editIdCheck.isUnique) {
      return { success: false, error: "Edit ID already exists. Please choose a different ID." };
    }

    const validatedData = createEditSchema.parse(rawData);

    // Convert cost string to float
    const editCostFloat = validatedData.editCost ? parseFloat(validatedData.editCost) : undefined;

    // Create the edit
    const edit = await db.edit.create({
      data: {
        editId: validatedData.editId,
        shootId: validatedData.shootId,
        deliverables: validatedData.deliverables,
        editDeliveryDate: validatedData.editDeliveryDate
          ? new Date(validatedData.editDeliveryDate)
          : undefined,
        editorNotes: validatedData.editorNotes,
        editCost: editCostFloat,
        editCostStatus: validatedData.editCostStatus,
        status: "pending",
      },
    });

    // Add editors
    if (validatedData.editorIds && validatedData.editorIds.length > 0) {
      await db.editEditor.createMany({
        data: validatedData.editorIds.map((userId) => ({
          editId: edit.id,
          userId,
        })),
      });
    }

    revalidatePath("/dashboard/edits");
    revalidatePath("/dashboard/shoots");

    return { success: true, editId: edit.editId };
  } catch (error) {
    console.error("Error creating edit:", error);

    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false, error: "Edit ID already exists. Please choose a different ID." };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create edit",
    };
  }
}

export async function getEdits() {
  try {
    const edits = await db.edit.findMany({
      include: {
        shoot: {
          include: {
            client: true,
            shootType: true,
          },
        },
        editors: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return edits;
  } catch (error) {
    console.error("Error fetching edits:", error);
    throw new Error("Failed to fetch edits");
  }
}

export async function updateEdit(id: string, formData: FormData) {
  try {
    const rawData: UpdateEditFormData = {
      editId: (formData.get("editId") as string)?.trim() || "",
      shootId: (formData.get("shootId") as string) || undefined,
      deliverables: (formData.get("deliverables") as string) || undefined,
      editDeliveryDate: (formData.get("editDeliveryDate") as string) || undefined,
      editorNotes: (formData.get("editorNotes") as string) || undefined,
      editCost: (formData.get("editCost") as string) || undefined,
      editCostStatus: (formData.get("editCostStatus") as "paid" | "unpaid" | "onhold") || undefined,
      editorIds: formData.getAll("editorIds") as string[],
    };

    const validatedData = updateEditSchema.parse(rawData);

    // Check if editId is being changed and ensure uniqueness
    const currentEdit = await db.edit.findUnique({
      where: { id },
    });

    if (currentEdit && currentEdit.editId !== validatedData.editId) {
      const existingEdit = await db.edit.findUnique({
        where: { editId: validatedData.editId },
      });
      if (existingEdit) {
        throw new Error("Edit ID already exists. Please choose a different ID.");
      }
    }

    // Convert cost string to float
    const editCostFloat = validatedData.editCost ? parseFloat(validatedData.editCost) : undefined;

    // Update the edit
    await db.edit.update({
      where: { id },
      data: {
        editId: validatedData.editId,
        shootId: validatedData.shootId,
        deliverables: validatedData.deliverables,
        editDeliveryDate: validatedData.editDeliveryDate
          ? new Date(validatedData.editDeliveryDate)
          : null,
        editorNotes: validatedData.editorNotes,
        editCost: editCostFloat,
        editCostStatus: validatedData.editCostStatus,
      },
    });

    // Update editors - delete all and recreate
    await db.editEditor.deleteMany({
      where: { editId: id },
    });

    if (validatedData.editorIds && validatedData.editorIds.length > 0) {
      await db.editEditor.createMany({
        data: validatedData.editorIds.map((userId) => ({
          editId: id,
          userId,
        })),
      });
    }

    revalidatePath("/dashboard/edits");
    revalidatePath(`/dashboard/edits/${id}`);
    revalidatePath("/dashboard/shoots");
  } catch (error) {
    console.error("Error updating edit:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update edit");
  }
}

export async function updateEditStatus(id: string, status: string) {
  try {
    const validStatuses = ["pending", "in_progress", "completed", "delivered"];

    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    await db.edit.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/dashboard/edits");
    revalidatePath(`/dashboard/edits/${id}`);
  } catch (error) {
    console.error("Error updating edit status:", error);
    throw new Error("Failed to update edit status");
  }
}

export async function deleteEdit(id: string) {
  try {
    await db.edit.delete({
      where: { id },
    });

    revalidatePath("/dashboard/edits");
    revalidatePath("/dashboard/shoots");
  } catch (error) {
    console.error("Error deleting edit:", error);
    throw new Error("Failed to delete edit");
  }
}

export async function getEditById(id: string) {
  try {
    const edit = await db.edit.findUnique({
      where: { id },
      include: {
        shoot: {
          include: {
            client: true,
            shootType: true,
            location: true,
          },
        },
        editors: {
          include: {
            user: true,
          },
        },
      },
    });

    return edit;
  } catch (error) {
    console.error("Error fetching edit:", error);
    throw new Error("Failed to fetch edit");
  }
}

// Get all edits for a specific shoot
export async function getEditsByShootId(shootId: string) {
  try {
    const edits = await db.edit.findMany({
      where: { shootId },
      include: {
        editors: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return edits;
  } catch (error) {
    console.error("Error fetching edits for shoot:", error);
    throw new Error("Failed to fetch edits for shoot");
  }
}

