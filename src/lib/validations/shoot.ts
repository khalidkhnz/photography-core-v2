import { z } from "zod";

export const createShootSchema = z.object({
  shootId: z.string().min(1, "Shoot ID is required"),
  clientId: z.string().min(1, "Client is required"),
  entityId: z.string().optional(),
  locationId: z.string().optional(),
  clusterId: z.string().optional(),
  shootTypeId: z.string().min(1, "Shoot type is required"),
  projectName: z.string().optional(),
  remarks: z.string().optional(),
  overallDeliverables: z.string().optional(),
  
  // Date/Time fields - single shoot date with times
  scheduledShootDate: z.string().optional(),
  reportingTime: z.string().optional(),
  wrapUpTime: z.string().optional(),
  
  photographerNotes: z.string().optional(),
  workflowType: z.enum(["shift", "project", "cluster"]).optional(),
  
  // Cost tracking fields (shoot only, edit costs are in Edit table)
  shootCost: z.string().optional(), // Will be converted to Float on server
  travelCost: z.string().optional(), // Will be converted to Float on server
  shootCostStatus: z.enum(["paid", "unpaid", "onhold"]).optional(),
  travelCostStatus: z.enum(["paid", "unpaid", "onhold"]).optional(),
  overallCost: z.string().optional(), // For project-level shoots
  overallCostStatus: z.enum(["paid", "unpaid", "onhold"]).optional(),
  clusterCostOverride: z.string().optional(), // Manual cost override for cluster shoots
  
  // DOP and Executors
  dopId: z.string().optional(), // Single DOP (Director of Photography)
  executorIds: z.array(z.string()).optional(), // Multiple executors
  
  // Edit IDs - multiple edits can be linked
  editIds: z.array(z.string()).optional(),
});

export const updateShootSchema = z.object({
  shootId: z.string().min(1, "Shoot ID is required"),
  clientId: z.string().min(1, "Client is required"),
  entityId: z.string().optional().nullable().or(z.literal("")),
  locationId: z.string().optional().nullable().or(z.literal("")),
  clusterId: z.string().optional().nullable().or(z.literal("")),
  shootTypeId: z.string().min(1, "Shoot type is required"),
  projectName: z.string().optional().or(z.literal("")),
  remarks: z.string().optional().or(z.literal("")),
  overallDeliverables: z.string().optional().or(z.literal("")),
  
  // Date/Time fields
  scheduledShootDate: z.string().optional().or(z.literal("")),
  reportingTime: z.string().optional().or(z.literal("")),
  wrapUpTime: z.string().optional().or(z.literal("")),
  
  photographerNotes: z.string().optional().or(z.literal("")),
  workflowType: z.enum(["shift", "project", "cluster"]).optional(),
  
  // Cost tracking fields
  shootCost: z.string().optional().or(z.literal("")),
  travelCost: z.string().optional().or(z.literal("")),
  shootCostStatus: z.enum(["paid", "unpaid", "onhold"]).optional().nullable(),
  travelCostStatus: z.enum(["paid", "unpaid", "onhold"]).optional().nullable(),
  overallCost: z.string().optional().or(z.literal("")),
  overallCostStatus: z.enum(["paid", "unpaid", "onhold"]).optional().nullable(),
  clusterCostOverride: z.string().optional().or(z.literal("")),
  
  // DOP and Executors
  dopId: z.string().optional().or(z.literal("")),
  executorIds: z.array(z.string()),
  
  // Edit IDs
  editIds: z.array(z.string()),
});

export const createEditSchema = z.object({
  editId: z.string().min(1, "Edit ID is required"),
  shootId: z.string().optional(), // Can be linked to shoot or exist independently
  clusterId: z.string().optional(), // Can be linked to cluster
  deliverables: z.string().optional(),
  editDeliveryDate: z.string().optional(),
  editorNotes: z.string().optional(),
  editCost: z.string().optional(),
  editCostStatus: z.enum(["paid", "unpaid", "onhold"]).optional(),
  editorIds: z.array(z.string()).optional(), // Team assigned to this edit
});

export const updateEditSchema = z.object({
  editId: z.string().min(1, "Edit ID is required"),
  shootId: z.string().nullable().optional(),
  clusterId: z.string().nullable().optional(),
  deliverables: z.string().optional(),
  editDeliveryDate: z.string().optional(),
  editorNotes: z.string().optional(),
  editCost: z.string().optional(),
  editCostStatus: z.enum(["paid", "unpaid", "onhold"]).optional(),
  editorIds: z.array(z.string()).optional(),
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

// Type exports
export type CreateShootFormData = z.infer<typeof createShootSchema>;
export type UpdateShootFormData = z.infer<typeof updateShootSchema>;
export type CreateEditFormData = z.infer<typeof createEditSchema>;
export type UpdateEditFormData = z.infer<typeof updateEditSchema>;
export type CreateClusterFormData = z.infer<typeof createClusterSchema>;
export type UpdateClusterFormData = z.infer<typeof updateClusterSchema>;
