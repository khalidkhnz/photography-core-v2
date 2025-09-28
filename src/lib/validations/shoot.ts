import { z } from "zod";

export const createShootSchema = z.object({
  shootId: z.string().min(1, "Shoot ID is required"),
  clientId: z.string().min(1, "Client is required"),
  shootTypeId: z.string().min(1, "Shoot type is required"),
  locationId: z.string().optional(),
  overallDeliverables: z.string().optional(),
  shootStartDate: z.string().optional(),
  shootEndDate: z.string().optional(),
  photographerNotes: z.string().optional(),
  editorNotes: z.string().optional(),
  photographerIds: z.array(z.string()).optional(),
  editorIds: z.array(z.string()).optional(),
});

export type CreateShootFormData = z.infer<typeof createShootSchema>;
