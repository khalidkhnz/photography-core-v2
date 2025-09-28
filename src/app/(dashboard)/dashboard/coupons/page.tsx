import { getCoupons, deleteCoupon } from "@/server/actions/coupon-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Percent,
  DollarSign,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function CouponsPage() {
  const coupons = await getCoupons();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">
            Manage discount coupons and promotional codes
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/coupons/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Coupon
          </Link>
        </Button>
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <Tag className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="text-lg font-semibold">No coupons found</h3>
              <p className="text-muted-foreground">
                Create your first discount coupon to get started
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/coupons/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Coupon
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{coupon.code}</h3>
                      <Badge
                        variant={coupon.isActive ? "default" : "secondary"}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {coupon.description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        {coupon.type === "percentage" ? (
                          <Percent className="h-4 w-4" />
                        ) : (
                          <DollarSign className="h-4 w-4" />
                        )}
                        <span>
                          {coupon.type === "percentage"
                            ? `${coupon.value}% off`
                            : `$${coupon.value} off`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(coupon.validFrom), "MMM dd, yyyy")} -{" "}
                          {coupon.validUntil
                            ? format(
                                new Date(coupon.validUntil),
                                "MMM dd, yyyy",
                              )
                            : "No expiry"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Tag className="h-4 w-4" />
                        <span>
                          {coupon.usedCount}/{coupon.maxUses || "∞"} uses
                        </span>
                      </div>
                    </div>

                    {coupon.minAmount && coupon.minAmount > 0 && (
                      <p className="text-muted-foreground text-sm">
                        Minimum order: ${coupon.minAmount}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/coupons/${coupon.id}`}>
                            <Tag className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/coupons/${coupon.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            "use server";
                            await deleteCoupon(coupon.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Tag className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coupons.length}</div>
            <p className="text-muted-foreground text-xs">
              {coupons.filter((c) => c.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
            <Percent className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)}
            </div>
            <p className="text-muted-foreground text-xs">Across all coupons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Coupons
            </CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coupons.filter((c) => c.isActive).length}
            </div>
            <p className="text-muted-foreground text-xs">Currently available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
