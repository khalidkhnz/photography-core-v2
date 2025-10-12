import { getClusters } from "@/server/actions/cluster-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Layers } from "lucide-react";
import Link from "next/link";
import { ClustersGrid } from "./_components/clusters-grid";

export default async function ClustersPage() {
  const clusters = await getClusters();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clusters</h1>
          <p className="text-muted-foreground">
            Manage grouped shoots for combined P&L tracking
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clusters/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Cluster
          </Link>
        </Button>
      </div>

      {clusters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No clusters yet</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Create clusters to group multiple shoots for combined client
              communication and P&L tracking.
            </p>
            <Button asChild>
              <Link href="/dashboard/clusters/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Cluster
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ClustersGrid clusters={clusters} />
      )}
    </div>
  );
}
