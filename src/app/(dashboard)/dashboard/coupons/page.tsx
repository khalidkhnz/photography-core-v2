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
  Tag,
  Plus,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Percent,
  DollarSign,
} from "lucide-react";

// Mock data for coupons - in a real app, this would come from the database
const mockCoupons = [
  {
    id: "1",
    code: "WELCOME20",
    description: "Welcome discount for new clients",
    type: "percentage",
    value: 20,
    minAmount: 100,
    maxUses: 100,
    usedCount: 15,
    validFrom: "2024-01-01",
    validUntil: "2024-12-31",
    isActive: true,
  },
  {
    id: "2",
    code: "SUMMER50",
    description: "Summer special discount",
    type: "fixed",
    value: 50,
    minAmount: 200,
    maxUses: 50,
    usedCount: 23,
    validFrom: "2024-06-01",
    validUntil: "2024-08-31",
    isActive: true,
  },
  {
    id: "3",
    code: "LOYALTY10",
    description: "Loyalty reward for returning clients",
    type: "percentage",
    value: 10,
    minAmount: 50,
    maxUses: null,
    usedCount: 8,
    validFrom: "2024-01-01",
    validUntil: null,
    isActive: false,
  },
];

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">
            Manage discount coupons and promotional codes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {mockCoupons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <Tag className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="text-lg font-semibold">No coupons found</h3>
              <p className="text-muted-foreground">
                Create your first discount coupon to get started
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Coupon
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mockCoupons.map((coupon) => (
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
                          {coupon.validFrom} -{" "}
                          {coupon.validUntil || "No expiry"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Tag className="h-4 w-4" />
                        <span>
                          {coupon.usedCount}/{coupon.maxUses || "∞"} uses
                        </span>
                      </div>
                    </div>

                    {coupon.minAmount > 0 && (
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
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
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
            <div className="text-2xl font-bold">{mockCoupons.length}</div>
            <p className="text-muted-foreground text-xs">
              {mockCoupons.filter((c) => c.isActive).length} active
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
              {mockCoupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)}
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
              {mockCoupons.filter((c) => c.isActive).length}
            </div>
            <p className="text-muted-foreground text-xs">Currently available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
