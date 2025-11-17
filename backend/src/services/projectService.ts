/**
 * ไฟล์: projectService.ts
 *
 * คำอธิบาย:
 * Service สำหรับจัดการ Projects
 * - สร้าง project ใหม่
 * - ดึงรายการ projects
 * - ดึง project detail
 * - แก้ไข project
 * - ลบ project
 *
 * Author: Backend Team
 * Created: 2024-11-17
 */

import { prisma } from '../utils/prisma';
import { sanitizeString } from '../utils/validation';

/**
 * Interface สำหรับ create project input
 */
export interface CreateProjectInput {
  name: string;
  description?: string;
}

/**
 * Interface สำหรับ update project input
 */
export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

/**
 * สร้าง project ใหม่
 */
export async function createProject(userId: string, data: CreateProjectInput) {
  // Sanitize input
  const name = sanitizeString(data.name);
  const description = data.description ? sanitizeString(data.description) : null;

  // Validate
  if (!name) {
    throw new Error('Project name is required');
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();

  // Check if slug already exists for this user
  const existingProject = await prisma.project.findFirst({
    where: {
      userId,
      slug,
      deletedAt: null,
    },
  });

  if (existingProject) {
    // Add timestamp to make it unique
    const uniqueSlug = `${slug}-${Date.now()}`;
    return await prisma.project.create({
      data: {
        userId,
        name,
        slug: uniqueSlug,
        description,
      },
    });
  }

  // Create project
  return await prisma.project.create({
    data: {
      userId,
      name,
      slug,
      description,
    },
  });
}

/**
 * ดึงรายการ projects ของ user
 */
export async function getProjects(userId: string, options?: {
  search?: string;
  isArchived?: boolean;
  limit?: number;
  offset?: number;
}) {
  const where: any = {
    userId,
    deletedAt: null,
  };

  // Filter by archived status
  if (options?.isArchived !== undefined) {
    where.isArchived = options.isArchived;
  }

  // Search by name
  if (options?.search) {
    where.name = {
      contains: options.search,
      mode: 'insensitive',
    };
  }

  // Get projects with audio files count
  const projects = await prisma.project.findMany({
    where,
    include: {
      _count: {
        select: {
          audioFiles: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: options?.limit,
    skip: options?.offset,
  });

  return projects;
}

/**
 * ดึง project detail พร้อม audio files
 */
export async function getProjectById(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
      deletedAt: null,
    },
    include: {
      audioFiles: {
        where: {
          deletedAt: null,
        },
        include: {
          transcripts: {
            select: {
              id: true,
              language: true,
              wordCount: true,
              createdAt: true,
            },
            take: 1, // เอาแค่ตัวแรก
          },
        },
        orderBy: {
          uploadedAt: 'desc',
        },
      },
      _count: {
        select: {
          audioFiles: true,
        },
      },
    },
  });

  return project;
}

/**
 * แก้ไข project
 */
export async function updateProject(
  projectId: string,
  userId: string,
  data: UpdateProjectInput
) {
  // Check ownership
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Prepare update data
  const updateData: any = {};

  if (data.name) {
    const name = sanitizeString(data.name);
    updateData.name = name;

    // Generate new slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    updateData.slug = slug;
  }

  if (data.description !== undefined) {
    updateData.description = data.description
      ? sanitizeString(data.description)
      : null;
  }

  // Update project
  return await prisma.project.update({
    where: { id: projectId },
    data: updateData,
  });
}

/**
 * ลบ project (soft delete)
 */
export async function deleteProject(projectId: string, userId: string) {
  // Check ownership
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Soft delete project
  await prisma.project.update({
    where: { id: projectId },
    data: {
      deletedAt: new Date(),
    },
  });

  // Soft delete related audio files
  await prisma.audioFile.updateMany({
    where: {
      projectId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return { success: true };
}

/**
 * Archive/Unarchive project
 */
export async function toggleArchiveProject(
  projectId: string,
  userId: string,
  isArchived: boolean
) {
  // Check ownership
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Update archive status
  return await prisma.project.update({
    where: { id: projectId },
    data: { isArchived },
  });
}
