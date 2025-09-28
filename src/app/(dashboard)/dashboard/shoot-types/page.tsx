import {
  getShootTypes,
  deleteShootType,
} from "@/server/actions/shoot-type-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
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
import { MoreHorizontal } from "lucide-react";

export default async function ShootTypesPage() {
  const shootTypes = await getShootTypes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shoot Types</h1>
          <p className="text-muted-foreground">
            Manage different types of photography shoots
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/shoot-types/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Shoot Type
          </Link>
        </Button>
      </div>

      {shootTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <Tag className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="text-lg font-semibold">No shoot types found</h3>
              <p className="text-muted-foreground">
                Get started by adding your first shoot type
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/shoot-types/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shoot Type
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shootTypes.map((shootType) => (
                  <TableRow key={shootType.id}>
                    <TableCell className="font-medium">
                      {shootType.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{shootType.code}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {shootType.description ?? "No description"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(shootType.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/shoot-types/${shootType.id}/edit`}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={async () => {
                              "use server";
                              await deleteShootType(shootType.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
