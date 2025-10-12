"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEditor } from "@/server/actions/editor-actions";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Phone, Mail, Star, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Editor {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  specialties?: string[];
  rating?: number | null;
  isActive: boolean;
  createdAt: Date;
}

interface EditorsGridProps {
  editors: Editor[];
}

export function EditorsGrid({ editors }: EditorsGridProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editorToDelete, setEditorToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (editor: { id: string; name: string }) => {
    setEditorToDelete(editor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!editorToDelete) return;

    setIsDeleting(true);
    try {
      await deleteEditor(editorToDelete.id);
      setDeleteDialogOpen(false);
      setEditorToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting editor:", error);
      alert("Failed to delete editor");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {editors.map((editor) => (
          <Card key={editor.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{editor.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <Badge variant={editor.isActive ? "default" : "secondary"}>
                      {editor.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{editor.rating}/5</span>
                    </div>
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/editors/${editor.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleDeleteClick({ id: editor.id, name: editor.name })
                      }
                      className="text-destructive focus:text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {editor.email && (
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">{editor.email}</span>
                </div>
              )}
              {editor.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">{editor.phone}</span>
                </div>
              )}
              {editor.specialties && editor.specialties.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Specialties</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {editor.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-muted-foreground text-xs">
                Created {format(new Date(editor.createdAt), "MMM dd, yyyy")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              editor <strong>{editorToDelete?.name}</strong> and remove them
              from all assigned shoots.
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
