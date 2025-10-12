import { z } from "zod";

export const createShootSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  shootTypeId: z.string().min(1, "Shoot type is required"),
  locationId: z.string().optional(),
  projectName: z.string().optional(),
  remarks: z.string().optional(),
  editId: z.string().optional(),
  overallDeliverables: z.string().optional(),
  shootStartDate: z.string().optional(),
  shootEndDate: z.string().optional(),
  photographerNotes: z.string().optional(),
  editorNotes: z.string().optional(),
  // Cost tracking fields
  photographyCost: z.string().optional(), // Will be converted to Float on server
  travelCost: z.string().optional(), // Will be converted to Float on server
  editingCost: z.string().optional(), // Will be converted to Float on server
  photographerIds: z.array(z.string()).optional(),
  editorIds: z.array(z.string()).optional(),
});

export const updateShootSchema = z.object({
  shootId: z.string().min(1, "Shoot ID is required"), // Allow editing of shoot ID
  clientId: z.string().min(1, "Client is required"),
  shootTypeId: z.string().min(1, "Shoot type is required"),
  locationId: z.string().optional(),
  projectName: z.string().optional(),
  remarks: z.string().optional(),
  editId: z.string().optional(),
  overallDeliverables: z.string().optional(),
  shootStartDate: z.string().optional(),
  shootEndDate: z.string().optional(),
  photographerNotes: z.string().optional(),
  editorNotes: z.string().optional(),
  // Cost tracking fields
  photographyCost: z.string().optional(),
  travelCost: z.string().optional(),
  editingCost: z.string().optional(),
  photographerIds: z.array(z.string()).optional(),
  editorIds: z.array(z.string()).optional(),
});

export type CreateShootFormData = z.infer<typeof createShootSchema>;
export type UpdateShootFormData = z.infer<typeof updateShootSchema>;
