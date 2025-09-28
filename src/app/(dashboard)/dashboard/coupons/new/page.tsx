import { createCouponAction } from "@/server/actions/coupon-form-actions";
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

export default function CreateCouponPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/coupons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Coupon</h1>
          <p className="text-muted-foreground">
            Add a new discount coupon to your system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
          <CardDescription>
            Enter the details for your new discount coupon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCouponAction} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="e.g., WELCOME20"
                  required
                  className="uppercase"
                />
                <p className="text-muted-foreground text-xs">
                  Enter a unique code for this coupon
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Discount Type *</Label>
                <Select name="type" required>
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
                  placeholder="20"
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
                  placeholder="100"
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
                  placeholder="100"
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
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input id="validUntil" name="validUntil" type="datetime-local" />
              <p className="text-muted-foreground text-xs">
                Leave empty for no expiration
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isActive" name="isActive" defaultChecked />
              <Label htmlFor="isActive">Active</Label>
              <p className="text-muted-foreground text-xs">
                Whether this coupon is currently active
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/coupons">Cancel</Link>
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Create Coupon
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
