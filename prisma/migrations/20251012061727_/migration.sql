-- AlterTable
ALTER TABLE "public"."Shoot" ADD COLUMN     "editId" TEXT,
ADD COLUMN     "editingCost" DOUBLE PRECISION,
ADD COLUMN     "photographyCost" DOUBLE PRECISION,
ADD COLUMN     "projectName" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "travelCost" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Shoot_projectName_idx" ON "public"."Shoot"("projectName");
