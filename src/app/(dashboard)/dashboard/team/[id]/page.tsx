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
  const memberData = await getTeamMemberById(id);

  if (!memberData) {
    notFound();
  }

  // Type assertion - getTeamMemberById returns user with shoots
  const member = memberData as typeof memberData & {
    shoots: Array<{
      id: string;
      shootId: string;
      scheduledShootDate: Date | string | null;
      dopId: string | null;
      client: { name: string } | null;
      shootType: { name: string } | null;
      executors: Array<{ userId: string }>;
    }>;
  };

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
            {member.shoots && member.shoots.length > 0 ? (
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
                  {member.shoots.map((shoot: {
                    id: string;
                    shootId: string;
                    scheduledShootDate: Date | string | null;
                    dopId: string | null;
                    client: { name: string } | null;
                    shootType: { name: string } | null;
                    executors: Array<{ userId: string }>;
                  }) => {
                    const isDOP = shoot.dopId === member.id;
                    const isExecutor = shoot.executors.some((e) => e.userId === member.id);
                    const role = isDOP ? "DOP" : isExecutor ? "Executor" : "N/A";
                    const shootDate = shoot.scheduledShootDate 
                      ? new Date(shoot.scheduledShootDate)
                      : null;
                    return (
                      <TableRow key={shoot.id}>
                        <TableCell>
                          <Link
                            href={`/dashboard/shoots/${shoot.id}`}
                            className="text-primary hover:underline"
                          >
                            {shoot.shootId}
                          </Link>
                        </TableCell>
                        <TableCell>{shoot.client?.name ?? 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {shootDate
                            ? format(shootDate, "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
