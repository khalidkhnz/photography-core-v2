-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
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
    "clientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Photographer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "specialties" TEXT[],
    "rating" DOUBLE PRECISION DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photographer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Editor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "specialties" TEXT[],
    "rating" DOUBLE PRECISION DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Editor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shoot" (
    "id" TEXT NOT NULL,
    "shootId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "shootTypeId" TEXT NOT NULL,
    "locationId" TEXT,
    "overallDeliverables" TEXT,
    "shootStartDate" TIMESTAMP(3),
    "shootEndDate" TIMESTAMP(3),
    "photographerNotes" TEXT,
    "editorNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shoot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShootPhotographer" (
    "id" TEXT NOT NULL,
    "shootId" TEXT NOT NULL,
    "photographerId" TEXT NOT NULL,
    "role" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShootPhotographer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShootEditor" (
    "id" TEXT NOT NULL,
    "shootId" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "role" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShootEditor_pkey" PRIMARY KEY ("id")
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
    "role" TEXT NOT NULL DEFAULT 'admin',

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
CREATE UNIQUE INDEX "Client_email_key" ON "public"."Client"("email");

-- CreateIndex
CREATE INDEX "Client_name_idx" ON "public"."Client"("name");

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
CREATE UNIQUE INDEX "Photographer_email_key" ON "public"."Photographer"("email");

-- CreateIndex
CREATE INDEX "Photographer_name_idx" ON "public"."Photographer"("name");

-- CreateIndex
CREATE INDEX "Photographer_isActive_idx" ON "public"."Photographer"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Editor_email_key" ON "public"."Editor"("email");

-- CreateIndex
CREATE INDEX "Editor_name_idx" ON "public"."Editor"("name");

-- CreateIndex
CREATE INDEX "Editor_isActive_idx" ON "public"."Editor"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Shoot_shootId_key" ON "public"."Shoot"("shootId");

-- CreateIndex
CREATE INDEX "Shoot_shootId_idx" ON "public"."Shoot"("shootId");

-- CreateIndex
CREATE INDEX "Shoot_clientId_idx" ON "public"."Shoot"("clientId");

-- CreateIndex
CREATE INDEX "Shoot_shootTypeId_idx" ON "public"."Shoot"("shootTypeId");

-- CreateIndex
CREATE INDEX "Shoot_status_idx" ON "public"."Shoot"("status");

-- CreateIndex
CREATE INDEX "Shoot_shootStartDate_idx" ON "public"."Shoot"("shootStartDate");

-- CreateIndex
CREATE INDEX "ShootPhotographer_shootId_idx" ON "public"."ShootPhotographer"("shootId");

-- CreateIndex
CREATE INDEX "ShootPhotographer_photographerId_idx" ON "public"."ShootPhotographer"("photographerId");

-- CreateIndex
CREATE UNIQUE INDEX "ShootPhotographer_shootId_photographerId_key" ON "public"."ShootPhotographer"("shootId", "photographerId");

-- CreateIndex
CREATE INDEX "ShootEditor_shootId_idx" ON "public"."ShootEditor"("shootId");

-- CreateIndex
CREATE INDEX "ShootEditor_editorId_idx" ON "public"."ShootEditor"("editorId");

-- CreateIndex
CREATE UNIQUE INDEX "ShootEditor_shootId_editorId_key" ON "public"."ShootEditor"("shootId", "editorId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

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
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shoot" ADD CONSTRAINT "Shoot_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shoot" ADD CONSTRAINT "Shoot_shootTypeId_fkey" FOREIGN KEY ("shootTypeId") REFERENCES "public"."ShootType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shoot" ADD CONSTRAINT "Shoot_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShootPhotographer" ADD CONSTRAINT "ShootPhotographer_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES "public"."Shoot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShootPhotographer" ADD CONSTRAINT "ShootPhotographer_photographerId_fkey" FOREIGN KEY ("photographerId") REFERENCES "public"."Photographer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShootEditor" ADD CONSTRAINT "ShootEditor_shootId_fkey" FOREIGN KEY ("shootId") REFERENCES "public"."Shoot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShootEditor" ADD CONSTRAINT "ShootEditor_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "public"."Editor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
