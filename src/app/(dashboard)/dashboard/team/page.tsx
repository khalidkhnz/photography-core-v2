"use client";

import { useState, useEffect } from "react";
import { getTeamMembers } from "@/server/actions/user-actions";
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
import { Users, Plus, Eye, Edit, Grid3x3, List } from "lucide-react";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  roles: string[];
  specialties: string[];
  rating: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTeamMembers() {
      try {
        const members = await getTeamMembers();
        setTeamMembers(members as TeamMember[]);
      } catch (error) {
        console.error("Failed to load team members:", error);
      } finally {
        setIsLoading(false);
      }
    }
    void loadTeamMembers();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team</h1>
            <p className="text-muted-foreground">
              Manage your team members and their roles
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading team members...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and their roles
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-r-none"
            >
              <List className="mr-2 h-4 w-4" />
              Table
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-l-none"
            >
              <Grid3x3 className="mr-2 h-4 w-4" />
              Grid
            </Button>
          </div>
          <Link href="/dashboard/team/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </Link>
        </div>
      </div>

      {viewMode === "table" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.name ?? "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.email ?? "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.roles.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.specialties && member.specialties.length > 0 ? (
                      <span className="text-muted-foreground text-sm">
                        {member.specialties.slice(0, 2).join(", ")}
                        {member.specialties.length > 2 &&
                          ` +${member.specialties.length - 2}`}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.rating !== null && member.rating !== undefined ? (
                      <span className="font-medium">
                        {member.rating.toFixed(1)}
                        <span className="text-muted-foreground text-sm">
                          {" "}
                          / 5
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? "default" : "secondary"}>
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/team/${member.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/team/${member.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="text-muted-foreground h-5 w-5" />
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                  </div>
                  <Badge
                    variant={member.isActive ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {member.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{member.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
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
                  <div>
                    <p className="mb-2 text-sm font-medium">Specialties</p>
                    <p className="text-muted-foreground text-sm">
                      {member.specialties.join(", ")}
                    </p>
                  </div>
                )}

                {member.rating !== null && member.rating !== undefined && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Rating</p>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold">
                        {member.rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground ml-1 text-sm">
                        / 5.0
                      </span>
                    </div>
                  </div>
                )}

                {member.phone && (
                  <div>
                    <p className="mb-1 text-sm font-medium">Phone</p>
                    <p className="text-muted-foreground text-sm">
                      {member.phone}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Link
                    href={`/dashboard/team/${member.id}`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-3 w-3" />
                      View
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/team/${member.id}/edit`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {teamMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No team members yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Get started by adding your first team member
            </p>
            <Link href="/dashboard/team/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
