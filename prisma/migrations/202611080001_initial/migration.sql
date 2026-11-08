-- CreateSchema
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CITIZEN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING_MODERATION', 'PUBLISHED', 'UNDER_REVIEW', 'SOLUTION_REPORTED', 'SOLUTION_VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CITIZEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "location" geography(Point,4326) NOT NULL,
    "coverage" TEXT NOT NULL DEFAULT 'naranjos-amatlan',
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING_MODERATION',
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportImage" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportEvent" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "fromStatus" "ReportStatus",
    "toStatus" "ReportStatus" NOT NULL,
    "reason" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportConfirmation" (
    "reportId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportConfirmation_pkey" PRIMARY KEY ("reportId","userId")
);

-- CreateTable
CREATE TABLE "ModerationDecision" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "moderatorId" UUID NOT NULL,
    "outcome" "ReportStatus" NOT NULL,
    "reason" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationDecision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Report_authorId_idx" ON "Report"("authorId");

CREATE INDEX "Report_location_gist_idx" ON "Report" USING GIST ("location");
ALTER TABLE "Report" ADD CONSTRAINT "Report_version_nonnegative" CHECK ("version" >= 0);
ALTER TABLE "ReportImage" ADD CONSTRAINT "ReportImage_size_valid" CHECK ("byteSize" > 0 AND "byteSize" <= 5242880);
ALTER TABLE "ReportImage" ADD CONSTRAINT "ReportImage_type_valid" CHECK ("mimeType" IN ('image/jpeg', 'image/png', 'image/webp'));
ALTER TABLE "ModerationDecision" ADD CONSTRAINT "ModerationDecision_outcome_valid" CHECK ("outcome" IN ('PUBLISHED', 'REJECTED'));
ALTER TABLE "ModerationDecision" ADD CONSTRAINT "ModerationDecision_reason_valid" CHECK (length(trim("reason")) BETWEEN 10 AND 1000);

-- Append-only audit. Exceptional privacy removals require a privileged, audited procedure.
CREATE FUNCTION prevent_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Audit records are immutable';
END;
$$;
CREATE TRIGGER report_event_immutable BEFORE UPDATE OR DELETE ON "ReportEvent"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
CREATE TRIGGER moderation_decision_immutable BEFORE UPDATE OR DELETE ON "ModerationDecision"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();

-- CreateIndex
CREATE UNIQUE INDEX "ReportImage_storageKey_key" ON "ReportImage"("storageKey");

-- CreateIndex
CREATE INDEX "ReportEvent_reportId_createdAt_idx" ON "ReportEvent"("reportId", "createdAt");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportImage" ADD CONSTRAINT "ReportImage_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportEvent" ADD CONSTRAINT "ReportEvent_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportEvent" ADD CONSTRAINT "ReportEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportConfirmation" ADD CONSTRAINT "ReportConfirmation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportConfirmation" ADD CONSTRAINT "ReportConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationDecision" ADD CONSTRAINT "ModerationDecision_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationDecision" ADD CONSTRAINT "ModerationDecision_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
