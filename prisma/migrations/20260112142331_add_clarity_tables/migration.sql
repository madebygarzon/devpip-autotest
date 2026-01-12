-- CreateTable
CREATE TABLE "clarity_snapshots" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "distinctUsers" INTEGER NOT NULL DEFAULT 0,
    "engagementTimeAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scrollDepthAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rageClicks" INTEGER NOT NULL DEFAULT 0,
    "deadClicks" INTEGER NOT NULL DEFAULT 0,
    "quickBackClicks" INTEGER NOT NULL DEFAULT 0,
    "excessiveScrolls" INTEGER NOT NULL DEFAULT 0,
    "scriptErrors" INTEGER NOT NULL DEFAULT 0,
    "errorClicks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clarity_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarity_devices" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clarity_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarity_browsers" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "browserName" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clarity_browsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarity_os" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "osName" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clarity_os_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarity_countries" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clarity_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarity_sources" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clarity_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarity_channels" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clarity_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarity_pages" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pageTitle" TEXT,
    "sessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clarity_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarity_referrers" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "clarity_referrers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clarity_snapshots_date_key" ON "clarity_snapshots"("date");

-- CreateIndex
CREATE INDEX "clarity_snapshots_date_idx" ON "clarity_snapshots"("date" DESC);

-- CreateIndex
CREATE INDEX "clarity_devices_snapshotId_idx" ON "clarity_devices"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "clarity_devices_snapshotId_deviceType_key" ON "clarity_devices"("snapshotId", "deviceType");

-- CreateIndex
CREATE INDEX "clarity_browsers_snapshotId_idx" ON "clarity_browsers"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "clarity_browsers_snapshotId_browserName_key" ON "clarity_browsers"("snapshotId", "browserName");

-- CreateIndex
CREATE INDEX "clarity_os_snapshotId_idx" ON "clarity_os"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "clarity_os_snapshotId_osName_key" ON "clarity_os"("snapshotId", "osName");

-- CreateIndex
CREATE INDEX "clarity_countries_snapshotId_idx" ON "clarity_countries"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "clarity_countries_snapshotId_countryCode_key" ON "clarity_countries"("snapshotId", "countryCode");

-- CreateIndex
CREATE INDEX "clarity_sources_snapshotId_idx" ON "clarity_sources"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "clarity_sources_snapshotId_sourceName_key" ON "clarity_sources"("snapshotId", "sourceName");

-- CreateIndex
CREATE INDEX "clarity_channels_snapshotId_idx" ON "clarity_channels"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "clarity_channels_snapshotId_channelName_key" ON "clarity_channels"("snapshotId", "channelName");

-- CreateIndex
CREATE INDEX "clarity_pages_snapshotId_idx" ON "clarity_pages"("snapshotId");

-- CreateIndex
CREATE INDEX "clarity_pages_sessions_idx" ON "clarity_pages"("sessions" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "clarity_pages_snapshotId_url_key" ON "clarity_pages"("snapshotId", "url");

-- CreateIndex
CREATE INDEX "clarity_referrers_snapshotId_idx" ON "clarity_referrers"("snapshotId");

-- CreateIndex
CREATE INDEX "clarity_referrers_sessions_idx" ON "clarity_referrers"("sessions" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "clarity_referrers_snapshotId_url_key" ON "clarity_referrers"("snapshotId", "url");

-- AddForeignKey
ALTER TABLE "clarity_devices" ADD CONSTRAINT "clarity_devices_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "clarity_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarity_browsers" ADD CONSTRAINT "clarity_browsers_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "clarity_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarity_os" ADD CONSTRAINT "clarity_os_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "clarity_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarity_countries" ADD CONSTRAINT "clarity_countries_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "clarity_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarity_sources" ADD CONSTRAINT "clarity_sources_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "clarity_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarity_channels" ADD CONSTRAINT "clarity_channels_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "clarity_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarity_pages" ADD CONSTRAINT "clarity_pages_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "clarity_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarity_referrers" ADD CONSTRAINT "clarity_referrers_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "clarity_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
