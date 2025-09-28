import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Camera, Users, Building2, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Photography Core
          </h1>
          <p className="text-muted-foreground">
            Central nucleus for photography operations
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/shoots/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Shoot
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shoots</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">+0% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photographers</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">+0% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Studios</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">+0% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <Camera className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-muted-foreground text-xs">+0% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Shoots</CardTitle>
            <CardDescription>Your latest photography projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-6 text-center">
              <Calendar className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="mt-2 text-sm font-semibold">No shoots yet</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Get started by creating your first shoot.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/dashboard/shoots/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Shoot
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/shoots/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Shoot
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/photographers">
                <Users className="mr-2 h-4 w-4" />
                Manage Photographers
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/studios">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Studios
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
