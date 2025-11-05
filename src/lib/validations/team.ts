import { z } from "zod";

export const createTeamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")), // Non-compulsory
  phone: z.string().min(1, "Phone is required"), // Compulsory
  password: z.string().optional(), // Non-compulsory
  roles: z.array(z.enum(["admin", "photographer", "editor"])).min(1, "At least one role is required"),
  specialties: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
});

export const updateTeamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  password: z.string().optional(), // Only include if changing password
  roles: z.array(z.enum(["admin", "photographer", "editor"])).min(1, "At least one role is required"),
  specialties: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  isActive: z.boolean().optional(),
});

export type CreateTeamMemberFormData = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberFormData = z.infer<typeof updateTeamMemberSchema>;

// Specialties aligned with shoot types (no edit-specific ones)
export const TEAM_SPECIALTIES = [
  "Real Estate",
  "Drone Photography",
  "Event",
  "Virtual Tours",
  "Podcasts",
  "Portrait Photography",
  "Landscape Photography",
  "Wedding Photography",
  "Commercial Photography",
  "Product Photography",
] as const;

