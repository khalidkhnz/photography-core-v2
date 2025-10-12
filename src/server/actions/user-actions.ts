"use server";

import { db } from "@/server/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw new Error("Not authenticated");
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        roles: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw new Error("Failed to fetch user information");
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw new Error("Not authenticated");
    }

    const name = formData.get("name") as string;

    if (!name) {
      throw new Error("Name is required");
    }

    // Update user (email cannot be changed)
    await db.user.update({
      where: { email: session.user.email },
      data: {
        name,
      },
    });

    revalidatePath("/dashboard/settings");

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update profile",
    );
  }
}

export async function changePassword(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw new Error("Not authenticated");
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error("All password fields are required");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("New passwords do not match");
    }

    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.password) {
      throw new Error("User not found or using OAuth authentication");
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.user.update({
      where: { email: session.user.email },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error changing password:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to change password",
    );
  }
}

// ========== TEAM MEMBER MANAGEMENT ==========

export async function getTeamMembers(roleFilter?: string[]) {
  try {
    const where = roleFilter
      ? {
          OR: roleFilter.map((role) => ({
            roles: {
              has: role,
            },
          })),
        }
      : {};

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        specialties: true,
        rating: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

export async function getTeamMemberById(id: string) {
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        roles: true,
        specialties: true,
        rating: true,
        isActive: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        shootAssignments: {
          include: {
            shoot: {
              include: {
                client: true,
                shootType: true,
              },
            },
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching team member:", error);
    return null;
  }
}

export async function createTeamMember(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || undefined;
    const password = formData.get("password") as string;
    const roles = formData.getAll("roles") as string[];
    const specialties = formData.getAll("specialties") as string[];
    const rating = formData.get("rating") as string;

    if (!name) {
      throw new Error("Name is required");
    }

    if (!email) {
      throw new Error("Email is required");
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    if (!roles || roles.length === 0) {
      throw new Error("At least one role is required");
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("Email is already in use");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        roles,
        specialties,
        rating: rating ? parseFloat(rating) : 0,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/team");
  } catch (error) {
    console.error("Error creating team member:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to create team member",
    );
  }

  redirect("/dashboard/team");
}

export async function updateTeamMember(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || undefined;
    const roles = formData.getAll("roles") as string[];
    const specialties = formData.getAll("specialties") as string[];
    const rating = formData.get("rating") as string;
    const isActive = formData.get("isActive") === "true";

    if (!name) {
      throw new Error("Name is required");
    }

    if (!email) {
      throw new Error("Email is required");
    }

    if (!roles || roles.length === 0) {
      throw new Error("At least one role is required");
    }

    // Check if email is taken by another user
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== id) {
      throw new Error("Email is already in use");
    }

    // Update user
    await db.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        roles,
        specialties,
        rating: rating ? parseFloat(rating) : 0,
        isActive,
      },
    });

    revalidatePath("/dashboard/team");
    revalidatePath(`/dashboard/team/${id}`);
  } catch (error) {
    console.error("Error updating team member:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update team member",
    );
  }
}

export async function deleteTeamMember(id: string) {
  try {
    // Check if user has the admin role
    const user = await db.user.findUnique({
      where: { id },
      select: { roles: true },
    });

    if (user?.roles?.includes("admin")) {
      throw new Error("Cannot delete admin users");
    }

    await db.user.delete({
      where: { id },
    });

    revalidatePath("/dashboard/team");
  } catch (error) {
    console.error("Error deleting team member:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete team member",
    );
  }
}

export async function toggleTeamMemberStatus(id: string, isActive: boolean) {
  try {
    await db.user.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/dashboard/team");
    revalidatePath(`/dashboard/team/${id}`);
  } catch (error) {
    console.error("Error toggling team member status:", error);
    throw new Error("Failed to update team member status");
  }
}
