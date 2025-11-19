-- AlterTable
ALTER TABLE "public"."Edit" ADD COLUMN     "clusterId" TEXT;

-- CreateIndex
CREATE INDEX "Edit_clusterId_idx" ON "public"."Edit"("clusterId");

-- AddForeignKey
ALTER TABLE "public"."Edit" ADD CONSTRAINT "Edit_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "public"."Cluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
