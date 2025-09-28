import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Plus, Edit, Trash2, Users, Camera, Star } from "lucide-react";

// Mock data for expertises - in a real app, this would come from the database
const mockExpertises = [
  {
    id: "1",
    name: "Portrait Photography",
    description: "Professional portrait and headshot photography",
    category: "Photography",
    skillLevel: "Expert",
    photographerCount: 8,
    isActive: true,
  },
  {
    id: "2",
    name: "Wedding Photography",
    description: "Complete wedding photography services",
    category: "Photography",
    skillLevel: "Expert",
    photographerCount: 12,
    isActive: true,
  },
  {
    id: "3",
    name: "Photo Editing",
    description: "Post-processing and photo retouching",
    category: "Editing",
    skillLevel: "Advanced",
    photographerCount: 15,
    isActive: true,
  },
  {
    id: "4",
    name: "Color Grading",
    description: "Professional color correction and grading",
    category: "Editing",
    skillLevel: "Expert",
    photographerCount: 6,
    isActive: true,
  },
  {
    id: "5",
    name: "Event Photography",
    description: "Corporate events and social gatherings",
    category: "Photography",
    skillLevel: "Intermediate",
    photographerCount: 10,
    isActive: false,
  },
];

const categories = ["Photography", "Editing", "Videography", "Design"];

export default function ExpertisesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expertises</h1>
          <p className="text-muted-foreground">
            Manage photography and editing specializations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expertise
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          All
        </Button>
        {categories.map((category) => (
          <Button key={category} variant="outline" size="sm">
            {category}
          </Button>
        ))}
      </div>

      {mockExpertises.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <Award className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="text-lg font-semibold">No expertises found</h3>
              <p className="text-muted-foreground">
                Add specializations to categorize your team's skills
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Expertise
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockExpertises.map((expertise) => (
            <Card key={expertise.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{expertise.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {expertise.description}
                    </CardDescription>
                  </div>
                  <Badge variant={expertise.isActive ? "default" : "secondary"}>
                    {expertise.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="outline">{expertise.category}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Skill Level</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{expertise.skillLevel}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Team Members</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">
                      {expertise.photographerCount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expertises
            </CardTitle>
            <Award className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockExpertises.length}</div>
            <p className="text-muted-foreground text-xs">
              {mockExpertises.filter((e) => e.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Photography</CardTitle>
            <Camera className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                mockExpertises.filter((e) => e.category === "Photography")
                  .length
              }
            </div>
            <p className="text-muted-foreground text-xs">Photography skills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Editing</CardTitle>
            <Edit className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockExpertises.filter((e) => e.category === "Editing").length}
            </div>
            <p className="text-muted-foreground text-xs">Editing skills</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expert Level</CardTitle>
            <Star className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockExpertises.filter((e) => e.skillLevel === "Expert").length}
            </div>
            <p className="text-muted-foreground text-xs">Expert level skills</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
