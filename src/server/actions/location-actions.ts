"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import {
  createLocationSchema,
  updateLocationSchema,
  createLocationPOCSchema,
  updateLocationPOCSchema,
  type CreateLocationFormData,
  type UpdateLocationFormData,
  type CreateLocationPOCFormData,
  type UpdateLocationPOCFormData,
} from "@/lib/validations/client";

// ============ LOCATION ACTIONS ============

export async function createLocation(formData: FormData) {
  try {
    const rawData: CreateLocationFormData = {
      name: formData.get("name") as string,
      address: (formData.get("address") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      state: (formData.get("state") as string) || undefined,
      country: (formData.get("country") as string) || undefined,
      coordinates: (formData.get("coordinates") as string) || undefined,
      clientId: formData.get("clientId") as string,
    };

    const validatedData = createLocationSchema.parse(rawData);

    const location = await db.location.create({
      data: validatedData,
    });

    // Create POC if data is provided
    const pocName = formData.get("pocName") as string;
    const pocPhone = formData.get("pocPhone") as string;
    
    if (pocName && pocPhone) {
      const pocData: CreateLocationPOCFormData = {
        name: pocName,
        phone: pocPhone,
        email: (formData.get("pocEmail") as string) || undefined,
        role: (formData.get("pocRole") as string) || undefined,
        locationId: location.id,
      };

      const validatedPOCData = createLocationPOCSchema.parse(pocData);

      await db.locationPOC.create({
        data: validatedPOCData,
      });
    }

    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${validatedData.clientId}`);
    revalidatePath(`/dashboard/clients/${validatedData.clientId}/locations`);
    return location;
  } catch (error) {
    console.error("Error creating location:", error);

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        throw new Error("A location with this name already exists for this client");
      }
    }

    throw new Error(error instanceof Error ? error.message : "Failed to create location");
  }
}

export async function getLocations() {
  try {
    const locations = await db.location.findMany({
      include: {
        client: true,
        pocs: true,
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

    return locations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw new Error("Failed to fetch locations");
  }
}

export async function getLocationsByClient(clientId: string) {
  try {
    const locations = await db.location.findMany({
      where: { clientId },
      include: {
        pocs: true,
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

    return locations;
  } catch (error) {
    console.error("Error fetching locations for client:", error);
    throw new Error("Failed to fetch locations");
  }
}

export async function getLocationsByEntity(entityId: string) {
  try {
    // First get the entity to find its clientId
    const entity = await db.entity.findUnique({
      where: { id: entityId },
      select: { clientId: true },
    });

    if (!entity) {
      throw new Error("Entity not found");
    }

    // Then get all locations for that client
    const locations = await db.location.findMany({
      where: { clientId: entity.clientId },
      include: {
        pocs: true,
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

    return locations;
  } catch (error) {
    console.error("Error fetching locations by entity:", error);
    throw new Error("Failed to fetch locations");
  }
}

export async function getLocationById(id: string) {
  try {
    const location = await db.location.findUnique({
      where: { id },
      include: {
        client: true,
        pocs: {
          orderBy: {
            name: "asc",
          },
        },
        _count: {
          select: {
            shoots: true,
          },
        },
      },
    });

    if (!location) {
      throw new Error("Location not found");
    }

    return location;
  } catch (error) {
    console.error(`Error fetching location with ID ${id}:`, error);

    if (error instanceof Error && error.message === "Location not found") {
      throw error;
    }

    throw new Error("Failed to fetch location");
  }
}

export async function updateLocation(id: string, formData: FormData) {
  try {
    const rawData: UpdateLocationFormData = {
      name: formData.get("name") as string,
      address: (formData.get("address") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      state: (formData.get("state") as string) || undefined,
      country: (formData.get("country") as string) || undefined,
      coordinates: (formData.get("coordinates") as string) || undefined,
    };

    const validatedData = updateLocationSchema.parse(rawData);

    const location = await db.location.update({
      where: { id },
      data: validatedData,
    });

    // Get the location's client ID for revalidation
    const fullLocation = await db.location.findUnique({
      where: { id },
      select: { clientId: true },
    });

    revalidatePath("/dashboard/clients");
    if (fullLocation) {
      revalidatePath(`/dashboard/clients/${fullLocation.clientId}`);
      revalidatePath(`/dashboard/clients/${fullLocation.clientId}/locations`);
    }
    return location;
  } catch (error) {
    console.error("Error updating location:", error);

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2002") {
        throw new Error("A location with this name already exists for this client");
      }
    }

    throw new Error(error instanceof Error ? error.message : "Failed to update location");
  }
}

export async function deleteLocation(id: string) {
  try {
    // Get the location's client ID before deletion for revalidation
    const location = await db.location.findUnique({
      where: { id },
      select: { clientId: true },
    });

    await db.location.delete({
      where: { id },
    });

    revalidatePath("/dashboard/clients");
    if (location) {
      revalidatePath(`/dashboard/clients/${location.clientId}`);
      revalidatePath(`/dashboard/clients/${location.clientId}/locations`);
    }
  } catch (error) {
    console.error("Error deleting location:", error);

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        throw new Error("Location not found");
      }
      if (error.code === "P2003") {
        throw new Error("Cannot delete location with existing shoots");
      }
    }

    throw new Error("Failed to delete location");
  }
}

// ============ LOCATION POC ACTIONS ============

export async function createLocationPOC(formData: FormData) {
  try {
    const rawData: CreateLocationPOCFormData = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: formData.get("phone") as string,
      role: (formData.get("role") as string) || undefined,
      locationId: formData.get("locationId") as string,
    };

    const validatedData = createLocationPOCSchema.parse(rawData);

    const poc = await db.locationPOC.create({
      data: validatedData,
    });

    // Get the location's client ID for revalidation
    const location = await db.location.findUnique({
      where: { id: validatedData.locationId },
      select: { clientId: true },
    });

    revalidatePath("/dashboard/clients");
    if (location) {
      revalidatePath(`/dashboard/clients/${location.clientId}`);
      revalidatePath(`/dashboard/clients/${location.clientId}/locations`);
    }
    return poc;
  } catch (error) {
    console.error("Error creating location POC:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create POC");
  }
}

export async function getPOCsByLocation(locationId: string) {
  try {
    const pocs = await db.locationPOC.findMany({
      where: { locationId },
      orderBy: {
        name: "asc",
      },
    });

    return pocs;
  } catch (error) {
    console.error("Error fetching POCs for location:", error);
    throw new Error("Failed to fetch POCs");
  }
}

export async function getLocationPOCById(id: string) {
  try {
    const poc = await db.locationPOC.findUnique({
      where: { id },
      include: {
        location: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!poc) {
      throw new Error("POC not found");
    }

    return poc;
  } catch (error) {
    console.error(`Error fetching POC with ID ${id}:`, error);

    if (error instanceof Error && error.message === "POC not found") {
      throw error;
    }

    throw new Error("Failed to fetch POC");
  }
}

export async function updateLocationPOC(id: string, formData: FormData) {
  try {
    const rawData: UpdateLocationPOCFormData = {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || undefined,
      phone: formData.get("phone") as string,
      role: (formData.get("role") as string) || undefined,
    };

    const validatedData = updateLocationPOCSchema.parse(rawData);

    const poc = await db.locationPOC.update({
      where: { id },
      data: validatedData,
    });

    // Get the POC's location and client for revalidation
    const fullPOC = await db.locationPOC.findUnique({
      where: { id },
      include: {
        location: {
          select: { clientId: true },
        },
      },
    });

    revalidatePath("/dashboard/clients");
    if (fullPOC) {
      revalidatePath(`/dashboard/clients/${fullPOC.location.clientId}`);
      revalidatePath(`/dashboard/clients/${fullPOC.location.clientId}/locations`);
    }
    return poc;
  } catch (error) {
    console.error("Error updating location POC:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update POC");
  }
}

export async function deleteLocationPOC(id: string) {
  try {
    // Get the POC's location and client before deletion for revalidation
    const poc = await db.locationPOC.findUnique({
      where: { id },
      include: {
        location: {
          select: { clientId: true },
        },
      },
    });

    await db.locationPOC.delete({
      where: { id },
    });

    revalidatePath("/dashboard/clients");
    if (poc) {
      revalidatePath(`/dashboard/clients/${poc.location.clientId}`);
      revalidatePath(`/dashboard/clients/${poc.location.clientId}/locations`);
    }
  } catch (error) {
    console.error("Error deleting location POC:", error);

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        throw new Error("POC not found");
      }
    }

    throw new Error("Failed to delete POC");
  }
}
