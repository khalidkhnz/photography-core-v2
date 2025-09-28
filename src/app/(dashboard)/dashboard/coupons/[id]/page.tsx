import { getCouponById } from "@/server/actions/coupon-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Copy,
  Calendar,
  Percent,
  DollarSign,
  Tag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export default async function ViewCouponPage({
  params,
}: {
  params: { id: string };
}) {
  const coupon = await getCouponById(params.id);

  if (!coupon) {
    notFound();
  }

  const isExpired = coupon.validUntil && new Date() > coupon.validUntil;
  const isNotYetValid = new Date() < coupon.validFrom;
  const isUsageLimitReached =
    coupon.maxUses && coupon.usedCount >= coupon.maxUses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/coupons">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Coupon: {coupon.code}
            </h1>
            <p className="text-muted-foreground">
              {coupon.description || "Discount coupon details"}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/coupons/${coupon.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Coupon
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Information */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Coupon Overview</CardTitle>
              <CardDescription>Key details about this coupon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Coupon Code</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-muted-foreground font-mono text-lg">
                      {coupon.code}
                    </p>
                    <Button variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        !coupon.isActive ||
                        isExpired ||
                        isNotYetValid ||
                        isUsageLimitReached
                          ? "destructive"
                          : "default"
                      }
                    >
                      {!coupon.isActive
                        ? "Inactive"
                        : isExpired
                          ? "Expired"
                          : isNotYetValid
                            ? "Not Yet Valid"
                            : isUsageLimitReached
                              ? "Usage Limit Reached"
                              : "Active"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Discount Type</p>
                  <div className="flex items-center space-x-1">
                    {coupon.type === "percentage" ? (
                      <Percent className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <DollarSign className="text-muted-foreground h-4 w-4" />
                    )}
                    <span className="text-muted-foreground capitalize">
                      {coupon.type}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Discount Value</p>
                  <p className="text-muted-foreground text-lg font-semibold">
                    {coupon.type === "percentage"
                      ? `${coupon.value}% off`
                      : `$${coupon.value} off`}
                  </p>
                </div>

                {coupon.minAmount && (
                  <div>
                    <p className="text-sm font-medium">Minimum Order</p>
                    <p className="text-muted-foreground">${coupon.minAmount}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">Usage</p>
                  <p className="text-muted-foreground">
                    {coupon.usedCount}/{coupon.maxUses || "∞"} uses
                  </p>
                </div>
              </div>

              {coupon.description && (
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-muted-foreground">{coupon.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Validity Period</CardTitle>
              <CardDescription>When this coupon can be used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Valid From</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <p className="text-muted-foreground">
                      {format(
                        new Date(coupon.validFrom),
                        "MMM dd, yyyy 'at' HH:mm",
                      )}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Valid Until</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <p className="text-muted-foreground">
                      {coupon.validUntil
                        ? format(
                            new Date(coupon.validUntil),
                            "MMM dd, yyyy 'at' HH:mm",
                          )
                        : "No expiration"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>How this coupon is being used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Total Uses</span>
                </div>
                <span className="text-2xl font-bold">{coupon.usedCount}</span>
              </div>

              {coupon.maxUses && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage Progress</span>
                    <span>
                      {Math.round((coupon.usedCount / coupon.maxUses) * 100)}%
                    </span>
                  </div>
                  <div className="bg-muted h-2 w-full rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${Math.min((coupon.usedCount / coupon.maxUses) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Remaining Uses</span>
                </div>
                <span className="text-lg font-semibold">
                  {coupon.maxUses ? coupon.maxUses - coupon.usedCount : "∞"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common actions for this coupon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href={`/dashboard/coupons/${coupon.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Coupon
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
