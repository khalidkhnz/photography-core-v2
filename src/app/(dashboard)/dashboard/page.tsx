import { getShoots } from "@/server/actions/shoot-actions";
import { getClients } from "@/server/actions/client-actions";
import { getTeamMembers } from "@/server/actions/user-actions";
import { getShootTypes } from "@/server/actions/shoot-type-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Users,
  Calendar,
  Building2,
  Tag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [shoots, clients, teamMembers, shootTypes] = await Promise.all([
    getShoots(),
    getClients(),
    getTeamMembers(["photographer", "editor"]),
    getShootTypes(),
  ]);

  // Calculate statistics
  const totalShoots = shoots.length;
  const plannedShoots = shoots.filter(
    (shoot) => shoot.status === "planned",
  ).length;
  const inProgressShoots = shoots.filter(
    (shoot) => shoot.status === "in_progress",
  ).length;
  const editingShoots = shoots.filter(
    (shoot) => shoot.status === "editing",
  ).length;
  const deliveredShoots = shoots.filter(
    (shoot) => shoot.status === "delivered",
  ).length;
  const completedShoots = shoots.filter(
    (shoot) => shoot.status === "completed",
  ).length;
  const blockedShoots = shoots.filter(
    (shoot) => shoot.status === "blocked",
  ).length;
  const postponedShoots = shoots.filter(
    (shoot) => shoot.status === "postponed",
  ).length;
  const cancelledShoots = shoots.filter(
    (shoot) => shoot.status === "cancelled",
  ).length;

  const activePhotographers = teamMembers.filter(
    (member) => member.isActive && member.roles.includes("photographer"),
  ).length;
  const activeEditors = teamMembers.filter(
    (member) => member.isActive && member.roles.includes("editor"),
  ).length;
  const totalLocations = clients.reduce(
    (sum, client) => sum + (client.locations?.length || 0),
    0,
  );

  // Recent shoots (last 5)
  const recentShoots = shoots.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your photography management system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shoots</CardTitle>
            <Camera className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShoots}</div>
            <p className="text-muted-foreground text-xs">
              All photography shoots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Team</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activePhotographers + activeEditors}
            </div>
            <p className="text-muted-foreground text-xs">
              {activePhotographers} photographers, {activeEditors} editors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-muted-foreground text-xs">
              {totalLocations} total locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shoot Types</CardTitle>
            <Tag className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shootTypes.length}</div>
            <p className="text-muted-foreground text-xs">
              Available shoot categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shoot Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {plannedShoots}
            </div>
            <p className="text-muted-foreground text-xs">
              Shoots ready to start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inProgressShoots + editingShoots}
            </div>
            <p className="text-muted-foreground text-xs">
              In progress & editing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {deliveredShoots + completedShoots}
            </div>
            <p className="text-muted-foreground text-xs">
              Successfully finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {blockedShoots + postponedShoots + cancelledShoots}
            </div>
            <p className="text-muted-foreground text-xs">
              Blocked, postponed, cancelled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Shoots</CardTitle>
            <CardDescription>
              Latest photography shoots in your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentShoots.length === 0 ? (
              <div className="py-6 text-center">
                <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">No shoots yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first photography shoot
                </p>
                <Link
                  href="/dashboard/shoots/new"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Create Shoot
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentShoots.map((shoot) => (
                  <div
                    key={shoot.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {shoot.shootId}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {shoot.client.name} • {shoot.shootType.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          shoot.status === "planned"
                            ? "secondary"
                            : shoot.status === "in_progress"
                              ? "default"
                              : shoot.status === "completed"
                                ? "default"
                                : "destructive"
                        }
                      >
                        {shoot.status.replace("_", " ")}
                      </Badge>
                      <Link
                        href={`/dashboard/shoots/${shoot.id}`}
                        className="text-primary text-sm hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Link
                    href="/dashboard/shoots"
                    className="text-primary text-sm hover:underline"
                  >
                    View all shoots →
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/dashboard/shoots/new"
              className="hover:bg-muted flex items-center space-x-2 rounded-md p-2 transition-colors"
            >
              <Camera className="h-4 w-4" />
              <span className="text-sm">Create New Shoot</span>
            </Link>
            <Link
              href="/dashboard/clients/new"
              className="hover:bg-muted flex items-center space-x-2 rounded-md p-2 transition-colors"
            >
              <Building2 className="h-4 w-4" />
              <span className="text-sm">Add New Client</span>
            </Link>
            <Link
              href="/dashboard/team/new"
              className="hover:bg-muted flex items-center space-x-2 rounded-md p-2 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span className="text-sm">Add Team Member</span>
            </Link>
            <Link
              href="/dashboard/shoot-types/new"
              className="hover:bg-muted flex items-center space-x-2 rounded-md p-2 transition-colors"
            >
              <Tag className="h-4 w-4" />
              <span className="text-sm">Add Shoot Type</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
