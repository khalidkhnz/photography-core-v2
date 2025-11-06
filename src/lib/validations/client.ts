import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  address: z.string().optional(),
  // Main POC details (from client's side)
  pocName: z.string().optional(),
  pocEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  pocPhone: z.string().optional(),
});

export const updateClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  address: z.string().optional(),
  pocName: z.string().optional(),
  pocEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  pocPhone: z.string().optional(),
});

export const createEntitySchema = z.object({
  name: z.string().min(1, "Entity name is required"),
  clientId: z.string().min(1, "Client ID is required"),
});

export const updateEntitySchema = z.object({
  name: z.string().min(1, "Entity name is required"),
});

export const createLocationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  coordinates: z.string().optional(),
  clientId: z.string().min(1, "Client ID is required"),
});

export const updateLocationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  coordinates: z.string().optional(),
});

export const createLocationPOCSchema = z.object({
  name: z.string().min(1, "POC name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  role: z.string().optional(),
  locationId: z.string().min(1, "Location ID is required"),
});

export const updateLocationPOCSchema = z.object({
  name: z.string().min(1, "POC name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  role: z.string().optional(),
});

export type CreateClientFormData = z.infer<typeof createClientSchema>;
export type UpdateClientFormData = z.infer<typeof updateClientSchema>;
export type CreateEntityFormData = z.infer<typeof createEntitySchema>;
export type UpdateEntityFormData = z.infer<typeof updateEntitySchema>;
export type CreateLocationFormData = z.infer<typeof createLocationSchema>;
export type UpdateLocationFormData = z.infer<typeof updateLocationSchema>;
export type CreateLocationPOCFormData = z.infer<typeof createLocationPOCSchema>;
export type UpdateLocationPOCFormData = z.infer<typeof updateLocationPOCSchema>;

