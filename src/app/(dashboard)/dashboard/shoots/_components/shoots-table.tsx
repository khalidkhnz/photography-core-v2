"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { deleteShoot, updateShootStatus } from "@/server/actions/shoot-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, MapPin, Search, Filter, X } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Shoot {
  id: string;
  shootId: string;
  projectName?: string | null;
  remarks?: string | null;
  shootStartDate?: Date | null;
  status: string;
  client: {
    name: string;
  };
  shootType: {
    name: string;
  };
  location: {
    name: string;
  } | null;
  teamMembers?: Array<{
    userId: string;
    assignmentType: string;
    user: { name: string | null };
  }>;
}

interface ShootsTableProps {
  shoots: Shoot[];
  clients: Array<{ id: string; name: string }>;
}

export function ShootsTable({ shoots, clients }: ShootsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shootToDelete, setShootToDelete] = useState<{
    id: string;
    shootId: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const router = useRouter();

  const handleDeleteClick = (shoot: { id: string; shootId: string }) => {
    setShootToDelete(shoot);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!shootToDelete) return;

    setIsDeleting(true);
    try {
      await deleteShoot(shootToDelete.id);
      setDeleteDialogOpen(false);
      setShootToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting shoot:", error);
      alert("Failed to delete shoot");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter and search shoots
  const filteredShoots = useMemo(() => {
    return shoots.filter((shoot) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        (!searchQuery || shoot.shootId.toLowerCase().includes(searchLower)) ??
        shoot.projectName?.toLowerCase().includes(searchLower) ??
        shoot.remarks?.toLowerCase().includes(searchLower);

      // Client filter
      const matchesClient =
        filterClient === "all" || shoot.client.name === filterClient;

      // Status filter
      const matchesStatus =
        filterStatus === "all" || shoot.status === filterStatus;

      // Date filter
      const shootDate = shoot.shootStartDate
        ? new Date(shoot.shootStartDate)
        : null;
      const matchesDateFrom =
        !filterDateFrom || (shootDate && shootDate >= new Date(filterDateFrom));
      const matchesDateTo =
        !filterDateTo || (shootDate && shootDate <= new Date(filterDateTo));

      return (
        matchesSearch &&
        matchesClient &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    shoots,
    searchQuery,
    filterClient,
    filterStatus,
    filterDateFrom,
    filterDateTo,
  ]);

  // Get team assigned based on status
  const getTeamAssigned = (shoot: Shoot) => {
    const photographers =
      shoot.teamMembers?.filter((tm) => tm.assignmentType === "photographer") ??
      [];
    const editors =
      shoot.teamMembers?.filter((tm) => tm.assignmentType === "editor") ?? [];

    switch (shoot.status) {
      case "planned":
      case "in_progress":
        return photographers.length > 0 ? "Photographers" : "Not Assigned";
      case "editing":
      case "delivered":
        return editors.length > 0 ? "Editors" : "Not Assigned";
      case "completed":
        return "Completed";
      default:
        return "—";
    }
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-4 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search by Shoot ID, Project Name, or Remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.name}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="editing">Editing</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="postponed">Postponed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            placeholder="From Date"
            className="w-[150px]"
          />

          <Input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            placeholder="To Date"
            className="w-[150px]"
          />

          {(filterClient !== "all" ||
            filterStatus !== "all" ||
            filterDateFrom ||
            filterDateTo) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterClient("all");
                setFilterStatus("all");
                setFilterDateFrom("");
                setFilterDateTo("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div className="text-muted-foreground text-sm">
          Showing {filteredShoots.length} of {shoots.length} shoots
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shoot ID</TableHead>
            <TableHead>Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Team Assigned</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredShoots.map((shoot) => (
            <TableRow key={shoot.id}>
              <TableCell className="font-medium">{shoot.shootId}</TableCell>
              <TableCell>
                {shoot.projectName ?? (
                  <span className="text-muted-foreground">—</span>
                )}
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
                  <span className="text-muted-foreground">No location</span>
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
                <Select
                  value={shoot.status}
                  onValueChange={async (newStatus) => {
                    await updateShootStatus(shoot.id, newStatus);
                    router.refresh();
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="editing">Editing</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="postponed">Postponed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getTeamAssigned(shoot)}</Badge>
              </TableCell>
              <TableCell>
                {shoot.remarks ? (
                  <span className="line-clamp-2 max-w-xs">{shoot.remarks}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
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
                      onClick={() =>
                        handleDeleteClick({
                          id: shoot.id,
                          shootId: shoot.shootId,
                        })
                      }
                      className="text-destructive focus:text-destructive"
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              shoot <strong>{shootToDelete?.shootId}</strong> and remove all
              associated data including photographer and editor assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
