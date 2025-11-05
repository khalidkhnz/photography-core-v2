"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import {
  createClientSchema,
  updateClientSchema,
  createEntitySchema,
  updateEntitySchema,
  type CreateClientFormData,
  type UpdateClientFormData,
  type CreateEntityFormData,
} from "@/lib/validations/client";

// ============ CLIENT ACTIONS ============

export async function createClient(formData: FormData) {
  try {
    const rawData: CreateClientFormData = {
      name: formData.get("name") as string,
      address: (formData.get("address") as string) || undefined,
      pocName: (formData.get("pocName") as string) || undefined,
      pocEmail: (formData.get("pocEmail") as string) || undefined,
      pocPhone: (formData.get("pocPhone") as string) || undefined,
    };

    const validatedData = createClientSchema.parse(rawData);

    const client = await db.client.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    return client;
  } catch (error) {
    console.error("Error creating client:", error);

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        throw new Error("A client with this name already exists");
      }
    }

    throw new Error(error instanceof Error ? error.message : "Failed to create client");
  }
}

export async function getClients() {
  try {
    const clients = await db.client.findMany({
      include: {
        entities: {
          orderBy: { name: "asc" },
        },
        locations: {
          include: {
            pocs: true,
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: {
            shoots: true,
            entities: true,
            locations: true,
          },
        },
      },
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

export async function getClientById(id: string) {
  try {
    const client = await db.client.findUnique({
      where: { id },
      include: {
        entities: {
          orderBy: { name: "asc" },
        },
        locations: {
          include: {
            pocs: true,
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: {
            shoots: true,
            entities: true,
            locations: true,
          },
        },
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    return client;
  } catch (error) {
    console.error(`Error fetching client with ID ${id}:`, error);

    if (error instanceof Error && error.message === "Client not found") {
      throw error;
    }

    throw new Error("Failed to fetch client");
  }
}

export async function updateClient(id: string, formData: FormData) {
  try {
    const rawData: UpdateClientFormData = {
      name: formData.get("name") as string,
      address: (formData.get("address") as string) || undefined,
      pocName: (formData.get("pocName") as string) || undefined,
      pocEmail: (formData.get("pocEmail") as string) || undefined,
      pocPhone: (formData.get("pocPhone") as string) || undefined,
    };

    const validatedData = updateClientSchema.parse(rawData);

    const client = await db.client.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${id}`);
    return client;
  } catch (error) {
    console.error("Error updating client:", error);

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        throw new Error("Client not found");
      }
      if (error.code === "P2002") {
        throw new Error("A client with this name already exists");
      }
    }

    throw new Error(error instanceof Error ? error.message : "Failed to update client");
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

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        throw new Error("Client not found");
      }
      if (error.code === "P2003") {
        throw new Error("Cannot delete client with existing shoots");
      }
    }

    throw new Error("Failed to delete client");
  }
}

// ============ ENTITY ACTIONS ============

export async function createEntity(formData: FormData) {
  try {
    const rawData: CreateEntityFormData = {
      name: formData.get("name") as string,
      clientId: formData.get("clientId") as string,
    };

    const validatedData = createEntitySchema.parse(rawData);

    const entity = await db.entity.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${validatedData.clientId}`);
    return entity;
  } catch (error) {
    console.error("Error creating entity:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create entity");
  }
}

export async function getEntitiesByClient(clientId: string) {
  try {
    const entities = await db.entity.findMany({
      where: { clientId },
      orderBy: { name: "asc" },
    });

    return entities;
  } catch (error) {
    console.error("Error fetching entities:", error);
    throw new Error("Failed to fetch entities");
  }
}

export async function getEntitiesByClientForShoot(clientId: string) {
  try {
    const entities = await db.entity.findMany({
      where: { clientId },
      orderBy: { name: "asc" },
    });

    return entities;
  } catch (error) {
    console.error("Error fetching entities for shoot:", error);
    throw new Error("Failed to fetch entities");
  }
}

export async function getEntityById(id: string) {
  try {
    const entity = await db.entity.findUnique({
      where: { id },
      include: {
        client: true,
        _count: {
          select: {
            shoots: true,
          },
        },
      },
    });

    if (!entity) {
      throw new Error("Entity not found");
    }

    return entity;
  } catch (error) {
    console.error(`Error fetching entity with ID ${id}:`, error);

    if (error instanceof Error && error.message === "Entity not found") {
      throw error;
    }

    throw new Error("Failed to fetch entity");
  }
}

export async function updateEntity(id: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
    };

    const validatedData = updateEntitySchema.parse(rawData);

    const entity = await db.entity.update({
      where: { id },
      data: validatedData,
    });

    // Get the entity's client ID for revalidation
    const fullEntity = await db.entity.findUnique({
      where: { id },
      select: { clientId: true },
    });

    revalidatePath("/dashboard/clients");
    if (fullEntity) {
      revalidatePath(`/dashboard/clients/${fullEntity.clientId}`);
    }
    return entity;
  } catch (error) {
    console.error("Error updating entity:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update entity");
  }
}

export async function deleteEntity(id: string) {
  try {
    // Get the entity's client ID before deletion for revalidation
    const entity = await db.entity.findUnique({
      where: { id },
      select: { clientId: true },
    });

    await db.entity.delete({
      where: { id },
    });

    revalidatePath("/dashboard/clients");
    if (entity) {
      revalidatePath(`/dashboard/clients/${entity.clientId}`);
    }
  } catch (error) {
    console.error("Error deleting entity:", error);

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        throw new Error("Entity not found");
      }
      if (error.code === "P2003") {
        throw new Error("Cannot delete entity with existing shoots");
      }
    }

    throw new Error("Failed to delete entity");
  }
}
