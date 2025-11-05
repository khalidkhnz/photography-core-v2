-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "pocName" TEXT,
    "pocEmail" TEXT,
    "pocPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Entity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShootType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShootType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "coordinates" TEXT,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LocationPOC" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "role" TEXT,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationPOC_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."Shoot" (
    "id" TEXT NOT NULL,
    "shootId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "entityId" TEXT,
    "locationId" TEXT,
    "clusterId" TEXT,
    "shootTypeId" TEXT NOT NULL,
    "projectName" TEXT,
    "remarks" TEXT,
    "overallDeliverables" TEXT,
    "scheduledShootDate" TIMESTAMP(3),
    "reportingTime" TEXT,
    "wrapUpTime" TEXT,
    "photographerNotes" TEXT,
    "workflowType" TEXT NOT NULL DEFAULT 'shift',
    "shootCost" DOUBLE PRECISION,
    "travelCost" DOUBLE PRECISION,
    "shootCostStatus" TEXT,
    "travelCostStatus" TEXT,
    "overallCost" DOUBLE PRECISION,
    "overallCostStatus" TEXT,
    "dopId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shoot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShootExecutor" (
    "id" TEXT NOT NULL,
    "shootId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShootExecutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Edit" (
    "id" TEXT NOT NULL,
    "editId" TEXT NOT NULL,
    "shootId" TEXT,
    "deliverables" TEXT,
    "editDeliveryDate" TIMESTAMP(3),
    "editorNotes" TEXT,
    "editCost" DOUBLE PRECISION,
    "editCostStatus" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Edit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EditEditor" (
    "id" TEXT NOT NULL,
    "editId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditEditor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "roles" TEXT[] DEFAULT ARRAY['admin']::TEXT[],
    "phone" TEXT,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rating" DOUBLE PRECISION DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minAmount" DOUBLE PRECISION,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "Client_name_idx" ON "public"."Client"("name");

-- CreateIndex
CREATE INDEX "Client_pocEmail_idx" ON "public"."Client"("pocEmail");

-- CreateIndex
CREATE INDEX "Entity_name_idx" ON "public"."Entity"("name");

-- CreateIndex
CREATE INDEX "Entity_clientId_idx" ON "public"."Entity"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ShootType_name_key" ON "public"."ShootType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShootType_code_key" ON "public"."ShootType"("code");

-- CreateIndex
CREATE INDEX "ShootType_name_idx" ON "public"."ShootType"("name");

-- CreateIndex
CREATE INDEX "ShootType_code_idx" ON "public"."ShootType"("code");

-- CreateIndex
CREATE INDEX "Location_city_idx" ON "public"."Location"("city");

-- CreateIndex
CREATE INDEX "Location_clientId_idx" ON "public"."Location"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_clientId_key" ON "public"."Location"("name", "clientId");

-- CreateIndex
CREATE INDEX "LocationPOC_name_idx" ON "public"."LocationPOC"("name");

-- CreateIndex
CREATE INDEX "LocationPOC_locationId_idx" ON "public"."LocationPOC"("locationId");

-- CreateIndex
CREATE INDEX "Cluster_name_idx" ON "public"."Cluster"("name");

-- CreateIndex
CREATE INDEX "Cluster_clientId_idx" ON "public"."Cluster"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Shoot_shootId_key" ON "public"."Shoot"("shootId");

-- CreateIndex
CREATE INDEX "Shoot_shootId_idx" ON "public"."Shoot"("shootId");

-- CreateIndex
CREATE INDEX "Shoot_clientId_idx" ON "public"."Shoot"("clientId");

-- CreateIndex
CREATE INDEX "Shoot_entityId_idx" ON "public"."Shoot"("entityId");

-- CreateIndex
CREATE INDEX "Shoot_locationId_idx" ON "public"."Shoot"("locationId");

-- CreateIndex
CREATE INDEX "Shoot_shootTypeId_idx" ON "public"."Shoot"("shootTypeId");

-- CreateIndex
CREATE INDEX "Shoot_dopId_idx" ON "public"."Shoot"("dopId");

-- CreateIndex
CREATE INDEX "Shoot_status_idx" ON "public"."Shoot"("status");

-- CreateIndex
CREATE INDEX "Shoot_scheduledShootDate_idx" ON "public"."Shoot"("scheduledShootDate");

-- CreateIndex
CREATE INDEX "Shoot_projectName_idx" ON "public"."Shoot"("projectName");

-- CreateIndex
CREATE INDEX "Shoot_clusterId_idx" ON "public"."Shoot"("clusterId");

-- CreateIndex
CREATE INDEX "Shoot_workflowType_idx" ON "public"."Shoot"("workflowType");

-- CreateIndex
CREATE INDEX "ShootExecutor_shootId_idx" ON "public"."ShootExecutor"("shootId");

-- CreateIndex
CREATE INDEX "ShootExecutor_userId_idx" ON "public"."ShootExecutor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShootExecutor_shootId_userId_key" ON "public"."ShootExecutor"("shootId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Edit_editId_key" ON "public"."Edit"("editId");

-- CreateIndex
CREATE INDEX "Edit_editId_idx" ON "public"."Edit"("editId");

-- CreateIndex
CREATE INDEX "Edit_shootId_idx" ON "public"."Edit"("shootId");

-- CreateIndex
CREATE INDEX "Edit_status_idx" ON "public"."Edit"("status");

-- CreateIndex
CREATE INDEX "Edit_editDeliveryDate_idx" ON "public"."Edit"("editDeliveryDate");

-- CreateIndex
CREATE INDEX "EditEditor_editId_idx" ON "public"."EditEditor"("editId");

-- CreateIndex
CREATE INDEX "EditEditor_userId_idx" ON "public"."EditEditor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EditEditor_editId_userId_key" ON "public"."EditEditor"("editId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "public"."User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "public"."Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_idx" ON "public"."Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_isActive_idx" ON "public"."Coupon"("isActive");

-- CreateIndex
CREATE INDEX "Coupon_validFrom_idx" ON "public"."Coupon"("validFrom");

-- CreateIndex
CREATE INDEX "Coupon_validUntil_idx" ON "public"."Coupon"("validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."Entity" ADD CONSTRAINT "Entity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LocationPOC" ADD CONSTRAINT "LocationPOC_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shoot" ADD CONSTRAINT "Shoot_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shoot" ADD CONSTRAINT "Shoot_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shoot" ADD CONSTRAINT "Shoot_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shoot" ADD CONSTRAINT "Shoot_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "public"."Cluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shoot" ADD CONSTRAINT "Shoot_shootTypeId_fkey" FOREIGN KEY ("shootTypeId") REFERENCES "public"."ShootType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shoot" ADD CONSTRAINT "Shoot_dopId_fkey" FOREIGN KEY ("dopId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShootExecutor" ADD CONSTRAINT "ShootExecutor_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES "public"."Shoot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShootExecutor" ADD CONSTRAINT "ShootExecutor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Edit" ADD CONSTRAINT "Edit_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES "public"."Shoot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EditEditor" ADD CONSTRAINT "EditEditor_editId_fkey" FOREIGN KEY ("editId") REFERENCES "public"."Edit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EditEditor" ADD CONSTRAINT "EditEditor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
