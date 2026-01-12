/**
 * Clarity Database Service
 * Handles saving and retrieving Clarity analytics data from PostgreSQL
 */

import { prisma } from "@/lib/prisma";
import type { ClaritySnapshot } from "./clarity";

/**
 * Save a Clarity snapshot to the database
 */
export async function saveClaritySnapshot(snapshot: ClaritySnapshot) {
  const date = new Date(snapshot.date);

  // Use transaction to ensure all data is saved atomically
  return await prisma.$transaction(async (tx) => {
    // Upsert the main snapshot (update if exists, create if not)
    const dbSnapshot = await tx.claritySnapshot.upsert({
      where: { date },
      update: {
        sessions: snapshot.totals.sessions,
        distinctUsers: snapshot.totals.distinctUsers,
        engagementTimeAvg: snapshot.totals.engagementTimeAvg,
        scrollDepthAvg: snapshot.totals.scrollDepthAvg,
        rageClicks: snapshot.totals.rageClicks,
        deadClicks: snapshot.totals.deadClicks,
        quickBackClicks: snapshot.totals.quickBackClicks,
        excessiveScrolls: snapshot.totals.excessiveScrolls,
        scriptErrors: snapshot.totals.scriptErrors,
        errorClicks: snapshot.totals.errorClicks,
      },
      create: {
        date,
        sessions: snapshot.totals.sessions,
        distinctUsers: snapshot.totals.distinctUsers,
        engagementTimeAvg: snapshot.totals.engagementTimeAvg,
        scrollDepthAvg: snapshot.totals.scrollDepthAvg,
        rageClicks: snapshot.totals.rageClicks,
        deadClicks: snapshot.totals.deadClicks,
        quickBackClicks: snapshot.totals.quickBackClicks,
        excessiveScrolls: snapshot.totals.excessiveScrolls,
        scriptErrors: snapshot.totals.scriptErrors,
        errorClicks: snapshot.totals.errorClicks,
      },
    });

    // Delete old related data to replace with new
    await Promise.all([
      tx.clarityDevice.deleteMany({ where: { snapshotId: dbSnapshot.id } }),
      tx.clarityBrowser.deleteMany({ where: { snapshotId: dbSnapshot.id } }),
      tx.clarityOS.deleteMany({ where: { snapshotId: dbSnapshot.id } }),
      tx.clarityCountry.deleteMany({ where: { snapshotId: dbSnapshot.id } }),
      tx.claritySource.deleteMany({ where: { snapshotId: dbSnapshot.id } }),
      tx.clarityChannel.deleteMany({ where: { snapshotId: dbSnapshot.id } }),
      tx.clarityPage.deleteMany({ where: { snapshotId: dbSnapshot.id } }),
      tx.clarityReferrer.deleteMany({ where: { snapshotId: dbSnapshot.id } }),
    ]);

    // Save devices
    if (Object.keys(snapshot.byDevice).length > 0) {
      await tx.clarityDevice.createMany({
        data: Object.entries(snapshot.byDevice).map(([deviceType, sessions]) => ({
          snapshotId: dbSnapshot.id,
          deviceType,
          sessions,
        })),
      });
    }

    // Save browsers
    if (Object.keys(snapshot.byBrowser).length > 0) {
      await tx.clarityBrowser.createMany({
        data: Object.entries(snapshot.byBrowser).map(([browserName, sessions]) => ({
          snapshotId: dbSnapshot.id,
          browserName,
          sessions,
        })),
      });
    }

    // Save OS
    if (Object.keys(snapshot.byOS).length > 0) {
      await tx.clarityOS.createMany({
        data: Object.entries(snapshot.byOS).map(([osName, sessions]) => ({
          snapshotId: dbSnapshot.id,
          osName,
          sessions,
        })),
      });
    }

    // Save countries
    if (Object.keys(snapshot.byCountry).length > 0) {
      await tx.clarityCountry.createMany({
        data: Object.entries(snapshot.byCountry).map(([countryCode, sessions]) => ({
          snapshotId: dbSnapshot.id,
          countryCode,
          sessions,
        })),
      });
    }

    // Save sources
    if (Object.keys(snapshot.bySource).length > 0) {
      await tx.claritySource.createMany({
        data: Object.entries(snapshot.bySource).map(([sourceName, sessions]) => ({
          snapshotId: dbSnapshot.id,
          sourceName,
          sessions,
        })),
      });
    }

    // Save channels
    if (Object.keys(snapshot.byChannel).length > 0) {
      await tx.clarityChannel.createMany({
        data: Object.entries(snapshot.byChannel).map(([channelName, sessions]) => ({
          snapshotId: dbSnapshot.id,
          channelName,
          sessions,
        })),
      });
    }

    // Save pages
    if (snapshot.topPages.length > 0) {
      await tx.clarityPage.createMany({
        data: snapshot.topPages.map((page) => ({
          snapshotId: dbSnapshot.id,
          url: page.url,
          pageTitle: page.pageTitle || null,
          sessions: page.sessions,
        })),
      });
    }

    // Save referrers
    if (snapshot.topReferrers.length > 0) {
      await tx.clarityReferrer.createMany({
        data: snapshot.topReferrers.map((referrer) => ({
          snapshotId: dbSnapshot.id,
          url: referrer.url,
          sessions: referrer.sessions,
        })),
      });
    }

    return dbSnapshot;
  });
}

/**
 * Get all snapshots from the database
 */
export async function getClaritySnapshots(limit = 30): Promise<ClaritySnapshot[]> {
  const snapshots = await prisma.claritySnapshot.findMany({
    take: limit,
    orderBy: { date: "desc" },
    include: {
      devices: true,
      browsers: true,
      operatingSystems: true,
      countries: true,
      sources: true,
      channels: true,
      pages: { orderBy: { sessions: "desc" }, take: 10 },
      referrers: { orderBy: { sessions: "desc" }, take: 10 },
    },
  });

  // Transform database records to ClaritySnapshot format
  return snapshots.map((snap) => ({
    date: snap.date.toISOString().slice(0, 10),
    totals: {
      sessions: snap.sessions,
      distinctUsers: snap.distinctUsers,
      engagementTimeAvg: snap.engagementTimeAvg,
      scrollDepthAvg: snap.scrollDepthAvg,
      rageClicks: snap.rageClicks,
      deadClicks: snap.deadClicks,
      quickBackClicks: snap.quickBackClicks,
      excessiveScrolls: snap.excessiveScrolls,
      scriptErrors: snap.scriptErrors,
      errorClicks: snap.errorClicks,
    },
    byDevice: snap.devices.reduce(
      (acc, d) => ({ ...acc, [d.deviceType]: d.sessions }),
      {} as Record<string, number>
    ),
    byBrowser: snap.browsers.reduce(
      (acc, b) => ({ ...acc, [b.browserName]: b.sessions }),
      {} as Record<string, number>
    ),
    byOS: snap.operatingSystems.reduce(
      (acc, os) => ({ ...acc, [os.osName]: os.sessions }),
      {} as Record<string, number>
    ),
    byCountry: snap.countries.reduce(
      (acc, c) => ({ ...acc, [c.countryCode]: c.sessions }),
      {} as Record<string, number>
    ),
    bySource: snap.sources.reduce(
      (acc, s) => ({ ...acc, [s.sourceName]: s.sessions }),
      {} as Record<string, number>
    ),
    byChannel: snap.channels.reduce(
      (acc, ch) => ({ ...acc, [ch.channelName]: ch.sessions }),
      {} as Record<string, number>
    ),
    topPages: snap.pages.map((p) => ({
      url: p.url,
      sessions: p.sessions,
      pageTitle: p.pageTitle || undefined,
    })),
    topReferrers: snap.referrers.map((r) => ({
      url: r.url,
      sessions: r.sessions,
    })),
  }));
}

/**
 * Get the latest snapshot
 */
export async function getLatestClaritySnapshot(): Promise<ClaritySnapshot | null> {
  const snapshots = await getClaritySnapshots(1);
  return snapshots[0] || null;
}

/**
 * Delete old snapshots (keep only last N days)
 */
export async function cleanupOldSnapshots(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const deleted = await prisma.claritySnapshot.deleteMany({
    where: {
      date: {
        lt: cutoffDate,
      },
    },
  });

  return deleted.count;
}

/**
 * Get snapshot for a specific date
 */
export async function getClaritySnapshotByDate(date: string): Promise<ClaritySnapshot | null> {
  const snapshot = await prisma.claritySnapshot.findUnique({
    where: { date: new Date(date) },
    include: {
      devices: true,
      browsers: true,
      operatingSystems: true,
      countries: true,
      sources: true,
      channels: true,
      pages: { orderBy: { sessions: "desc" }, take: 10 },
      referrers: { orderBy: { sessions: "desc" }, take: 10 },
    },
  });

  if (!snapshot) return null;

  return {
    date: snapshot.date.toISOString().slice(0, 10),
    totals: {
      sessions: snapshot.sessions,
      distinctUsers: snapshot.distinctUsers,
      engagementTimeAvg: snapshot.engagementTimeAvg,
      scrollDepthAvg: snapshot.scrollDepthAvg,
      rageClicks: snapshot.rageClicks,
      deadClicks: snapshot.deadClicks,
      quickBackClicks: snapshot.quickBackClicks,
      excessiveScrolls: snapshot.excessiveScrolls,
      scriptErrors: snapshot.scriptErrors,
      errorClicks: snapshot.errorClicks,
    },
    byDevice: snapshot.devices.reduce(
      (acc, d) => ({ ...acc, [d.deviceType]: d.sessions }),
      {} as Record<string, number>
    ),
    byBrowser: snapshot.browsers.reduce(
      (acc, b) => ({ ...acc, [b.browserName]: b.sessions }),
      {} as Record<string, number>
    ),
    byOS: snapshot.operatingSystems.reduce(
      (acc, os) => ({ ...acc, [os.osName]: os.sessions }),
      {} as Record<string, number>
    ),
    byCountry: snapshot.countries.reduce(
      (acc, c) => ({ ...acc, [c.countryCode]: c.sessions }),
      {} as Record<string, number>
    ),
    bySource: snapshot.sources.reduce(
      (acc, s) => ({ ...acc, [s.sourceName]: s.sessions }),
      {} as Record<string, number>
    ),
    byChannel: snapshot.channels.reduce(
      (acc, ch) => ({ ...acc, [ch.channelName]: ch.sessions }),
      {} as Record<string, number>
    ),
    topPages: snapshot.pages.map((p) => ({
      url: p.url,
      sessions: p.sessions,
      pageTitle: p.pageTitle || undefined,
    })),
    topReferrers: snapshot.referrers.map((r) => ({
      url: r.url,
      sessions: r.sessions,
    })),
  };
}

/**
 * Check if we have a snapshot for today
 */
export async function hasSnapshotForToday(): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const snapshot = await prisma.claritySnapshot.findUnique({
    where: { date: today },
    select: { id: true },
  });

  return !!snapshot;
}

/**
 * Get total number of API calls made today (by checking if snapshot exists)
 */
export async function getApiCallsToday(): Promise<number> {
  const hasSnapshot = await hasSnapshotForToday();
  // Each snapshot creation uses 2-5 API calls depending on strategy
  // For now, we return 1 if snapshot exists (meaning API was called)
  return hasSnapshot ? 1 : 0;
}
