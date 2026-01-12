import prisma from "./prisma";
import { MediaType } from "../generated/prisma";

export interface TestRunInput {
  testPath: string;
  project: string;
  passed: number;
  failed: number;
  duration?: number;
  screenshots: string[];
  videos: string[];
  errors: string[];
  legacyId?: number;
}

/**
 * Find or create a project in the database
 */
export async function findOrCreateProject(
  name: string,
  url?: string,
  favicon?: string
) {
  const existing = await prisma.project.findUnique({
    where: { name },
  });

  if (existing) {
    return existing;
  }

  return prisma.project.create({
    data: {
      name,
      url: url || `https://${name}.com`,
      favicon,
    },
  });
}

/**
 * Create a new test run with related media and errors
 */
export async function createTestRun(input: TestRunInput) {
  // Find or create the project
  const project = await findOrCreateProject(input.project);

  // Create the test run with all related data
  return prisma.testRun.create({
    data: {
      testPath: input.testPath,
      passed: input.passed,
      failed: input.failed,
      duration: input.duration,
      legacyId: input.legacyId ? BigInt(input.legacyId) : undefined,
      projectId: project.id,
      media: {
        create: [
          ...input.screenshots.map((url) => ({
            type: MediaType.SCREENSHOT,
            url,
            fileName: url.split("/").pop() || "",
          })),
          ...input.videos.map((url) => ({
            type: MediaType.VIDEO,
            url,
            fileName: url.split("/").pop() || "",
          })),
        ],
      },
      errors: {
        create: input.errors.map((message) => ({
          message,
        })),
      },
    },
    include: {
      project: true,
      media: true,
      errors: true,
    },
  });
}

/**
 * Get test history with pagination
 */
export async function getTestHistory(
  projectName?: string,
  limit = 50,
  offset = 0
) {
  const where = projectName
    ? {
        project: {
          name: projectName,
        },
      }
    : {};

  return prisma.testRun.findMany({
    where,
    include: {
      project: true,
      media: true,
      errors: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: offset,
  });
}

/**
 * Get a single test run by ID
 */
export async function getTestRun(id: string) {
  return prisma.testRun.findUnique({
    where: { id },
    include: {
      project: true,
      media: true,
      errors: true,
    },
  });
}

/**
 * Get test statistics for a project
 */
export async function getProjectStats(projectName: string) {
  const project = await prisma.project.findUnique({
    where: { name: projectName },
    include: {
      testRuns: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!project) {
    return null;
  }

  const totalRuns = await prisma.testRun.count({
    where: { projectId: project.id },
  });

  const passedRuns = await prisma.testRun.count({
    where: {
      projectId: project.id,
      failed: 0,
    },
  });

  return {
    project,
    totalRuns,
    passedRuns,
    failedRuns: totalRuns - passedRuns,
    successRate: totalRuns > 0 ? (passedRuns / totalRuns) * 100 : 0,
  };
}

/**
 * Delete old test runs (keep only the last N runs)
 */
export async function cleanupOldTestRuns(projectName: string, keep = 100) {
  const project = await prisma.project.findUnique({
    where: { name: projectName },
  });

  if (!project) {
    return 0;
  }

  // Find the IDs of runs to keep
  const runsToKeep = await prisma.testRun.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
    take: keep,
    select: { id: true },
  });

  const keepIds = runsToKeep.map((r) => r.id);

  // Delete runs not in the keep list
  const result = await prisma.testRun.deleteMany({
    where: {
      projectId: project.id,
      id: {
        notIn: keepIds,
      },
    },
  });

  return result.count;
}
