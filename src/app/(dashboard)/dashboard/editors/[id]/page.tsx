import { getEditorById } from "@/server/actions/editor-actions";
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
  ArrowLeft,
  Edit,
  Star,
  Mail,
  Phone,
  Calendar,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";

export default async function ViewEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const editor = await getEditorById(id);

  if (!editor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/editors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{editor.name}</h1>
            <p className="text-muted-foreground">
              Editor profile and information
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/editors/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Editor
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Information */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Editor Overview</CardTitle>
              <CardDescription>Key details about this editor.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-muted-foreground">{editor.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={editor.isActive ? "default" : "secondary"}>
                  {editor.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Rating</p>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-muted-foreground">
                    {editor.rating?.toFixed(1) ?? "0.0"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Total Shoots</p>
                <Badge variant="outline">{editor._count.shootEditors}</Badge>
              </div>
              {editor.email && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Email</p>
                  <div className="flex items-center space-x-2">
                    <Mail className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      {editor.email}
                    </span>
                  </div>
                </div>
              )}
              {editor.phone && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium">Phone</p>
                  <div className="flex items-center space-x-2">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">
                      {editor.phone}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-muted-foreground">
                  {format(new Date(editor.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-muted-foreground">
                  {format(new Date(editor.updatedAt), "MMM dd, yyyy")}
                </p>
              </div>
            </CardContent>
          </Card>

          {editor.specialties && editor.specialties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
                <CardDescription>
                  Areas of expertise for this editor.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {editor.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Statistics</CardTitle>
              <CardDescription>
                Editor&apos;s work history and performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Edit3 className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Total Shoots</span>
                  </div>
                  <Badge variant="secondary">
                    {editor._count.shootEditors}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">
                      {editor.rating?.toFixed(1) ?? "0.0"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <Badge variant={editor.isActive ? "default" : "secondary"}>
                    {editor.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {editor._count.shootEditors === 0 && (
                <p className="text-muted-foreground mt-4 text-xs">
                  This editor hasn&apos;t been assigned to any shoots yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common actions for this editor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href={`/dashboard/editors/${editor.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/dashboard/shoots/new">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Assign to Shoot
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
