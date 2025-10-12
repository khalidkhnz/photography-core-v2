-- AlterTable
ALTER TABLE "public"."Shoot" ADD COLUMN     "clusterId" TEXT,
ADD COLUMN     "workflowType" TEXT NOT NULL DEFAULT 'shift';

-- CreateTable
CREATE TABLE "public"."Cluster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "clientId" TEXT,
    "totalCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cluster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cluster_name_idx" ON "public"."Cluster"("name");

-- CreateIndex
CREATE INDEX "Cluster_clientId_idx" ON "public"."Cluster"("clientId");

-- CreateIndex
CREATE INDEX "Shoot_clusterId_idx" ON "public"."Shoot"("clusterId");

-- CreateIndex
CREATE INDEX "Shoot_workflowType_idx" ON "public"."Shoot"("workflowType");

-- AddForeignKey
ALTER TABLE "public"."Shoot" ADD CONSTRAINT "Shoot_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "public"."Cluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
