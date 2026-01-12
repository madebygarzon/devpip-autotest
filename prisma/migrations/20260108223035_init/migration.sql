-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('SCREENSHOT', 'VIDEO');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "favicon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_runs" (
    "id" TEXT NOT NULL,
    "legacyId" BIGINT,
    "testPath" TEXT NOT NULL,
    "passed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "test_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_media" (
    "id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testRunId" TEXT NOT NULL,

    CONSTRAINT "test_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_errors" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testRunId" TEXT NOT NULL,

    CONSTRAINT "test_errors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_name_key" ON "projects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "test_runs_legacyId_key" ON "test_runs"("legacyId");

-- CreateIndex
CREATE INDEX "test_runs_projectId_idx" ON "test_runs"("projectId");

-- CreateIndex
CREATE INDEX "test_runs_createdAt_idx" ON "test_runs"("createdAt");

-- CreateIndex
CREATE INDEX "test_runs_testPath_idx" ON "test_runs"("testPath");

-- CreateIndex
CREATE INDEX "test_media_testRunId_idx" ON "test_media"("testRunId");

-- CreateIndex
CREATE INDEX "test_errors_testRunId_idx" ON "test_errors"("testRunId");

-- AddForeignKey
ALTER TABLE "test_runs" ADD CONSTRAINT "test_runs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_media" ADD CONSTRAINT "test_media_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "test_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_errors" ADD CONSTRAINT "test_errors_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "test_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
