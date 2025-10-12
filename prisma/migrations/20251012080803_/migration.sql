/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Editor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Photographer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShootEditor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShootPhotographer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ShootEditor" DROP CONSTRAINT "ShootEditor_editorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ShootEditor" DROP CONSTRAINT "ShootEditor_shootId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ShootPhotographer" DROP CONSTRAINT "ShootPhotographer_photographerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ShootPhotographer" DROP CONSTRAINT "ShootPhotographer_shootId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "roles" TEXT[] DEFAULT ARRAY['admin']::TEXT[],
ADD COLUMN     "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "public"."Editor";

-- DropTable
DROP TABLE "public"."Photographer";

-- DropTable
DROP TABLE "public"."ShootEditor";

-- DropTable
DROP TABLE "public"."ShootPhotographer";

-- CreateTable
CREATE TABLE "public"."ShootTeamMember" (
    "id" TEXT NOT NULL,
    "shootId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignmentType" TEXT NOT NULL,
    "role" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShootTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShootTeamMember_shootId_idx" ON "public"."ShootTeamMember"("shootId");

-- CreateIndex
CREATE INDEX "ShootTeamMember_userId_idx" ON "public"."ShootTeamMember"("userId");

-- CreateIndex
CREATE INDEX "ShootTeamMember_assignmentType_idx" ON "public"."ShootTeamMember"("assignmentType");

-- CreateIndex
CREATE UNIQUE INDEX "ShootTeamMember_shootId_userId_assignmentType_key" ON "public"."ShootTeamMember"("shootId", "userId", "assignmentType");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "public"."User"("isActive");

-- AddForeignKey
ALTER TABLE "public"."ShootTeamMember" ADD CONSTRAINT "ShootTeamMember_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES "public"."Shoot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShootTeamMember" ADD CONSTRAINT "ShootTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
