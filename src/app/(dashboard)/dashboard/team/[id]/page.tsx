import { getTeamMemberById } from "@/server/actions/user-actions";
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
import { ArrowLeft, Edit, Users, Mail, Phone, Star } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewTeamMemberPage({ params }: PageProps) {
  const { id } = await params;
  const member = await getTeamMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/team">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{member.name}</h1>
            <p className="text-muted-foreground">Team member details</p>
          </div>
        </div>
        <Link href={`/dashboard/team/${member.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <Badge variant={member.isActive ? "default" : "secondary"}>
                {member.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-muted-foreground">{member.email}</p>
              </div>
            </div>

            {member.phone && (
              <div className="flex items-start gap-3">
                <Phone className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-muted-foreground">{member.phone}</p>
                </div>
              </div>
            )}

            {member.rating !== null && member.rating !== undefined && (
              <div className="flex items-start gap-3">
                <Star className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Rating</p>
                  <p className="text-muted-foreground">
                    {member.rating.toFixed(1)} / 5.0
                  </p>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-medium">Roles</p>
              <div className="flex flex-wrap gap-2">
                {member.roles.map((role) => (
                  <Badge key={role} variant="outline">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            {member.specialties && member.specialties.length > 0 && (
              <div className="border-t pt-4">
                <p className="mb-2 text-sm font-medium">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {member.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {member.createdAt && (
              <div className="border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  Member since{" "}
                  {format(new Date(member.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment History</CardTitle>
            <CardDescription>
              Recent shoots this member has been assigned to
            </CardDescription>
          </CardHeader>
          <CardContent>
            {member.shootAssignments && member.shootAssignments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shoot ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.shootAssignments.slice(0, 10).map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/shoots/${assignment.shoot.id}`}
                          className="text-primary hover:underline"
                        >
                          {assignment.shoot.shootId}
                        </Link>
                      </TableCell>
                      <TableCell>{assignment.shoot.client.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {assignment.assignmentType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {assignment.shoot.shootStartDate
                          ? format(
                              new Date(assignment.shoot.shootStartDate),
                              "MMM d, yyyy",
                            )
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">No assignments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
