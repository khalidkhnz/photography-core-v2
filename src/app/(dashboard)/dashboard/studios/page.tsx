import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
} from "lucide-react";

// Mock data for studios - in a real app, this would come from the database
const mockStudios = [
  {
    id: "1",
    name: "Main Studio Downtown",
    address: "123 Photography Ave, Downtown",
    city: "New York",
    state: "NY",
    phone: "+1 (555) 123-4567",
    email: "downtown@photography.com",
    capacity: 20,
    equipment: ["Professional Lighting", "Backdrops", "Props"],
    isActive: true,
    shootCount: 45,
  },
  {
    id: "2",
    name: "Outdoor Location Studio",
    address: "456 Nature Blvd, Park District",
    city: "New York",
    state: "NY",
    phone: "+1 (555) 234-5678",
    email: "outdoor@photography.com",
    capacity: 50,
    equipment: ["Natural Lighting", "Scenic Views", "Portable Equipment"],
    isActive: true,
    shootCount: 32,
  },
  {
    id: "3",
    name: "Wedding Venue Studio",
    address: "789 Wedding Lane, Garden District",
    city: "New York",
    state: "NY",
    phone: "+1 (555) 345-6789",
    email: "wedding@photography.com",
    capacity: 100,
    equipment: ["Wedding Backdrops", "Romantic Lighting", "Bridal Suite"],
    isActive: true,
    shootCount: 28,
  },
  {
    id: "4",
    name: "Portrait Studio",
    address: "321 Portrait St, Arts Quarter",
    city: "New York",
    state: "NY",
    phone: "+1 (555) 456-7890",
    email: "portrait@photography.com",
    capacity: 8,
    equipment: ["Studio Lighting", "Professional Backdrops", "Makeup Station"],
    isActive: false,
    shootCount: 15,
  },
];

export default function StudiosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Studios</h1>
          <p className="text-muted-foreground">
            Manage photography studios and locations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Studio
        </Button>
      </div>

      {mockStudios.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <Building2 className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="text-lg font-semibold">No studios found</h3>
              <p className="text-muted-foreground">
                Add photography studios and locations to your system
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Studio
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {mockStudios.map((studio) => (
            <Card key={studio.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold">{studio.name}</h3>
                      <Badge
                        variant={studio.isActive ? "default" : "secondary"}
                      >
                        {studio.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="text-muted-foreground h-4 w-4" />
                          <div>
                            <p className="font-medium">{studio.address}</p>
                            <p className="text-muted-foreground text-sm">
                              {studio.city}, {studio.state}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Phone className="text-muted-foreground h-4 w-4" />
                          <span className="text-sm">{studio.phone}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Mail className="text-muted-foreground h-4 w-4" />
                          <span className="text-sm">{studio.email}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Users className="text-muted-foreground h-4 w-4" />
                          <span className="text-sm">
                            Capacity: {studio.capacity} people
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="text-muted-foreground h-4 w-4" />
                          <span className="text-sm">
                            {studio.shootCount} shoots completed
                          </span>
                        </div>

                        <div>
                          <p className="mb-2 text-sm font-medium">Equipment:</p>
                          <div className="flex flex-wrap gap-1">
                            {studio.equipment.map((item, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
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
            <CardTitle className="text-sm font-medium">Total Studios</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStudios.length}</div>
            <p className="text-muted-foreground text-xs">
              {mockStudios.filter((s) => s.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Capacity
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStudios.reduce((sum, studio) => sum + studio.capacity, 0)}
            </div>
            <p className="text-muted-foreground text-xs">
              People across all studios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shoots</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStudios.reduce((sum, studio) => sum + studio.shootCount, 0)}
            </div>
            <p className="text-muted-foreground text-xs">
              Completed in all studios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Studios
            </CardTitle>
            <MapPin className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockStudios.filter((s) => s.isActive).length}
            </div>
            <p className="text-muted-foreground text-xs">Currently available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
