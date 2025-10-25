"use server";

import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  poc: z.string().optional(),
});

const createEntitySchema = z.object({
  name: z.string().min(1, "Entity name is required"),
  clientId: z.string().min(1, "Client ID is required"),
});

const createSiteSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  address: z.string().optional(),
  entityId: z.string().min(1, "Entity ID is required"),
});

const createPOCSchema = z.object({
  name: z.string().min(1, "POC name is required"),
  email: z.string().email().optional(),
  phone: z.string().min(1, "Phone is required"),
  role: z.string().optional(),
  siteId: z.string().min(1, "Site ID is required"),
});

export async function createClient(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      poc: (formData.get("poc") as string) || undefined,
    };

    const validatedData = createClientSchema.parse(rawData);

    const client = await db.client.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    return client;
  } catch (error) {
    console.error("Error creating client:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        throw new Error("A client with this name already exists");
      }
    }
    
    throw new Error(
      error instanceof Error ? error.message : "Failed to create client",
    );
  }
}

export async function getClients() {
  try {
    // Try to fetch with new structure first
    try {
      const clients = await db.client.findMany({
        include: {
          entities: {
            include: {
              sites: {
                include: {
                  pocs: true,
                  locations: true,
                },
              },
            },
          },
          locations: {
            orderBy: { name: "asc" },
          },
          _count: {
            select: {
              shoots: true,
              entities: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return clients;
    } catch {
      // Fallback to old structure if new fields don't exist
      console.log("New schema not available, using fallback structure");
      const clients = await db.client.findMany({
        include: {
          locations: {
            orderBy: { name: "asc" },
          },
          _count: {
            select: {
              shoots: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      // Transform to match expected structure
      return clients.map(client => ({
        ...client,
        entities: [],
        _count: {
          ...client._count,
          entities: 0,
        },
      }));
    }
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
        locations: {
          orderBy: { name: "asc" },
        },
        _count: {
          select: {
            shoots: true,
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
    const rawData = {
      name: formData.get("name") as string,
    };

    const validatedData = createClientSchema.parse(rawData);

    const client = await db.client.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    return client;
  } catch (error) {
    console.error("Error updating client:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        throw new Error("Client not found");
      }
      if (error.code === 'P2002') {
        throw new Error("A client with this name already exists");
      }
    }
    
    throw new Error(
      error instanceof Error ? error.message : "Failed to update client",
    );
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
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        throw new Error("Client not found");
      }
      if (error.code === 'P2003') {
        throw new Error("Cannot delete client with associated shoots or locations");
      }
    }
    
    throw new Error("Failed to delete client");
  }
}

// Entity Management
export async function createEntity(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      clientId: formData.get("clientId") as string,
    };

    const validatedData = createEntitySchema.parse(rawData);

    const entity = await db.entity.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    return entity;
  } catch (error) {
    console.error("Error creating entity:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        throw new Error("An entity with this name already exists for this client");
      }
      if (error.code === 'P2003') {
        throw new Error("Client not found");
      }
    }
    
    throw new Error(
      error instanceof Error ? error.message : "Failed to create entity",
    );
  }
}

export async function getEntitiesByClient(clientId: string) {
  try {
    const entities = await db.entity.findMany({
      where: { clientId },
      include: {
        sites: {
          include: {
            pocs: true,
            locations: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return entities;
  } catch (error) {
    console.error("Error fetching entities:", error);
    
    // If entities table doesn't exist yet, return empty array
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') {
      console.log("Entities table not available yet, returning empty array");
      return [];
    }
    
    throw new Error("Failed to fetch entities");
  }
}

export async function getEntityById(id: string) {
  try {
    const entity = await db.entity.findUnique({
      where: { id },
      include: {
        client: true,
        sites: {
          include: {
            pocs: true,
            locations: true,
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

    const validatedData = createEntitySchema.parse(rawData);

    const entity = await db.entity.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    return entity;
  } catch (error) {
    console.error("Error updating entity:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        throw new Error("Entity not found");
      }
      if (error.code === 'P2002') {
        throw new Error("An entity with this name already exists for this client");
      }
    }
    
    throw new Error(
      error instanceof Error ? error.message : "Failed to update entity",
    );
  }
}

export async function deleteEntity(id: string) {
  try {
    await db.entity.delete({
      where: { id },
    });

    revalidatePath("/dashboard/clients");
  } catch (error) {
    console.error("Error deleting entity:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        throw new Error("Entity not found");
      }
      if (error.code === 'P2003') {
        throw new Error("Cannot delete entity with associated sites");
      }
    }
    
    throw new Error("Failed to delete entity");
  }
}

// Site Management
export async function createSite(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      address: (formData.get("address") as string) || undefined,
      entityId: formData.get("entityId") as string,
    };

    const validatedData = createSiteSchema.parse(rawData);

    const site = await db.site.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    return site;
  } catch (error) {
    console.error("Error creating site:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create site",
    );
  }
}

export async function getSitesByEntity(entityId: string) {
  try {
    const sites = await db.site.findMany({
      where: { entityId },
      include: {
        pocs: true,
        locations: true,
      },
      orderBy: { name: "asc" },
    });

    return sites;
  } catch (error) {
    console.error("Error fetching sites:", error);
    
    // If sites table doesn't exist yet, return empty array
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') {
      console.log("Sites table not available yet, returning empty array");
      return [];
    }
    
    throw new Error("Failed to fetch sites");
  }
}

// POC Management
export async function createPOC(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: formData.get("phone") as string,
      role: (formData.get("role") as string) || undefined,
      siteId: formData.get("siteId") as string,
    };

    const validatedData = createPOCSchema.parse(rawData);

    const poc = await db.pOC.create({
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    return poc;
  } catch (error) {
    console.error("Error creating POC:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create POC",
    );
  }
}

export async function getPOCsBySite(siteId: string) {
  try {
    const pocs = await db.pOC.findMany({
      where: { siteId },
      orderBy: { name: "asc" },
    });

    return pocs;
  } catch (error) {
    console.error("Error fetching POCs:", error);
    
    // If POCs table doesn't exist yet, return empty array
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2021') {
      console.log("POCs table not available yet, returning empty array");
      return [];
    }
    
    throw new Error("Failed to fetch POCs");
  }
}

export async function updateSite(id: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      address: (formData.get("address") as string) || undefined,
    };

    const validatedData = createSiteSchema.parse(rawData);

    const site = await db.site.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    return site;
  } catch (error) {
    console.error("Error updating site:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        throw new Error("Site not found");
      }
    }
    
    throw new Error(
      error instanceof Error ? error.message : "Failed to update site",
    );
  }
}

export async function updatePOC(id: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: formData.get("phone") as string,
      role: (formData.get("role") as string) || undefined,
    };

    const validatedData = createPOCSchema.parse(rawData);

    const poc = await db.pOC.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/dashboard/clients");
    return poc;
  } catch (error) {
    console.error("Error updating POC:", error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2025') {
        throw new Error("POC not found");
      }
    }
    
    throw new Error(
      error instanceof Error ? error.message : "Failed to update POC",
    );
  }
}

// Helper functions for shoot creation
export async function getEntitiesByClientForShoot(clientId: string) {
  try {
    const entities = await db.entity.findMany({
      where: { clientId },
      include: {
        sites: {
          include: {
            pocs: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return entities;
  } catch (error) {
    console.error("Error fetching entities for shoot:", error);
    throw new Error("Failed to fetch entities");
  }
}

export async function getSitesByEntityForShoot(entityId: string) {
  try {
    const sites = await db.site.findMany({
      where: { entityId },
      include: {
        pocs: true,
      },
      orderBy: { name: "asc" },
    });

    return sites;
  } catch (error) {
    console.error("Error fetching sites for shoot:", error);
    throw new Error("Failed to fetch sites");
  }
}

export async function getPOCsBySiteForShoot(siteId: string) {
  try {
    const pocs = await db.pOC.findMany({
      where: { siteId },
      orderBy: { name: "asc" },
    });

    return pocs;
  } catch (error) {
    console.error("Error fetching POCs for shoot:", error);
    throw new Error("Failed to fetch POCs");
  }
}
