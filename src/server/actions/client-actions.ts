"use server";

import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export async function createClient(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
    };

    const validatedData = createClientSchema.parse(rawData);

    const client = await db.client.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    return client;
  } catch (error) {
    console.error("Error creating client:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create client",
    );
  }
}

export async function getClients() {
  try {
    const clients = await db.client.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw new Error("Failed to fetch clients");
  }
}

export async function deleteClient(id: string) {
  try {
    await db.client.delete({
      where: { id },
    });

    revalidatePath("/dashboard/clients");
  } catch (error) {
    console.error("Error deleting client:", error);
    throw new Error("Failed to delete client");
  }
}
