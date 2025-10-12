import { getTeamMembers } from "@/server/actions/user-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Camera, Award, Medal, Crown } from "lucide-react";
import Link from "next/link";

export default async function RankingPage() {
  const teamMembers = await getTeamMembers(["photographer"]);

  // Sort photographers by rating (highest first), then by shoot count
  const sortedPhotographers = teamMembers
    .filter(
      (member) => member.isActive && member.roles.includes("photographer"),
    )
    .sort((a, b) => {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;

      if (ratingA !== ratingB) {
        return ratingB - ratingA; // Higher rating first
      }

      // If ratings are equal, sort by name
      return (a.name ?? "").localeCompare(b.name ?? "");
    });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-muted-foreground text-sm font-medium">
            #{index + 1}
          </span>
        );
    }
  };

  const getRankBadgeVariant = (index: number) => {
    switch (index) {
      case 0:
        return "default";
      case 1:
        return "secondary";
      case 2:
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Photographer Ranking
        </h1>
        <p className="text-muted-foreground">
          Top performing photographers based on ratings and performance
        </p>
      </div>

      {sortedPhotographers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="space-y-2 text-center">
              <Trophy className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="text-lg font-semibold">No photographers found</h3>
              <p className="text-muted-foreground">
                Add photographers to see the ranking
              </p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/photographers/new">
                  <Camera className="mr-2 h-4 w-4" />
                  Add Photographer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Top 3 Podium */}
          {sortedPhotographers.slice(0, 3).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  The best photographers in your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {sortedPhotographers
                    .slice(0, 3)
                    .map((photographer, index) => (
                      <div
                        key={photographer.id}
                        className={`rounded-lg border-2 p-4 ${
                          index === 0
                            ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
                            : index === 1
                              ? "border-gray-200 bg-gray-50 dark:bg-gray-950/20"
                              : "border-amber-200 bg-amber-50 dark:bg-amber-950/20"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          {getRankIcon(index)}
                          <Badge variant={getRankBadgeVariant(index)}>
                            {index === 0
                              ? "1st Place"
                              : index === 1
                                ? "2nd Place"
                                : "3rd Place"}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold">
                          {photographer.name}
                        </h3>
                        <div className="mt-1 flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {photographer.rating?.toFixed(1) ?? "0.0"}
                          </span>
                        </div>
                        <div className="mt-2">
                          <Link
                            href={`/dashboard/photographers/${photographer.id}`}
                            className="text-primary text-sm hover:underline"
                          >
                            View Profile →
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Ranking List */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Ranking</CardTitle>
              <CardDescription>
                All photographers ranked by performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedPhotographers.map((photographer, index) => (
                  <div
                    key={photographer.id}
                    className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(index)}
                        <span className="font-medium">{photographer.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {photographer.rating?.toFixed(1) ?? "0.0"}
                        </span>
                      </div>
                      {photographer.specialties &&
                        photographer.specialties.length > 0 && (
                          <div className="flex space-x-1">
                            {photographer.specialties
                              .slice(0, 2)
                              .map((specialty, specIndex) => (
                                <Badge
                                  key={specIndex}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                            {photographer.specialties.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{photographer.specialties.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {photographer.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/dashboard/photographers/${photographer.id}`}
                        >
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
