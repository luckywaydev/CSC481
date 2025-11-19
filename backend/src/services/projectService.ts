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

  // Generate slug from name (รองรับภาษาไทยและ Unicode)
  let baseSlug = name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Remove special characters but keep Unicode letters and numbers
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();

  // ถ้า slug ว่างเปล่า (เช่น ชื่อเป็นตัวเลขหรือสัญลักษณ์อย่างเดียว) ให้ใช้ project เป็น default
  if (!baseSlug) {
    baseSlug = 'project';
  }

  // เพิ่ม random string เพื่อให้ unique เสมอ (6 ตัวอักษร)
  const randomString = Math.random().toString(36).substring(2, 8);
  const finalSlug = `${baseSlug}-${randomString}`;

  // Create project
  return await prisma.project.create({
    data: {
      userId,
      name,
      slug: finalSlug,
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

  // Get projects with audio files count and status
  const projects = await prisma.project.findMany({
    where,
    include: {
      _count: {
        select: {
          audioFiles: true,
        },
      },
      audioFiles: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          status: true,
          transcripts: {
            select: {
              id: true,
            },
            take: 1,
          },
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
            include: {
              segments: {
                orderBy: {
                  segmentIndex: 'asc',
                },
                include: {
                  speaker: true,
                },
              },
              speakers: {
                orderBy: {
                  displayOrder: 'asc',
                },
              },
            },
            orderBy: {
              createdAt: 'asc', // เรียงตาม createdAt เพื่อให้ transcript ต้นทางมาก่อน แล้วตามด้วยแปลภาษา
            },
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

    // Generate new slug (รองรับภาษาไทยและ Unicode)
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
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
