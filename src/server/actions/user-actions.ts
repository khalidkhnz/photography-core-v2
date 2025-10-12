"use server";

import { db } from "@/server/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
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
        role: true,
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
