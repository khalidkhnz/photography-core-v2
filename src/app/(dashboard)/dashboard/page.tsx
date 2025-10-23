import { getAllDashboardData } from "@/server/actions/dashboard-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardCharts } from "@/components/dashboard-charts";
import {
  Camera,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Filter,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function DashboardPage() {
  // Fetch all dashboard data through server actions
  const { stats, monthlyGrowth, cityGrowth, clientGrowth } = await getAllDashboardData();
  
  // Extract statistics
  const {
    plannedShoots,
    inProgressShoots,
    deliveredShoots,
    issueShoots,
    unpaidShoots
  } = stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Photography operations management and growth tracking
        </p>
      </div>

      {/* Histogram / Growth Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Growth Tracker
          </CardTitle>
          <CardDescription>
            Shoot count aggregation by date, week, month, city, and client level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardCharts 
            monthlyGrowth={monthlyGrowth}
            cityGrowth={cityGrowth}
            clientGrowth={clientGrowth}
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter shoots by status: Planned, Shoot in Progress, and Delivered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
                <CardTitle className="text-sm font-medium">Shoot in Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {inProgressShoots}
                </div>
                <p className="text-muted-foreground text-xs">
                  Currently being shot
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
                  {deliveredShoots}
                </div>
                <p className="text-muted-foreground text-xs">
                  Successfully completed
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Issues View */}
      {issueShoots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Issues
            </CardTitle>
            <CardDescription>
              Shoots marked with issues requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shoot ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issueShoots.slice(0, 10).map((shoot) => (
                  <TableRow key={shoot.id}>
                    <TableCell className="font-medium">{shoot.shootId}</TableCell>
                    <TableCell>{shoot.client.name}</TableCell>
                    <TableCell>{shoot.projectName ?? 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {shoot.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/shoots/${shoot.id}`}
                        className="text-primary text-sm hover:underline"
                      >
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {issueShoots.length > 10 && (
              <div className="mt-4 text-center">
                <Link
                  href="/dashboard/shoots?filter=issues"
                  className="text-primary text-sm hover:underline"
                >
                  View all {issueShoots.length} issues →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Unpaid/On-hold Shoots */}
      {unpaidShoots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              Unpaid/On-hold Shoots
            </CardTitle>
            <CardDescription>
              Delivered shoots with outstanding payments or cost tracking issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shoot ID</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidShoots.slice(0, 10).map((shoot) => {
                  const teamMembers = shoot.teamMembers?.map(tm => tm.user.name).filter(Boolean).join(', ') ?? 'N/A';
                  const totalCost = (shoot.photographyCost ?? 0) + (shoot.travelCost ?? 0) + (shoot.editingCost ?? 0);
                  
                  return (
                    <TableRow key={shoot.id}>
                      <TableCell className="font-medium">{shoot.shootId}</TableCell>
                      <TableCell>{shoot.projectName ?? 'N/A'}</TableCell>
                      <TableCell>{teamMembers}</TableCell>
                      <TableCell>
                        {shoot.shootEndDate ? format(new Date(shoot.shootEndDate), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        ₹{totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/shoots/${shoot.id}`}
                          className="text-primary text-sm hover:underline"
                        >
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {unpaidShoots.length > 10 && (
              <div className="mt-4 text-center">
                <Link
                  href="/dashboard/shoots?filter=unpaid"
                  className="text-primary text-sm hover:underline"
                >
                  View all {unpaidShoots.length} unpaid shoots →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
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
            href="/dashboard/shoots"
            className="hover:bg-muted flex items-center space-x-2 rounded-md p-2 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span className="text-sm">View All Shoots</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
