"use server";

import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createCouponSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(20, "Code must be 20 characters or less"),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed"], {
    required_error: "Type is required",
  }),
  value: z.number().min(0, "Value must be positive"),
  minAmount: z.number().min(0, "Minimum amount must be positive").optional(),
  maxUses: z.number().min(1, "Max uses must be at least 1").optional(),
  validFrom: z.string().min(1, "Valid from date is required"),
  validUntil: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function createCoupon(formData: FormData) {
  try {
    const rawData = {
      code: (formData.get("code") as string)?.toUpperCase() || undefined,
      description: (formData.get("description") as string) || undefined,
      type: formData.get("type") as string,
      value: parseFloat(formData.get("value") as string) || 0,
      minAmount: formData.get("minAmount")
        ? parseFloat(formData.get("minAmount") as string)
        : undefined,
      maxUses: formData.get("maxUses")
        ? parseInt(formData.get("maxUses") as string)
        : undefined,
      validFrom: formData.get("validFrom") as string,
      validUntil: (formData.get("validUntil") as string) || undefined,
      isActive: formData.get("isActive") === "true",
    };

    const validatedData = createCouponSchema.parse(rawData);

    // Validate percentage values
    if (validatedData.type === "percentage" && validatedData.value > 100) {
      throw new Error("Percentage value cannot exceed 100%");
    }

    const coupon = await db.coupon.create({
      data: {
        ...validatedData,
        validFrom: new Date(validatedData.validFrom),
        validUntil: validatedData.validUntil
          ? new Date(validatedData.validUntil)
          : undefined,
      },
    });

    revalidatePath("/dashboard/coupons");
    return { success: true, coupon };
  } catch (error) {
    console.error("Error creating coupon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create coupon",
    };
  }
}

export async function getCoupons() {
  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return coupons;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
}

export async function getCouponById(id: string) {
  try {
    const coupon = await db.coupon.findUnique({
      where: { id },
    });
    return coupon;
  } catch (error) {
    console.error(`Error fetching coupon with ID ${id}:`, error);
    return null;
  }
}

export async function updateCoupon(id: string, formData: FormData) {
  try {
    const rawData = {
      code: (formData.get("code") as string)?.toUpperCase() || undefined,
      description: (formData.get("description") as string) || undefined,
      type: formData.get("type") as string,
      value: parseFloat(formData.get("value") as string) || 0,
      minAmount: formData.get("minAmount")
        ? parseFloat(formData.get("minAmount") as string)
        : undefined,
      maxUses: formData.get("maxUses")
        ? parseInt(formData.get("maxUses") as string)
        : undefined,
      validFrom: formData.get("validFrom") as string,
      validUntil: (formData.get("validUntil") as string) || undefined,
      isActive: formData.get("isActive") === "true",
    };

    const validatedData = createCouponSchema.parse(rawData);

    // Validate percentage values
    if (validatedData.type === "percentage" && validatedData.value > 100) {
      throw new Error("Percentage value cannot exceed 100%");
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: {
        ...validatedData,
        validFrom: new Date(validatedData.validFrom),
        validUntil: validatedData.validUntil
          ? new Date(validatedData.validUntil)
          : undefined,
      },
    });

    revalidatePath("/dashboard/coupons");
    revalidatePath(`/dashboard/coupons/${id}`);
    return { success: true, coupon };
  } catch (error) {
    console.error("Error updating coupon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update coupon",
    };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await db.coupon.delete({
      where: { id },
    });
    revalidatePath("/dashboard/coupons");
    return { success: true };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete coupon",
    };
  }
}

export async function incrementCouponUsage(id: string) {
  try {
    const coupon = await db.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    if (!coupon.isActive) {
      throw new Error("Coupon is not active");
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new Error("Coupon usage limit exceeded");
    }

    const now = new Date();
    if (
      now < coupon.validFrom ||
      (coupon.validUntil && now > coupon.validUntil)
    ) {
      throw new Error("Coupon is not valid at this time");
    }

    await db.coupon.update({
      where: { id },
      data: {
        usedCount: coupon.usedCount + 1,
      },
    });

    revalidatePath("/dashboard/coupons");
    return { success: true };
  } catch (error) {
    console.error("Error incrementing coupon usage:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to increment coupon usage",
    };
  }
}
