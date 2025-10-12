"use server";

import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const createClusterSchema = z.object({
  name: z.string().min(1, "Cluster name is required"),
  description: z.string().optional(),
  clientId: z.string().optional(),
  totalCost: z.string().optional(),
});

const updateClusterSchema = z.object({
  name: z.string().min(1, "Cluster name is required"),
  description: z.string().optional(),
  clientId: z.string().optional(),
  totalCost: z.string().optional(),
});

export async function createCluster(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      clientId: (formData.get("clientId") as string) || undefined,
      totalCost: (formData.get("totalCost") as string) || undefined,
    };

    const validatedData = createClusterSchema.parse(rawData);

    const totalCostFloat = validatedData.totalCost
      ? parseFloat(validatedData.totalCost)
      : undefined;

    await db.cluster.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        clientId: validatedData.clientId,
        totalCost: totalCostFloat,
      },
    });

    revalidatePath("/dashboard/clusters");
  } catch (error) {
    console.error("Error creating cluster:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create cluster",
    );
  }

  redirect("/dashboard/clusters");
}

export async function getClusters() {
  try {
    const clusters = await db.cluster.findMany({
      include: {
        shoots: {
          include: {
            client: true,
            shootType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return clusters;
  } catch (error) {
    console.error("Error fetching clusters:", error);
    // Return empty array if table doesn't exist yet (before migration)
    return [];
  }
}

export async function getClusterById(id: string) {
  try {
    const cluster = await db.cluster.findUnique({
      where: { id },
      include: {
        shoots: {
          include: {
            client: true,
            shootType: true,
            location: true,
            teamMembers: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return cluster;
  } catch (error) {
    console.error("Error fetching cluster:", error);
    // Return null if table doesn't exist yet
    return null;
  }
}

export async function updateCluster(id: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      clientId: (formData.get("clientId") as string) || undefined,
      totalCost: (formData.get("totalCost") as string) || undefined,
    };

    const validatedData = updateClusterSchema.parse(rawData);

    const totalCostFloat = validatedData.totalCost
      ? parseFloat(validatedData.totalCost)
      : undefined;

    await db.cluster.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        clientId: validatedData.clientId,
        totalCost: totalCostFloat,
      },
    });

    revalidatePath("/dashboard/clusters");
    revalidatePath(`/dashboard/clusters/${id}`);
  } catch (error) {
    console.error("Error updating cluster:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update cluster",
    );
  }
}

export async function deleteCluster(id: string) {
  try {
    await db.cluster.delete({
      where: { id },
    });

    revalidatePath("/dashboard/clusters");
  } catch (error) {
    console.error("Error deleting cluster:", error);
    throw new Error("Failed to delete cluster");
  }
}
