"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
} from "@/server/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";

const AVAILABLE_ROLES = [
  { id: "admin", label: "Admin", description: "Full system access" },
  {
    id: "photographer",
    label: "Photographer",
    description: "Can be assigned to shoots as photographer",
  },
  {
    id: "editor",
    label: "Editor",
    description: "Can be assigned to shoots as editor",
  },
];

const COMMON_SPECIALTIES = [
  "Real Estate Photography",
  "Portrait Photography",
  "Event Photography",
  "Drone Photography",
  "Landscape Photography",
  "Wedding Photography",
  "Commercial Photography",
  "Product Photography",
  "Photo Editing",
  "Video Editing",
  "Color Correction",
  "Retouching",
  "Compositing",
  "Motion Graphics",
  "Audio Editing",
  "Podcast Production",
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTeamMemberPage({ params }: PageProps) {
  const router = useRouter();
  const [memberId, setMemberId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rating, setRating] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [customSpecialty, setCustomSpecialty] = useState("");

  useEffect(() => {
    async function loadMember() {
      const { id } = await params;
      setMemberId(id);

      const member = await getTeamMemberById(id);
      if (member) {
        setName(member.name ?? "");
        setEmail(member.email ?? "");
        setPhone(member.phone ?? "");
        setRating(member.rating?.toString() ?? "0");
        setIsActive(member.isActive);
        setSelectedRoles(member.roles);
        setSelectedSpecialties(member.specialties ?? []);
      }
    }
    void loadMember();
  }, [params]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("rating", rating);
    formData.append("isActive", isActive.toString());

    selectedRoles.forEach((role) => formData.append("roles", role));
    selectedSpecialties.forEach((specialty) =>
      formData.append("specialties", specialty),
    );

    try {
      await updateTeamMember(memberId, formData);
      router.push(`/dashboard/team/${memberId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update team member",
      );
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteTeamMember(memberId);
      router.push("/dashboard/team");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete team member",
      );
      setIsDeleting(false);
    }
  }

  const handleAddCustomSpecialty = () => {
    if (
      customSpecialty.trim() &&
      !selectedSpecialties.includes(customSpecialty.trim())
    ) {
      setSelectedSpecialties([...selectedSpecialties, customSpecialty.trim()]);
      setCustomSpecialty("");
    }
  };

  if (!memberId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/team/${memberId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Team Member
          </h1>
          <p className="text-muted-foreground">
            Update team member details and permissions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the team member&apos;s personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1-555-0123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="4.5"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive">Active Member</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>
                  Update the roles for this team member
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {AVAILABLE_ROLES.map((role) => (
                  <div key={role.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={role.id}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRoles([...selectedRoles, role.id]);
                        } else {
                          setSelectedRoles(
                            selectedRoles.filter((r) => r !== role.id),
                          );
                        }
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={role.id}
                        className="cursor-pointer font-medium"
                      >
                        {role.label}
                      </Label>
                      <p className="text-muted-foreground text-sm">
                        {role.description}
                      </p>
                    </div>
                  </div>
                ))}
                {selectedRoles.length === 0 && (
                  <p className="text-destructive text-sm">
                    Please select at least one role
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
                <CardDescription>
                  Update areas of expertise (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {COMMON_SPECIALTIES.map((specialty) => (
                    <Button
                      key={specialty}
                      type="button"
                      variant={
                        selectedSpecialties.includes(specialty)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        if (selectedSpecialties.includes(specialty)) {
                          setSelectedSpecialties(
                            selectedSpecialties.filter((s) => s !== specialty),
                          );
                        } else {
                          setSelectedSpecialties([
                            ...selectedSpecialties,
                            specialty,
                          ]);
                        }
                      }}
                    >
                      {specialty}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customSpecialty">Add Custom Specialty</Label>
                  <div className="flex gap-2">
                    <Input
                      id="customSpecialty"
                      value={customSpecialty}
                      onChange={(e) => setCustomSpecialty(e.target.value)}
                      placeholder="Enter custom specialty"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSpecialty();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddCustomSpecialty}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {selectedSpecialties.length > 0 && (
                  <div className="pt-2">
                    <p className="mb-2 text-sm font-medium">
                      Selected Specialties:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSpecialties.map((specialty) => (
                        <Button
                          key={specialty}
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setSelectedSpecialties(
                              selectedSpecialties.filter(
                                (s) => s !== specialty,
                              ),
                            )
                          }
                        >
                          {specialty} ×
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {error && (
          <Card className="border-destructive mt-6">
            <CardContent className="pt-6">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Member
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  team member and remove them from all shoot assignments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-4">
            <Link href={`/dashboard/team/${memberId}`}>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading || selectedRoles.length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
