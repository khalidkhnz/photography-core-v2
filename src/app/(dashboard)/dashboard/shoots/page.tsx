import { getShoots, deleteShoot } from "@/server/actions/shoot-actions";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  Calendar,
  MapPin,
  Eye,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function ShootsPage() {
  const shoots = await getShoots();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shoots</h1>
          <p className="text-muted-foreground">
            Manage all your photography shoots
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/shoots/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Shoot
          </Link>
        </Button>
      </div>

      {shoots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No shoots yet</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Get started by creating your first photography shoot.
            </p>
            <Button asChild>
              <Link href="/dashboard/shoots/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Shoot
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Shoots</CardTitle>
            <CardDescription>
              A list of all your photography shoots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shoot ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shoots.map((shoot) => (
                  <TableRow key={shoot.id}>
                    <TableCell className="font-medium">
                      {shoot.shootId}
                    </TableCell>
                    <TableCell>{shoot.client.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{shoot.shootType.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {shoot.location ? (
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {shoot.location.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          No location
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {shoot.shootStartDate ? (
                        format(new Date(shoot.shootStartDate), "MMM dd, yyyy")
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(shoot.status)}>
                        {shoot.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/shoots/${shoot.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/shoots/${shoot.id}/edit`}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              "use server";
                              await deleteShoot(shoot.id);
                            }}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
