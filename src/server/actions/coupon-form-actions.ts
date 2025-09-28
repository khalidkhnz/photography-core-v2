"use server";

import { createCoupon, updateCoupon } from "./coupon-actions";
import { redirect } from "next/navigation";

export async function createCouponAction(formData: FormData) {
  const result = await createCoupon(formData);

  if (result.success) {
    redirect("/dashboard/coupons");
  } else {
    throw new Error(result.error ?? "Failed to create coupon");
  }
}

export async function updateCouponAction(id: string, formData: FormData) {
  const result = await updateCoupon(id, formData);

  if (result.success) {
    redirect(`/dashboard/coupons/${id}`);
  } else {
    throw new Error(result.error ?? "Failed to update coupon");
  }
}
