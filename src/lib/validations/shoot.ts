import { z } from "zod";

export const createShootSchema = z.object({
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
  workflowType: z.enum(["shift", "project", "cluster"]).optional(),
  // Cost tracking fields
  photographyCost: z.string().optional(), // Will be converted to Float on server
  travelCost: z.string().optional(), // Will be converted to Float on server
  editingCost: z.string().optional(), // Will be converted to Float on server
  photographerIds: z.array(z.string()).optional(),
  editorIds: z.array(z.string()).optional(),
  executorId: z.string().optional(), // The person who completed the shoot
  poc: z.string().optional(), // Point of Contact for the shoot
});

export const updateShootSchema = z.object({
  shootId: z.string().min(1, "Shoot ID is required"), // Allow editing of shoot ID
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
  workflowType: z.enum(["shift", "project", "cluster"]).optional(),
  // Cost tracking fields
  photographyCost: z.string().optional(),
  travelCost: z.string().optional(),
  editingCost: z.string().optional(),
  photographerIds: z.array(z.string()).optional(),
  editorIds: z.array(z.string()).optional(),
  executorId: z.string().optional(), // The person who completed the shoot
  poc: z.string().optional(), // Point of Contact for the shoot
});

export const createClusterSchema = z.object({
  name: z.string().min(1, "Cluster name is required"),
  description: z.string().optional(),
  clientId: z.string().optional(),
  totalCost: z.string().optional(),
});

export const updateClusterSchema = z.object({
  name: z.string().min(1, "Cluster name is required"),
  description: z.string().optional(),
  clientId: z.string().optional(),
  totalCost: z.string().optional(),
});

export type CreateShootFormData = z.infer<typeof createShootSchema>;
export type UpdateShootFormData = z.infer<typeof updateShootSchema>;
export type CreateClusterFormData = z.infer<typeof createClusterSchema>;
export type UpdateClusterFormData = z.infer<typeof updateClusterSchema>;
