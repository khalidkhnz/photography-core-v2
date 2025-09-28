import { getCouponById } from "@/server/actions/coupon-actions";
import { updateCouponAction } from "@/server/actions/coupon-form-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EditCouponPageProps {
  params: { id: string };
}

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const coupon = await getCouponById(params.id);

  if (!coupon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/coupons/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Coupon</h1>
          <p className="text-muted-foreground">
            Update the details for {coupon.code}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
          <CardDescription>
            Update the details for this discount coupon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={(formData) => updateCouponAction(params.id, formData)}
            className="space-y-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={coupon.code}
                  required
                  className="uppercase"
                />
                <p className="text-muted-foreground text-xs">
                  Enter a unique code for this coupon
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Discount Type *</Label>
                <Select name="type" defaultValue={coupon.type} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={coupon.description || ""}
                placeholder="Brief description of this coupon"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value">Discount Value *</Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={coupon.value}
                  required
                />
                <p className="text-muted-foreground text-xs">
                  Enter percentage (0-100) or fixed amount
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minAmount">Minimum Order Amount</Label>
                <Input
                  id="minAmount"
                  name="minAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={coupon.minAmount || ""}
                />
                <p className="text-muted-foreground text-xs">
                  Minimum order amount to use this coupon
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxUses">Maximum Uses</Label>
                <Input
                  id="maxUses"
                  name="maxUses"
                  type="number"
                  min="1"
                  defaultValue={coupon.maxUses || ""}
                />
                <p className="text-muted-foreground text-xs">
                  Leave empty for unlimited uses
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input
                  id="validFrom"
                  name="validFrom"
                  type="datetime-local"
                  defaultValue={new Date(coupon.validFrom)
                    .toISOString()
                    .slice(0, 16)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="datetime-local"
                defaultValue={
                  coupon.validUntil
                    ? new Date(coupon.validUntil).toISOString().slice(0, 16)
                    : ""
                }
              />
              <p className="text-muted-foreground text-xs">
                Leave empty for no expiration
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                name="isActive"
                defaultChecked={coupon.isActive}
              />
              <Label htmlFor="isActive">Active</Label>
              <p className="text-muted-foreground text-xs">
                Whether this coupon is currently active
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/coupons/${params.id}`}>Cancel</Link>
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
